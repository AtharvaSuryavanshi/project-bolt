import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Calendar, 
  Users, 
  Settings, 
  X,
  FileText
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  // Close sidebar on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSidebar();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [closeSidebar]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (isOpen && sidebar && !sidebar.contains(e.target as Node)) {
        closeSidebar();
      }
    };
    
    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, closeSidebar]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden transition-opacity duration-200"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 transform bg-white dark:bg-gray-800 shadow-lg lg:shadow-none lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-800 dark:text-white">TaskFlow</span>
          </div>
          <button 
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <nav className="mt-5 px-4 h-[calc(100%-4rem)] overflow-y-auto">
          <div className="space-y-1">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </NavLink>

            <NavLink 
              to="/projects" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <FolderKanban className="h-5 w-5 mr-3" />
              Projects
            </NavLink>

            <NavLink 
              to="/tasks" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <CheckSquare className="h-5 w-5 mr-3" />
              Tasks
            </NavLink>

            <NavLink 
              to="/blogs" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <FileText className="h-5 w-5 mr-3" />
              Blog
            </NavLink>

            <div className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Calendar className="h-5 w-5 mr-3" />
              Calendar
            </div>

            <div className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Users className="h-5 w-5 mr-3" />
              Team
            </div>
          </div>

          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Settings
            </h3>
            <div className="mt-2 space-y-1">
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </NavLink>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;