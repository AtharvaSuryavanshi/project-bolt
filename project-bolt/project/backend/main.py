from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import mysql.connector
import os
import json
import time
import uvicorn

app = FastAPI(title="Blog API")

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "database": os.getenv("DB_NAME", "blog_db"),
}

# Models
class CategoryBase(BaseModel):
    name: str
    slug: str

class Category(CategoryBase):
    id: int
    count: int

class CategoryCreate(CategoryBase):
    pass

class TagBase(BaseModel):
    name: str
    slug: str

class Tag(TagBase):
    id: int
    count: int

class TagCreate(TagBase):
    pass

class Author(BaseModel):
    id: int
    name: str
    avatar: str
    
class PostBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    status: str
    categories: List[str]
    tags: List[str]

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    pass

class Post(PostBase):
    id: int
    author: Author
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    reading_time: int

# Database connection
def get_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        yield conn
    finally:
        conn.close()

# Create tables if they don't exist
def create_tables():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # Create users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            avatar VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """)
        
        # Create categories table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """)
        
        # Create tags table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tags (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """)
        
        # Create posts table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            excerpt TEXT,
            featured_image VARCHAR(255),
            status VARCHAR(20) NOT NULL DEFAULT 'draft',
            author_id INT NOT NULL,
            reading_time INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            published_at TIMESTAMP NULL,
            FOREIGN KEY (author_id) REFERENCES users(id)
        )
        """)
        
        # Create post_categories table (many-to-many)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS post_categories (
            post_id INT NOT NULL,
            category_id INT NOT NULL,
            PRIMARY KEY (post_id, category_id),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
        """)
        
        # Create post_tags table (many-to-many)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS post_tags (
            post_id INT NOT NULL,
            tag_id INT NOT NULL,
            PRIMARY KEY (post_id, tag_id),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
        """)
        
        conn.commit()
        print("Database tables created successfully")
        
    except Exception as e:
        print(f"Error creating tables: {e}")
    finally:
        cursor.close()
        conn.close()

# Initialize database
@app.on_event("startup")
async def startup_db_client():
    try:
        # Check if database exists, if not create it
        conn = mysql.connector.connect(
            host=DB_CONFIG["host"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"]
        )
        cursor = conn.cursor()
        
        # Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
        cursor.close()
        conn.close()
        
        # Create tables
        create_tables()
        
    except Exception as e:
        print(f"Database initialization error: {e}")

# Routes
@app.get("/")
async def root():
    return {"message": "Blog API"}

# Categories
@app.get("/api/categories", response_model=List[Category])
async def get_categories(db: mysql.connector.connection.MySQLConnection = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
    SELECT c.id, c.name, c.slug, COUNT(pc.post_id) as count
    FROM categories c
    LEFT JOIN post_categories pc ON c.id = pc.category_id
    GROUP BY c.id
    ORDER BY c.name
    """)
    categories = cursor.fetchall()
    cursor.close()
    return categories

@app.post("/api/categories", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, db: mysql.connector.connection.MySQLConnection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO categories (name, slug) VALUES (%s, %s)",
            (category.name, category.slug)
        )
        db.commit()
        category_id = cursor.lastrowid
        
        # Return the created category
        cursor.execute(
            "SELECT id, name, slug, 0 as count FROM categories WHERE id = %s",
            (category_id,)
        )
        new_category = cursor.fetchone()
        
        return {
            "id": new_category[0],
            "name": new_category[1],
            "slug": new_category[2],
            "count": new_category[3]
        }
    except mysql.connector.Error as e:
        db.rollback()
        if e.errno == 1062:  # Duplicate entry error
            raise HTTPException(status_code=400, detail="Category already exists")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

# Tags
@app.get("/api/tags", response_model=List[Tag])
async def get_tags(db: mysql.connector.connection.MySQLConnection = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
    SELECT t.id, t.name, t.slug, COUNT(pt.post_id) as count
    FROM tags t
    LEFT JOIN post_tags pt ON t.id = pt.tag_id
    GROUP BY t.id
    ORDER BY t.name
    """)
    tags = cursor.fetchall()
    cursor.close()
    return tags

@app.post("/api/tags", response_model=Tag, status_code=status.HTTP_201_CREATED)
async def create_tag(tag: TagCreate, db: mysql.connector.connection.MySQLConnection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO tags (name, slug) VALUES (%s, %s)",
            (tag.name, tag.slug)
        )
        db.commit()
        tag_id = cursor.lastrowid
        
        # Return the created tag
        cursor.execute(
            "SELECT id, name, slug, 0 as count FROM tags WHERE id = %s",
            (tag_id,)
        )
        new_tag = cursor.fetchone()
        
        return {
            "id": new_tag[0],
            "name": new_tag[1],
            "slug": new_tag[2],
            "count": new_tag[3]
        }
    except mysql.connector.Error as e:
        db.rollback()
        if e.errno == 1062:  # Duplicate entry error
            raise HTTPException(status_code=400, detail="Tag already exists")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

# Posts
@app.get("/api/posts", response_model=List[Post])
async def get_posts(
    status: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    db: mysql.connector.connection.MySQLConnection = Depends(get_db)
):
    cursor = db.cursor(dictionary=True)
    
    query = """
    SELECT p.*, u.id as author_id, u.name as author_name, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.author_id = u.id
    """
    
    conditions = []
    params = []
    
    if status:
        conditions.append("p.status = %s")
        params.append(status)
    
    if category:
        query += " JOIN post_categories pc ON p.id = pc.post_id JOIN categories c ON pc.category_id = c.id"
        conditions.append("c.slug = %s")
        params.append(category)
    
    if tag:
        query += " JOIN post_tags pt ON p.id = pt.post_id JOIN tags t ON pt.tag_id = t.id"
        conditions.append("t.slug = %s")
        params.append(tag)
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY p.created_at DESC"
    
    cursor.execute(query, params)
    posts_data = cursor.fetchall()
    
    # Process posts to include categories and tags
    posts = []
    for post in posts_data:
        # Get categories for this post
        cursor.execute("""
        SELECT c.name FROM categories c
        JOIN post_categories pc ON c.id = pc.category_id
        WHERE pc.post_id = %s
        """, (post["id"],))
        categories = [row[0] for row in cursor.fetchall()]
        
        # Get tags for this post
        cursor.execute("""
        SELECT t.name FROM tags t
        JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = %s
        """, (post["id"],))
        tags = [row[0] for row in cursor.fetchall()]
        
        # Create author object
        author = {
            "id": post["author_id"],
            "name": post["author_name"],
            "avatar": post["author_avatar"]
        }
        
        # Add to posts list
        posts.append({
            "id": post["id"],
            "title": post["title"],
            "content": post["content"],
            "excerpt": post["excerpt"],
            "featured_image": post["featured_image"],
            "status": post["status"],
            "author": author,
            "categories": categories,
            "tags": tags,
            "created_at": post["created_at"],
            "updated_at": post["updated_at"],
            "published_at": post["published_at"],
            "reading_time": post["reading_time"]
        })
    
    cursor.close()
    return posts

@app.get("/api/posts/{post_id}", response_model=Post)
async def get_post(post_id: int, db: mysql.connector.connection.MySQLConnection = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    
    # Get post data
    cursor.execute("""
    SELECT p.*, u.id as author_id, u.name as author_name, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.id = %s
    """, (post_id,))
    
    post = cursor.fetchone()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Get categories for this post
    cursor.execute("""
    SELECT c.name FROM categories c
    JOIN post_categories pc ON c.id = pc.category_id
    WHERE pc.post_id = %s
    """, (post_id,))
    categories = [row[0] for row in cursor.fetchall()]
    
    # Get tags for this post
    cursor.execute("""
    SELECT t.name FROM tags t
    JOIN post_tags pt ON t.id = pt.tag_id
    WHERE pt.post_id = %s
    """, (post_id,))
    tags = [row[0] for row in cursor.fetchall()]
    
    # Create author object
    author = {
        "id": post["author_id"],
        "name": post["author_name"],
        "avatar": post["author_avatar"]
    }
    
    # Create post object
    post_data = {
        "id": post["id"],
        "title": post["title"],
        "content": post["content"],
        "excerpt": post["excerpt"],
        "featured_image": post["featured_image"],
        "status": post["status"],
        "author": author,
        "categories": categories,
        "tags": tags,
        "created_at": post["created_at"],
        "updated_at": post["updated_at"],
        "published_at": post["published_at"],
        "reading_time": post["reading_time"]
    }
    
    cursor.close()
    return post_data

@app.post("/api/posts", response_model=Post, status_code=status.HTTP_201_CREATED)
async def create_post(
    post: PostCreate,
    db: mysql.connector.connection.MySQLConnection = Depends(get_db)
):
    cursor = db.cursor()
    
    try:
        # Start transaction
        db.start_transaction()
        
        # Calculate reading time (simple estimate based on word count)
        words = len(post.content.split())
        reading_time = max(1, int(words / 200))  # Assuming 200 words per minute
        
        # Insert post
        cursor.execute("""
        INSERT INTO posts (
            title, content, excerpt, featured_image, status, 
            author_id, reading_time, published_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            post.title, post.content, post.excerpt, post.featured_image,
            post.status, 1,  # Hardcoded author_id for demo
            reading_time,
            datetime.now() if post.status == "published" else None
        ))
        
        post_id = cursor.lastrowid
        
        # Process categories
        for category_name in post.categories:
            # Get or create category
            cursor.execute(
                "SELECT id FROM categories WHERE name = %s",
                (category_name,)
            )
            result = cursor.fetchone()
            
            if result:
                category_id = result[0]
            else:
                # Create new category
                slug = category_name.lower().replace(" ", "-")
                cursor.execute(
                    "INSERT INTO categories (name, slug) VALUES (%s, %s)",
                    (category_name, slug)
                )
                category_id = cursor.lastrowid
            
            # Link post to category
            cursor.execute(
                "INSERT INTO post_categories (post_id, category_id) VALUES (%s, %s)",
                (post_id, category_id)
            )
        
        # Process tags
        for tag_name in post.tags:
            # Get or create tag
            cursor.execute(
                "SELECT id FROM tags WHERE name = %s",
                (tag_name,)
            )
            result = cursor.fetchone()
            
            if result:
                tag_id = result[0]
            else:
                # Create new tag
                slug = tag_name.lower().replace(" ", "-")
                cursor.execute(
                    "INSERT INTO tags (name, slug) VALUES (%s, %s)",
                    (tag_name, slug)
                )
                tag_id = cursor.lastrowid
            
            # Link post to tag
            cursor.execute(
                "INSERT INTO post_tags (post_id, tag_id) VALUES (%s, %s)",
                (post_id, tag_id)
            )
        
        # Commit transaction
        db.commit()
        
        # Retrieve the created post with author details
        cursor.execute("""
        SELECT p.*, u.id as author_id, u.name as author_name, u.avatar as author_avatar
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.id = %s
        """, (post_id,))
        
        post_data = cursor.fetchone()
        
        # Create author object
        author = {
            "id": post_data[10],  # author_id
            "name": post_data[11],  # author_name
            "avatar": post_data[12]  # author_avatar
        }
        
        # Create the response
        created_post = {
            "id": post_id,
            "title": post.title,
            "content": post.content,
            "excerpt": post.excerpt,
            "featured_image": post.featured_image,
            "status": post.status,
            "author": author,
            "categories": post.categories,
            "tags": post.tags,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "published_at": datetime.now() if post.status == "published" else None,
            "reading_time": reading_time
        }
        
        return created_post
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@app.put("/api/posts/{post_id}", response_model=Post)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    db: mysql.connector.connection.MySQLConnection = Depends(get_db)
):
    cursor = db.cursor()
    
    try:
        # Check if post exists
        cursor.execute("SELECT id FROM posts WHERE id = %s", (post_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Start transaction
        db.start_transaction()
        
        # Calculate reading time
        words = len(post_update.content.split())
        reading_time = max(1, int(words / 200))
        
        # Update post
        cursor.execute("""
        UPDATE posts SET
            title = %s,
            content = %s,
            excerpt = %s,
            featured_image = %s,
            status = %s,
            reading_time = %s,
            published_at = %s,
            updated_at = NOW()
        WHERE id = %s
        """, (
            post_update.title, post_update.content, post_update.excerpt,
            post_update.featured_image, post_update.status, reading_time,
            datetime.now() if post_update.status == "published" else None,
            post_id
        ))
        
        # Update categories
        # First, remove all existing category relationships
        cursor.execute("DELETE FROM post_categories WHERE post_id = %s", (post_id,))
        
        # Add new category relationships
        for category_name in post_update.categories:
            # Get or create category
            cursor.execute(
                "SELECT id FROM categories WHERE name = %s",
                (category_name,)
            )
            result = cursor.fetchone()
            
            if result:
                category_id = result[0]
            else:
                # Create new category
                slug = category_name.lower().replace(" ", "-")
                cursor.execute(
                    "INSERT INTO categories (name, slug) VALUES (%s, %s)",
                    (category_name, slug)
                )
                category_id = cursor.lastrowid
            
            # Link post to category
            cursor.execute(
                "INSERT INTO post_categories (post_id, category_id) VALUES (%s, %s)",
                (post_id, category_id)
            )
        
        # Update tags
        # First, remove all existing tag relationships
        cursor.execute("DELETE FROM post_tags WHERE post_id = %s", (post_id,))
        
        # Add new tag relationships
        for tag_name in post_update.tags:
            # Get or create tag
            cursor.execute(
                "SELECT id FROM tags WHERE name = %s",
                (tag_name,)
            )
            result = cursor.fetchone()
            
            if result:
                tag_id = result[0]
            else:
                # Create new tag
                slug = tag_name.lower().replace(" ", "-")
                cursor.execute(
                    "INSERT INTO tags (name, slug) VALUES (%s, %s)",
                    (tag_name, slug)
                )
                tag_id = cursor.lastrowid
            
            # Link post to tag
            cursor.execute(
                "INSERT INTO post_tags (post_id, tag_id) VALUES (%s, %s)",
                (post_id, tag_id)
            )
        
        # Commit transaction
        db.commit()
        
        # Retrieve the updated post with author details
        cursor.execute("""
        SELECT p.*, u.id as author_id, u.name as author_name, u.avatar as author_avatar
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.id = %s
        """, (post_id,))
        
        post_data = cursor.fetchone()
        
        # Create author object
        author = {
            "id": post_data[10],  # author_id
            "name": post_data[11],  # author_name
            "avatar": post_data[12]  # author_avatar
        }
        
        # Create the response
        updated_post = {
            "id": post_id,
            "title": post_update.title,
            "content": post_update.content,
            "excerpt": post_update.excerpt,
            "featured_image": post_update.featured_image,
            "status": post_update.status,
            "author": author,
            "categories": post_update.categories,
            "tags": post_update.tags,
            "created_at": post_data[7],  # created_at
            "updated_at": datetime.now(),
            "published_at": datetime.now() if post_update.status == "published" else post_data[9],  # published_at
            "reading_time": reading_time
        }
        
        return updated_post
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@app.delete("/api/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, db: mysql.connector.connection.MySQLConnection = Depends(get_db)):
    cursor = db.cursor()
    
    try:
        # Check if post exists
        cursor.execute("SELECT id FROM posts WHERE id = %s", (post_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Delete post (cascade will handle relationships)
        cursor.execute("DELETE FROM posts WHERE id = %s", (post_id,))
        db.commit()
        
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

# Drafts
@app.get("/api/drafts", response_model=List[Post])
async def get_drafts(db: mysql.connector.connection.MySQLConnection = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("""
    SELECT p.*, u.id as author_id, u.name as author_name, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.status = 'draft'
    ORDER BY p.updated_at DESC
    """)
    
    drafts_data = cursor.fetchall()
    
    # Process drafts to include categories and tags
    drafts = []
    for draft in drafts_data:
        # Get categories for this post
        cursor.execute("""
        SELECT c.name FROM categories c
        JOIN post_categories pc ON c.id = pc.category_id
        WHERE pc.post_id = %s
        """, (draft["id"],))
        categories = [row[0] for row in cursor.fetchall()]
        
        # Get tags for this post
        cursor.execute("""
        SELECT t.name FROM tags t
        JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = %s
        """, (draft["id"],))
        tags = [row[0] for row in cursor.fetchall()]
        
        # Create author object
        author = {
            "id": draft["author_id"],
            "name": draft["author_name"],
            "avatar": draft["author_avatar"]
        }
        
        # Add to drafts list
        drafts.append({
            "id": draft["id"],
            "title": draft["title"],
            "content": draft["content"],
            "excerpt": draft["excerpt"],
            "featured_image": draft["featured_image"],
            "status": draft["status"],
            "author": author,
            "categories": categories,
            "tags": tags,
            "created_at": draft["created_at"],
            "updated_at": draft["updated_at"],
            "published_at": draft["published_at"],
            "reading_time": draft["reading_time"]
        })
    
    cursor.close()
    return drafts

# Auto-save route
@app.post("/api/drafts/autosave", response_model=Post)
async def autosave_draft(post: PostCreate, db: mysql.connector.connection.MySQLConnection = Depends(get_db)):
    cursor = db.cursor()
    
    try:
        # Calculate reading time
        words = len(post.content.split())
        reading_time = max(1, int(words / 200))
        
        # Check if a draft with this title exists
        cursor.execute(
            "SELECT id FROM posts WHERE title = %s AND status = 'draft'",
            (post.title,)
        )
        result = cursor.fetchone()
        
        if result:
            # Update existing draft
            post_id = result[0]
            cursor.execute("""
            UPDATE posts SET
                content = %s,
                excerpt = %s,
                featured_image = %s,
                reading_time = %s,
                updated_at = NOW()
            WHERE id = %s
            """, (
                post.content, post.excerpt, post.featured_image,
                reading_time, post_id
            ))
            
            # Update categories and tags
            # This is simplified - in a real app you'd handle this more efficiently
            cursor.execute("DELETE FROM post_categories WHERE post_id = %s", (post_id,))
            cursor.execute("DELETE FROM post_tags WHERE post_id = %s", (post_id,))
            
            # Add categories
            for category_name in post.categories:
                cursor.execute(
                    "SELECT id FROM categories WHERE name = %s",
                    (category_name,)
                )
                cat_result = cursor.fetchone()
                
                if cat_result:
                    category_id = cat_result[0]
                else:
                    slug = category_name.lower().replace(" ", "-")
                    cursor.execute(
                        "INSERT INTO categories (name, slug) VALUES (%s, %s)",
                        (category_name, slug)
                    )
                    category_id = cursor.lastrowid
                
                cursor.execute(
                    "INSERT INTO post_categories (post_id, category_id) VALUES (%s, %s)",
                    (post_id, category_id)
                )
            
            # Add tags
            for tag_name in post.tags:
                cursor.execute(
                    "SELECT id FROM tags WHERE name = %s",
                    (tag_name,)
                )
                tag_result = cursor.fetchone()
                
                if tag_result:
                    tag_id = tag_result[0]
                else:
                    slug = tag_name.lower().replace(" ", "-")
                    cursor.execute(
                        "INSERT INTO tags (name, slug) VALUES (%s, %s)",
                        (tag_name, slug)
                    )
                    tag_id = cursor.lastrowid
                
                cursor.execute(
                    "INSERT INTO post_tags (post_id, tag_id) VALUES (%s, %s)",
                    (post_id, tag_id)
                )
        else:
            # Create new draft
            cursor.execute("""
            INSERT INTO posts (
                title, content, excerpt, featured_image, status, 
                author_id, reading_time
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                post.title, post.content, post.excerpt, post.featured_image,
                'draft', 1,  # Hardcoded author_id for demo
                reading_time
            ))
            
            post_id = cursor.lastrowid
            
            # Add categories and tags (similar to above)
            for category_name in post.categories:
                cursor.execute(
                    "SELECT id FROM categories WHERE name = %s",
                    (category_name,)
                )
                cat_result = cursor.fetchone()
                
                if cat_result:
                    category_id = cat_result[0]
                else:
                    slug = category_name.lower().replace(" ", "-")
                    cursor.execute(
                        "INSERT INTO categories (name, slug) VALUES (%s, %s)",
                        (category_name, slug)
                    )
                    category_id = cursor.lastrowid
                
                cursor.execute(
                    "INSERT INTO post_categories (post_id, category_id) VALUES (%s, %s)",
                    (post_id, category_id)
                )
            
            for tag_name in post.tags:
                cursor.execute(
                    "SELECT id FROM tags WHERE name = %s",
                    (tag_name,)
                )
                tag_result = cursor.fetchone()
                
                if tag_result:
                    tag_id = tag_result[0]
                else:
                    slug = tag_name.lower().replace(" ", "-")
                    cursor.execute(
                        "INSERT INTO tags (name, slug) VALUES (%s, %s)",
                        (tag_name, slug)
                    )
                    tag_id = cursor.lastrowid
                
                cursor.execute(
                    "INSERT INTO post_tags (post_id, tag_id) VALUES (%s, %s)",
                    (post_id, tag_id)
                )
        
        db.commit()
        
        # Retrieve author info
        cursor.execute(
            "SELECT id, name, avatar FROM users WHERE id = 1"
        )
        author_data = cursor.fetchone()
        
        author = {
            "id": author_data[0],
            "name": author_data[1],
            "avatar": author_data[2]
        }
        
        # Create response
        now = datetime.now()
        saved_draft = {
            "id": post_id,
            "title": post.title,
            "content": post.content,
            "excerpt": post.excerpt,
            "featured_image": post.featured_image,
            "status": "draft",
            "author": author,
            "categories": post.categories,
            "tags": post.tags,
            "created_at": now,
            "updated_at": now,
            "published_at": None,
            "reading_time": reading_time
        }
        
        return saved_draft
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

# Run the application
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)