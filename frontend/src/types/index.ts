// Common types used across the application
export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  genre: string;
  description: string;
  isPublic: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryFilters {
  genre: string[];
  author: string[];
  rating: number;
  isPublic: boolean;
  searchTerm: string;
}

export interface PersonalityResults {
  readingStyle: 'visual' | 'auditory' | 'kinesthetic';
  preferredGenres: string[];
  readingSpeed: 'slow' | 'moderate' | 'fast';
  moodPreferences: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';
  autoScroll: boolean;
  textToSpeech: boolean;
  backgroundMusic: boolean;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export interface FilterPanelProps {
  filters: LibraryFilters;
  onChange: (filters: LibraryFilters) => void;
}

export interface ViewToggleProps {
  mode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
}

export interface UploadButtonProps {
  onUpload: (file: File) => void;
}

export interface BookGridProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
  viewMode: 'grid' | 'list';
}

// Re-export types from api service
export type { User, Story, Choice, StoryMetadata, StoryGenerationRequest, AuthTokens } from '../services/api'; 