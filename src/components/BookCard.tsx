import React, { useState } from 'react';
import { Star, Heart, BookOpen, Plus, Play, MessageCircle, MoreVertical } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
  description: string;
  rating: number;
  reviews?: Array<{
    user: string;
    rating: number;
    comment: string;
  }>;
}

interface BookCardProps {
  book: Book;
  onRead?: () => void;
  onAddToLibrary?: () => void;
  showActions?: boolean;
  showAddButton?: boolean;
}

const BookCard = ({ book, onRead, onAddToLibrary, showActions, showAddButton }: BookCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isLiked 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        
        <div className="absolute bottom-3 left-3">
          <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {book.genre}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">by {book.author}</p>
        
        <div className="flex items-center space-x-1 mb-3">
          {renderStars(Math.floor(book.rating))}
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            {book.rating.toFixed(1)}
          </span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {book.description}
        </p>

        <div className="flex items-center justify-between">
          {onRead && (
            <button
              onClick={onRead}
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors flex-1 mr-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read</span>
            </button>
          )}

          {showAddButton && onAddToLibrary && (
            <button
              onClick={onAddToLibrary}
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors flex-1 mr-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Library</span>
            </button>
          )}

          {showActions && (
            <div className="flex space-x-2">
              <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Play className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {book.reviews && book.reviews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowReviews(!showReviews)}
              className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{book.reviews.length} Review{book.reviews.length > 1 ? 's' : ''}</span>
            </button>
            
            {showReviews && (
              <div className="mt-3 space-y-2">
                {book.reviews.slice(0, 2).map((review, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {review.user}
                      </span>
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
