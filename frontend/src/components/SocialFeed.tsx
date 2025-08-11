// frontend/src/components/SocialFeed.tsx
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, BookOpen, Star, MoreHorizontal } from 'lucide-react';

interface SocialPost {
  id: string;
  type: 'review' | 'reading_update' | 'recommendation' | 'story_share';
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  book?: {
    id: string;
    title: string;
    author: string;
    cover: string;
  };
  content: string;
  rating?: number;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await fetch(`/api/social/feed?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const { posts: newPosts } = await response.json();
        setPosts(prev => page === 1 ? newPosts : [...prev, ...newPosts]);
      }
    } catch (error) {
      console.error('Failed to load social feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const sharePost = async (post: SocialPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.user.username}'s review of ${post.book?.title}`,
          text: post.content,
          url: window.location.href
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Check out ${post.user.username}'s review of ${post.book?.title}: ${post.content}`
      );
      alert('Link copied to clipboard!');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'reading_update':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'recommendation':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'story_share':
        return <Share2 className="w-4 h-4 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  if (loading && posts.length === 0) {
    return (
      <div className="social-feed-loading">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="social-feed">
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={post.user.avatar || '/default-avatar.png'}
                  alt={post.user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {post.user.username}
                    </h4>
                    {getPostTypeIcon(post.type)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(post.createdAt)}
                  </p>
                </div>
              </div>

              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Book Info (if applicable) */}
            {post.book && (
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={post.book.cover}
                  alt={post.book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {post.book.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {post.book.author}
                  </p>
                  {post.rating && (
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(post.rating)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => likePost(post.id)}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.isLiked
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{post.likes}</span>
                </button>

                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments}</span>
                </button>

                <button
                  onClick={() => sharePost(post)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">Share</span>
                </button>
              </div>

              {post.book && (
                <button className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors">
                  Add to Library
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-8">
        <button
          onClick={() => {
            setPage(prev => prev + 1);
            loadFeed();
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Load More Posts
        </button>
      </div>
    </div>
  );
};
