import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, FilePlus } from 'lucide-react';
import useBlogStore from '../../store/blogStore';
import { BlogPost, BlogDraft } from '../../types/blog';
import { formatDate, formatDateRelative } from '../../utils/helpers';

interface BlogListProps {
  type?: 'all' | 'published' | 'drafts';
}

const BlogList: React.FC<BlogListProps> = ({ type = 'all' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(type === 'all' ? 'all' : type);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  
  const { posts, drafts, isLoading, fetchPosts, fetchDrafts, deletePost } = useBlogStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (type === 'published' || type === 'all') {
        await fetchPosts();
      }
      if (type === 'drafts' || type === 'all') {
        await fetchDrafts();
      }
    };
    
    loadData();
  }, [type, fetchPosts, fetchDrafts]);

  // Filter posts based on search query and status
  const filteredItems = () => {
    let items: (BlogPost | BlogDraft)[] = [];
    
    if (statusFilter === 'published' || statusFilter === 'all') {
      items = [...items, ...posts];
    }
    
    if (statusFilter === 'drafts' || statusFilter === 'all') {
      items = [...items, ...drafts];
    }
    
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item as BlogPost).excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleDeletePost = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      const success = await deletePost(id);
      if (success) {
        setActiveDropdown(null);
      }
    }
  };

  const toggleDropdown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleCreateNew = () => {
    navigate('/blogs/new');
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
            />
          </div>
          
          {type === 'all' && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    statusFilter === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Published
                </button>
                <button
                  onClick={() => setStatusFilter('drafts')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    statusFilter === 'drafts'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Drafts
                </button>
              </div>
            </div>
          )}
          
          <div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors btn"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {filteredItems().length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FilePlus className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No posts found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? 'Try adjusting your search or filter to find what you\'re looking for.' 
                : 'Get started by creating a new blog post.'}
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </button>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Post
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems().map((item, index) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.featuredImage ? (
                        <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden">
                          <img 
                            src={item.featuredImage} 
                            alt={item.title} 
                            className="h-10 w-10 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FilePlus className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                          {(item as BlogPost).excerpt || 'No excerpt available'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {item.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.updatedAt 
                      ? formatDateRelative(item.updatedAt)
                      : 'Never updated'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => toggleDropdown(item.id as number, e)}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                      
                      {activeDropdown === item.id && (
                        <div 
                          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10"
                        >
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <Link
                              to={`/blogs/${item.id}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              role="menuitem"
                            >
                              <Eye className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                              View
                            </Link>
                            <Link
                              to={`/blogs/${item.id}/edit`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              role="menuitem"
                            >
                              <Edit className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeletePost(item.id as number)}
                              className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              role="menuitem"
                            >
                              <Trash2 className="h-4 w-4 mr-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BlogList;