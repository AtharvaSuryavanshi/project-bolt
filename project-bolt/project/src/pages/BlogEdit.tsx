import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogEditor from '../components/Blog/BlogEditor';
import BlogPreview from '../components/Blog/BlogPreview';
import useBlogStore from '../store/blogStore';
import { BlogDraft } from '../types/blog';

const BlogEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPreview, setIsPreview] = useState(false);
  const [previewData, setPreviewData] = useState<BlogDraft | null>(null);
  const [isLoading, setIsLoading] = useState(id ? true : false);
  
  const { 
    currentPost, 
    fetchPostById, 
    saveDraft,
    publishPost, 
    drafts 
  } = useBlogStore();

  useEffect(() => {
    const loadPost = async () => {
      if (id) {
        setIsLoading(true);
        const post = await fetchPostById(Number(id));
        setIsLoading(false);
        
        if (!post) {
          navigate('/blogs', { replace: true });
        }
      }
    };
    
    loadPost();
  }, [id, fetchPostById, navigate]);

  const handlePreview = (draft: BlogDraft) => {
    setPreviewData(draft);
    setIsPreview(true);
  };

  const handlePublish = async (draft: BlogDraft) => {
    try {
      // For a new post, we need to save it first to get an ID
      if (!draft.id) {
        const savedDraft = await saveDraft(draft);
        if (savedDraft) {
          // Now publish with the new ID
          const published = await publishPost({
            ...savedDraft,
            author: {
              id: 1,
              name: 'John Doe',
              avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            readingTime: 3, // Estimate
          });
          
          if (published) {
            navigate(`/blogs/${published.id}`);
          }
        }
      } else {
        // For existing post, publish directly
        const post = currentPost || drafts.find(d => d.id === draft.id);
        
        if (post) {
          const published = await publishPost({
            ...post,
            ...draft,
            status: 'published',
            author: (post as any).author || {
              id: 1,
              name: 'John Doe',
              avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
            },
            createdAt: (post as any).createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            readingTime: 3, // Estimate
          });
          
          if (published) {
            navigate(`/blogs/${published.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Error publishing post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-animation">
          <div className="circle bg-blue-500"></div>
          <div className="circle bg-purple-500 delay-150"></div>
          <div className="circle bg-pink-500 delay-300"></div>
        </div>
      </div>
    );
  }

  const initialData = id && currentPost ? {
    id: currentPost.id,
    title: currentPost.title,
    content: currentPost.content,
    excerpt: currentPost.excerpt,
    featuredImage: currentPost.featuredImage,
    status: currentPost.status,
    categories: currentPost.categories,
    tags: currentPost.tags
  } : undefined;

  if (isPreview && previewData) {
    return (
      <BlogPreview 
        post={previewData} 
        onBack={() => setIsPreview(false)} 
      />
    );
  }

  return (
    <BlogEditor 
      postId={id ? parseInt(id) : undefined}
      initialData={initialData}
      onPublish={handlePublish}
      onPreview={handlePreview}
    />
  );
};

export default BlogEdit;