 
import React, { useState } from 'react';
import { Upload, BookOpen, Search, Filter } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import BookCard from '../components/BookCard';
import PDFReader from '../components/PDFReader';

const Library = () => {
  const { books, addBook, currentBook, setCurrentBook } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [showReader, setShowReader] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const newBook = {
        id: Date.now().toString(),
        title: file.name.replace('.pdf', ''),
        author: 'Unknown Author',
        genre: 'Uploaded',
        coverUrl: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=300',
        description: 'Uploaded PDF document',
        rating: 0,
        reviews: [],
        file: file
      };
      addBook(newBook);
    }
  };

  const openBook = (book: {
    id: string;
    title: string;
    author: string;
    genre: string;
    coverUrl: string;
    description: string;
    rating: number;
    reviews: Array<{
      user: string;
      rating: number;
      comment: string;
    }>;
    file?: File | null;
  }) => {
    setCurrentBook(book);
    setShowReader(true);
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'all' || book.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = ['all', ...Array.from(new Set(books.map(book => book.genre)))];

  if (showReader && currentBook) {
    return <PDFReader book={currentBook} onClose={() => setShowReader(false)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Library
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your personal collection of books and documents
          </p>
        </div>

        <label className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors flex items-center space-x-2 mt-4 lg:mt-0">
          <Upload className="w-5 h-5" />
          <span>Upload PDF</span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard 
              key={book.id} 
              book={book} 
              onRead={() => openBook(book)}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No books found
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            Upload your first PDF or adjust your search filters
          </p>
          <label className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors inline-flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Your First Book</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default Library;