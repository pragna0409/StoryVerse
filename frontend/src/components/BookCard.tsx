import React from 'react';
import { BookOpen, Star, Eye } from 'lucide-react';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  rating: number;
  coverImage?: string;
  isPublic: boolean;
  createdAt: string;
}

interface BookCardProps {
  book: Book;
  onSelect: () => void;
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, onSelect, className = '' }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          data-testid="star"
          className={`w-4 h-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${className}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-t-lg flex items-center justify-center">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <BookOpen data-testid="default-cover-icon" className="w-16 h-16 text-purple-400" />
        )}
        {book.isPublic && (
          <div data-testid="public-indicator" className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
            <Eye className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {book.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2">
          by <span className="font-medium">{book.author}</span>
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
            {book.genre}
          </span>
          <div className="flex items-center space-x-1">
            {renderStars(book.rating)}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {book.description}
        </p>
        
        <div className="text-xs text-gray-500">
          {new Date(book.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default BookCard; 