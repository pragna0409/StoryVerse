 
import React, { useState } from 'react';
import { Search, TrendingUp, Shuffle } from 'lucide-react';
import BookCard from '../components/BookCard';
import { useLibrary } from '../contexts/LibraryContext';

const Discover = () => {
  const { addBook } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Sample books for discovery
  const discoveryBooks = [
    {
      id: 'disc-1',
      title: 'The Midnight Library',
      author: 'Matt Haig',
      genre: 'Fiction',
      coverUrl: 'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'A dazzling novel about all the choices that go into a life well lived.',
      rating: 4.8,
      reviews: [
        { user: 'BookLover23', rating: 5, comment: 'Absolutely magical and thought-provoking!' },
        { user: 'ReadingAddict', rating: 4, comment: 'Beautiful concept, well executed.' }
      ]
    },
    {
      id: 'disc-2',
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      genre: 'Sci-Fi',
      coverUrl: 'https://images.pexels.com/photos/256559/pexels-photo-256559.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'A lone astronaut must save the earth from disaster in this irresistible interstellar adventure.',
      rating: 4.9,
      reviews: [
        { user: 'SciFiFan', rating: 5, comment: 'Weir has done it again! Brilliant science and humor.' },
        { user: 'SpaceExplorer', rating: 5, comment: 'Could not put this down!' }
      ]
    },
    {
      id: 'disc-3',
      title: 'The Seven Husbands of Evelyn Hugo',
      author: 'Taylor Jenkins Reid',
      genre: 'Romance',
      coverUrl: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'A reclusive Hollywood icon finally tells her story.',
      rating: 4.7,
      reviews: [
        { user: 'RomanceReader', rating: 5, comment: 'Compelling and beautifully written!' }
      ]
    },
    {
      id: 'disc-4',
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      genre: 'Mystery',
      coverUrl: 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'A woman refuses to speak after allegedly murdering her husband.',
      rating: 4.6,
      reviews: [
        { user: 'MysteryLover', rating: 4, comment: 'Great twist ending!' }
      ]
    },
    {
      id: 'disc-5',
      title: 'Dune',
      author: 'Frank Herbert',
      genre: 'Sci-Fi',
      coverUrl: 'https://images.pexels.com/photos/2908984/pexels-photo-2908984.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'The epic tale of Duke Paul Atreides and the desert planet Arrakis.',
      rating: 4.8,
      reviews: [
        { user: 'EpicReader', rating: 5, comment: 'A masterpiece of science fiction!' }
      ]
    },
    {
      id: 'disc-6',
      title: 'Where the Crawdads Sing',
      author: 'Delia Owens',
      genre: 'Fiction',
      coverUrl: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'A coming-of-age story set in the marshlands of North Carolina.',
      rating: 4.5,
      reviews: [
        { user: 'NatureLover', rating: 4, comment: 'Beautiful descriptions of nature and human resilience.' }
      ]
    }
  ];

  const genres = ['all', 'Fiction', 'Sci-Fi', 'Romance', 'Mystery', 'Fantasy', 'Horror', 'Historical'];

  const addToLibrary = (book: {
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
  }) => {
    addBook({
      ...book,
      file: null // Discovered books don't have files
    });
  };

  const filteredBooks = discoveryBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Discover Books
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Find your next favorite read from our curated collection
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search books, authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title A-Z</option>
              <option value="author">Author A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-amber-600 dark:text-amber-400" />
            Trending Now
          </h2>
          <button className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300">
            <Shuffle className="w-4 h-4" />
            <span>Surprise Me</span>
          </button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedBooks.map(book => (
          <BookCard 
            key={book.id} 
            book={book} 
            onAddToLibrary={() => addToLibrary(book)}
            showAddButton={true}
          />
        ))}
      </div>

      {sortedBooks.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No books found
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default Discover;