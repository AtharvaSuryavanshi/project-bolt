import React from 'react';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';
import { BlogPost, BlogDraft } from '../../types/blog';
import { formatDate } from '../../utils/helpers';

interface BlogPreviewProps {
  post: BlogPost | BlogDraft;
  onBack: () => void;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ post, onBack }) => {
  // If post is a draft, it might not have all properties
  const publishedPost = post as BlogPost;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to editor
        </button>
      </div>
      
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative rounded-xl overflow-hidden mb-8 shadow-lg">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-64 sm:h-80 md:h-96 object-cover transition-transform hover:scale-105 duration-700"
          />
        </div>
      )}
      
      {/* Title and Meta */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          {publishedPost.author && (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                <img
                  src={publishedPost.author.avatar}
                  alt={publishedPost.author.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span>{publishedPost.author.name}</span>
            </div>
          )}
          
          {post.updatedAt && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(post.updatedAt)}</span>
            </div>
          )}
          
          {publishedPost.readingTime && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{publishedPost.readingTime} min read</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Categories and Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {post.categories.map((category, index) => (
          <span 
            key={`cat-${index}`} 
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs px-3 py-1 rounded-full"
          >
            {category}
          </span>
        ))}
        
        {post.tags.map((tag, index) => (
          <span 
            key={`tag-${index}`} 
            className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs px-3 py-1 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>
      
      {/* Excerpt */}
      {publishedPost.excerpt && (
        <div className="mb-8">
          <div className="text-xl text-gray-700 dark:text-gray-300 font-serif italic">
            {publishedPost.excerpt}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-blue-600 prose-img:rounded-xl prose-img:shadow-md prose-pre:bg-gray-800 dark:prose-pre:bg-gray-900"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      {/* Preview Label */}
      <div className="fixed top-4 right-4 bg-yellow-400 text-yellow-900 py-1 px-3 rounded-full text-xs font-bold shadow-lg">
        Preview Mode
      </div>
    </div>
  );
};

export default BlogPreview;