import { create } from 'zustand';
import { BlogPost, BlogDraft, Category, Tag } from '../types/blog';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

interface BlogState {
  posts: BlogPost[];
  drafts: BlogDraft[];
  categories: Category[];
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  currentPost: BlogPost | null;
  
  // Actions
  fetchPosts: () => Promise<void>;
  fetchDrafts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchPostById: (id: number) => Promise<BlogPost | null>;
  saveDraft: (draft: BlogDraft) => Promise<BlogDraft | null>;
  publishPost: (post: BlogPost) => Promise<BlogPost | null>;
  deletePost: (id: number) => Promise<boolean>;
  createCategory: (name: string) => Promise<Category | null>;
  createTag: (name: string) => Promise<Tag | null>;
}

// Mock data for development before backend is connected
const mockPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Getting Started with React and TypeScript',
    content: '<h2>Introduction</h2><p>React and TypeScript make a powerful combination...</p>',
    excerpt: 'Learn how to set up a new project with React and TypeScript',
    featuredImage: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg',
    status: 'published',
    categories: ['Development', 'React'],
    tags: ['react', 'typescript', 'frontend'],
    author: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
    },
    createdAt: '2025-04-10T12:00:00Z',
    updatedAt: '2025-04-10T14:30:00Z',
    publishedAt: '2025-04-10T15:00:00Z',
    readingTime: 5
  },
  {
    id: 2,
    title: 'Advanced CSS Techniques for Modern Web Apps',
    content: '<h2>Modern CSS</h2><p>CSS has evolved significantly in recent years...</p>',
    excerpt: 'Explore advanced CSS techniques to enhance your web applications',
    featuredImage: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg',
    status: 'published',
    categories: ['Development', 'CSS'],
    tags: ['css', 'frontend', 'design'],
    author: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
    },
    createdAt: '2025-04-05T10:00:00Z',
    updatedAt: '2025-04-05T11:45:00Z',
    publishedAt: '2025-04-05T12:30:00Z',
    readingTime: 8
  }
];

const mockDrafts: BlogDraft[] = [
  {
    id: 3,
    title: 'Implementing Authentication in React Applications',
    content: '<h2>User Authentication</h2><p>Security is critical for web applications...</p>',
    excerpt: 'Learn how to implement secure authentication in React apps',
    status: 'draft',
    categories: ['Development', 'Security'],
    tags: ['react', 'authentication', 'security'],
    updatedAt: '2025-04-12T09:45:00Z'
  }
];

const mockCategories: Category[] = [
  { id: 1, name: 'Development', slug: 'development', count: 10 },
  { id: 2, name: 'Design', slug: 'design', count: 5 },
  { id: 3, name: 'Marketing', slug: 'marketing', count: 3 },
  { id: 4, name: 'React', slug: 'react', count: 7 },
  { id: 5, name: 'CSS', slug: 'css', count: 4 },
  { id: 6, name: 'Security', slug: 'security', count: 2 }
];

const mockTags: Tag[] = [
  { id: 1, name: 'react', slug: 'react', count: 12 },
  { id: 2, name: 'typescript', slug: 'typescript', count: 8 },
  { id: 3, name: 'frontend', slug: 'frontend', count: 15 },
  { id: 4, name: 'css', slug: 'css', count: 10 },
  { id: 5, name: 'design', slug: 'design', count: 7 },
  { id: 6, name: 'authentication', slug: 'authentication', count: 3 },
  { id: 7, name: 'security', slug: 'security', count: 4 }
];

// Create the store
const useBlogStore = create<BlogState>((set, get) => ({
  posts: mockPosts,
  drafts: mockDrafts,
  categories: mockCategories,
  tags: mockTags,
  isLoading: false,
  error: null,
  currentPost: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // const response = await axios.get(`${API_URL}/posts`);
      // set({ posts: response.data, isLoading: false });
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ posts: mockPosts, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch posts', 
        isLoading: false 
      });
    }
  },

  fetchDrafts: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // const response = await axios.get(`${API_URL}/drafts`);
      // set({ drafts: response.data, isLoading: false });
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ drafts: mockDrafts, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch drafts', 
        isLoading: false 
      });
    }
  },

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // const response = await axios.get(`${API_URL}/categories`);
      // set({ categories: response.data, isLoading: false });
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ categories: mockCategories, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch categories', 
        isLoading: false 
      });
    }
  },

  fetchTags: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // const response = await axios.get(`${API_URL}/tags`);
      // set({ tags: response.data, isLoading: false });
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ tags: mockTags, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tags', 
        isLoading: false 
      });
    }
  },

  fetchPostById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // const response = await axios.get(`${API_URL}/posts/${id}`);
      // const post = response.data;
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      const post = mockPosts.find(p => p.id === id) || 
                  mockDrafts.find(d => d.id === id) as BlogPost | undefined;
      
      if (!post) {
        set({ error: 'Post not found', isLoading: false });
        return null;
      }
      
      set({ currentPost: post as BlogPost, isLoading: false });
      return post as BlogPost;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch post', 
        isLoading: false 
      });
      return null;
    }
  },

  saveDraft: async (draft: BlogDraft) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // const response = await axios.post(`${API_URL}/drafts`, draft);
      // const savedDraft = response.data;
      
      // For now, simulate saving
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const now = new Date();
      const updatedDraft: BlogDraft = {
        ...draft,
        updatedAt: now.toISOString()
      };
      
      if (!draft.id) {
        // New draft
        const newId = Math.max(...get().drafts.map(d => d.id || 0), 0) + 1;
        updatedDraft.id = newId;
        
        set(state => ({
          drafts: [...state.drafts, updatedDraft],
          isLoading: false
        }));
      } else {
        // Update existing draft
        set(state => ({
          drafts: state.drafts.map(d => 
            d.id === draft.id ? updatedDraft : d
          ),
          isLoading: false
        }));
      }
      
      return updatedDraft;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save draft', 
        isLoading: false 
      });
      return null;
    }
  },

  publishPost: async (post: BlogPost) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // const response = await axios.post(`${API_URL}/posts`, post);
      // const publishedPost = response.data;
      
      // For now, simulate publishing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date();
      const publishedPost: BlogPost = {
        ...post,
        status: 'published',
        publishedAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      
      set(state => {
        // Remove from drafts if it was a draft
        const updatedDrafts = state.drafts.filter(d => d.id !== post.id);
        
        // Add to published posts or update existing
        const updatedPosts = state.posts.some(p => p.id === post.id)
          ? state.posts.map(p => p.id === post.id ? publishedPost : p)
          : [...state.posts, publishedPost];
          
        return {
          posts: updatedPosts,
          drafts: updatedDrafts,
          currentPost: publishedPost,
          isLoading: false
        };
      });
      
      return publishedPost;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to publish post', 
        isLoading: false 
      });
      return null;
    }
  },

  deletePost: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // await axios.delete(`${API_URL}/posts/${id}`);
      
      // For now, simulate deletion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        posts: state.posts.filter(p => p.id !== id),
        drafts: state.drafts.filter(d => d.id !== id),
        currentPost: state.currentPost?.id === id ? null : state.currentPost,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete post', 
        isLoading: false 
      });
      return false;
    }
  },

  createCategory: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // const response = await axios.post(`${API_URL}/categories`, { name });
      // return response.data;
      
      // For now, simulate creating a category
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const newCategory: Category = {
        id: Math.max(...get().categories.map(c => c.id), 0) + 1,
        name,
        slug,
        count: 0
      };
      
      set(state => ({
        categories: [...state.categories, newCategory],
        isLoading: false
      }));
      
      return newCategory;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create category', 
        isLoading: false 
      });
      return null;
    }
  },

  createTag: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // const response = await axios.post(`${API_URL}/tags`, { name });
      // return response.data;
      
      // For now, simulate creating a tag
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const newTag: Tag = {
        id: Math.max(...get().tags.map(t => t.id), 0) + 1,
        name,
        slug,
        count: 0
      };
      
      set(state => ({
        tags: [...state.tags, newTag],
        isLoading: false
      }));
      
      return newTag;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create tag', 
        isLoading: false 
      });
      return null;
    }
  }
}));

export default useBlogStore;