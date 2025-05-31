import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import BlogList from '../components/Blog/BlogList';
import BlogEdit from './BlogEdit';
import BlogView from './BlogView';
import NotFound from '../pages/NotFound';

const Blogs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Create, edit, and manage your blog posts</p>
      </div>

      <Routes>
        <Route path="/" element={<BlogList type="all" />} />
        <Route path="/published" element={<BlogList type="published" />} />
        <Route path="/drafts" element={<BlogList type="drafts" />} />
        <Route path="/new" element={<BlogEdit />} />
        <Route path="/:id" element={<BlogView />} />
        <Route path="/:id/edit" element={<BlogEdit />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default Blogs;