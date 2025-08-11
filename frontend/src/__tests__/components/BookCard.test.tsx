// frontend/src/__tests__/components/BookCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BookCard from '../../components/BookCard';
import type { Book } from '../../types';

const mockBook: Book = {
  id: '1',
  title: 'The Great Adventure',
  author: 'John Doe',
  genre: 'Fantasy',
  description: 'An epic tale of courage and adventure in a magical world.',
  rating: 4,
  coverImage: undefined,
  isPublic: true,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

describe('BookCard', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders book information correctly', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />);

    expect(screen.getByText('The Great Adventure')).toBeDefined();
    expect(screen.getByText('by John Doe')).toBeDefined();
    expect(screen.getByText('Fantasy')).toBeDefined();
    expect(screen.getByText('An epic tale of courage and adventure in a magical world.')).toBeDefined();
  });

  it('displays correct rating with stars', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />);

    // Should show 4 filled stars and 1 empty star
    const stars = screen.getAllByTestId('star');
    expect(stars).toHaveLength(5);
    
    // Check that 4 stars are filled (rating is 4)
    const filledStars = stars.filter((star: Element) => star.classList.contains('text-yellow-400'));
    expect(filledStars).toHaveLength(4);
  });

  it('shows public indicator when book is public', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />);

    const publicIndicator = screen.getByTestId('public-indicator');
    expect(publicIndicator).toBeDefined();
  });

  it('calls onSelect when clicked', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('displays cover image when available', () => {
    const bookWithCover = {
      ...mockBook,
      coverImage: 'https://example.com/cover.jpg'
    };

    render(<BookCard book={bookWithCover} onSelect={mockOnSelect} />);

    const coverImage = screen.getByAltText('The Great Adventure');
    expect(coverImage).toBeDefined();
    expect(coverImage.getAttribute('src')).toBe('https://example.com/cover.jpg');
  });

  it('shows default icon when no cover image', () => {
    render(<BookCard book={mockBook} onSelect={mockOnSelect} />);

    const defaultIcon = screen.getByTestId('default-cover-icon');
    expect(defaultIcon).toBeDefined();
  });
});
