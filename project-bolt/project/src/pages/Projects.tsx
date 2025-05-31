import React from 'react';

const Projects: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Manage and track your projects</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Your projects will appear here</p>
      </div>
    </div>
  );
};

export default Projects;