import React, { createContext, useContext, useState } from 'react';

interface Book {
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
}

interface LibraryContextType {
  books: Book[];
  currentBook: Book | null;
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  setCurrentBook: (book: Book | null) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([
    {
      id: 'sample-1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Classic',
      coverUrl: 'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'A classic American novel set in the Jazz Age.',
      rating: 4.5,
      reviews: [
        { user: 'ClassicReader', rating: 5, comment: 'Timeless masterpiece!' }
      ]
    }
  ]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  const addBook = (book: Book) => {
    setBooks(prev => [...prev, book]);
  };

  const removeBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  return (
    <LibraryContext.Provider value={{
      books,
      currentBook,
      addBook,
      removeBook,
      setCurrentBook
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
