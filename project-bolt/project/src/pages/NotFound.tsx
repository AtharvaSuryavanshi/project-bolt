import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Page not found</p>
        <p className="mt-2 text-gray-500 dark:text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
        
        <button
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <HomeIcon className="w-5 h-5 mr-2" />
          Return Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;