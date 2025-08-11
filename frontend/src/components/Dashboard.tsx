import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Plus, Search, Filter, Star, Clock, Eye } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  genre: string;
  content: string;
  isCompleted: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Mock data - in production this would fetch from API
    const mockStories: Story[] = [
      {
        id: '1',
        title: 'The Mysterious Forest Adventure',
        genre: 'fantasy',
        content: 'A young adventurer discovers a magical forest...',
        isCompleted: false,
        isPublic: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Starship Odyssey',
        genre: 'science fiction',
        content: 'A crew of space explorers encounters...',
        isCompleted: true,
        isPublic: false,
        createdAt: '2024-01-10T14:20:00Z',
        updatedAt: '2024-01-12T16:45:00Z'
      },
      {
        id: '3',
        title: 'The Detective\'s Case',
        genre: 'mystery',
        content: 'A brilliant detective investigates...',
        isCompleted: false,
        isPublic: true,
        createdAt: '2024-01-08T09:15:00Z',
        updatedAt: '2024-01-08T09:15:00Z'
      }
    ];

    setStories(mockStories);
    setIsLoading(false);
  }, []);

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'all' || story.genre === filterGenre;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && story.isCompleted) ||
                         (filterStatus === 'in-progress' && !story.isCompleted);

    return matchesSearch && matchesGenre && matchesStatus;
  });

  const genres = ['all', 'fantasy', 'science fiction', 'mystery', 'romance', 'adventure', 'horror'];
  const statuses = ['all', 'completed', 'in-progress'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-gray-600">
              Manage your stories and continue your creative journey
            </p>
          </div>
          <Link
            to="/generate"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Story</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stories.length}</div>
            <div className="text-sm text-purple-700">Total Stories</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stories.filter(s => s.isCompleted).length}
            </div>
            <div className="text-sm text-blue-700">Completed</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {stories.filter(s => !s.isCompleted).length}
            </div>
            <div className="text-sm text-green-700">In Progress</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stories.filter(s => s.isPublic).length}
            </div>
            <div className="text-sm text-orange-700">Public</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Genre Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status === 'completed' ? 'Completed' : 'In Progress'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid gap-6">
        {filteredStories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterGenre !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start creating your first story!'}
            </p>
            {!searchTerm && filterGenre === 'all' && filterStatus === 'all' && (
              <Link
                to="/generate"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Your First Story
              </Link>
            )}
          </div>
        ) : (
          filteredStories.map(story => (
            <div key={story.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link to={`/story/${story.id}`} className="hover:text-purple-600 transition-colors">
                      {story.title}
                    </Link>
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="capitalize">{story.genre}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      {story.isCompleted ? (
                        <>
                          <Star className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Completed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-orange-600">In Progress</span>
                        </>
                      )}
                    </span>
                    {story.isPublic && (
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-600">Public</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 line-clamp-2">{story.content}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Created: {formatDate(story.createdAt)}
                  {story.updatedAt !== story.createdAt && (
                    <span className="ml-4">Updated: {formatDate(story.updatedAt)}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/story/${story.id}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    {story.isCompleted ? 'Read' : 'Continue'}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard; 