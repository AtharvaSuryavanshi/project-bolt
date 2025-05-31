import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Share2, Calendar, Clock, Tag, User } from 'lucide-react';
import useBlogStore from '../store/blogStore';
import { formatDate } from '../utils/helpers';

const BlogView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const { currentPost, fetchPostById, deletePost } = useBlogStore();

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

  const handleDelete = async () => {
    if (!currentPost) return;
    
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      const success = await deletePost(currentPost.id);
      if (success) {
        navigate('/blogs');
      }
    }
  };

  if (isLoading || !currentPost) {
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <button 
          onClick={() => navigate('/blogs')}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to posts
        </button>
        
        <div className="flex space-x-3">
          <Link 
            to={`/blogs/${id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
          
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Featured Image */}
      {currentPost.featuredImage && (
        <div className="relative rounded-xl overflow-hidden mb-8 shadow-lg">
          <img
            src={currentPost.featuredImage}
            alt={currentPost.title}
            className="w-full h-64 sm:h-80 md:h-96 object-cover transition-transform hover:scale-105 duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      )}
      
      {/* Title and Meta */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
          {currentPost.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
              <img
                src={currentPost.author.avatar}
                alt={currentPost.author.name}
                className="h-full w-full object-cover"
              />
            </div>
            <span>{currentPost.author.name}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(currentPost.updatedAt)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{currentPost.readingTime} min read</span>
          </div>
        </div>
      </div>
      
      {/* Categories and Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {currentPost.categories.map((category, index) => (
          <span 
            key={`cat-${index}`} 
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs px-3 py-1 rounded-full"
          >
            {category}
          </span>
        ))}
        
        {currentPost.tags.map((tag, index) => (
          <span 
            key={`tag-${index}`} 
            className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs px-3 py-1 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>
      
      {/* Excerpt */}
      {currentPost.excerpt && (
        <div className="mb-8">
          <div className="text-xl text-gray-700 dark:text-gray-300 font-serif italic">
            {currentPost.excerpt}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-blue-600 prose-img:rounded-xl prose-img:shadow-md"
        dangerouslySetInnerHTML={{ __html: currentPost.content }}
      />
    </div>
  );
};

export default BlogView;