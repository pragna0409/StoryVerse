import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, Home, Search, PenTool, User, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-amber-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Book className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">StoryVerse</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:block">Home</span>
            </Link>

            <Link
              to="/library"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/library') 
                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <Book className="w-4 h-4" />
              <span className="hidden sm:block">Library</span>
            </Link>

            <Link
              to="/discover"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/discover') 
                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:block">Discover</span>
            </Link>

            <Link
              to="/story-generator"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/story-generator') 
                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:block">Create</span>
            </Link>

            <Link
              to="/profile"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/profile') 
                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:block">Profile</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-amber-100 dark:bg-gray-800 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
