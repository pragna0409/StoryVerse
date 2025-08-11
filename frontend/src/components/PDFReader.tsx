// frontend/src/components/PDFReader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Settings, Play, Pause } from 'lucide-react';
import type { Book } from '../types';

export const PDFReader: React.FC<{ book: Book; onClose: () => void }> = ({ book, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<Date>(new Date());

  useEffect(() => {
    // Load book content and initialize reader
    loadBookContent();

    // Track reading session start
    startTimeRef.current = new Date();

    return () => {
      // Save reading progress when component unmounts
      saveReadingProgress();
    };
  }, []);

  const loadBookContent = async () => {
    try {
      const response = await fetch(`/api/books/${book.id}/content`);
      const content = await response.json();
      setTotalPages(content.totalPages);
      // Initialize PDF viewer
    } catch (error) {
      console.error('Failed to load book content:', error);
    }
  };

  const saveReadingProgress = async () => {
    const endTime = new Date();
    const sessionDuration = endTime.getTime() - startTimeRef.current.getTime();

    await fetch('/api/reading/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({
        bookId: book.id,
        currentPage,
        percentage: (currentPage / totalPages) * 100,
        sessionDuration,
        startTime: startTimeRef.current,
        endTime
      })
    });
  };

  const toggleAudio = async () => {
    if (isPlaying) {
      // Stop audio
      setIsPlaying(false);
    } else {
      // Start text-to-speech (placeholder)
      setIsPlaying(true);
    }
  };

  return (
    <div className="pdf-reader">
      <div className="reader-header">
        <button onClick={onClose}>← Back to Library</button>
        <h2>{book.title}</h2>
        <div className="reader-controls">
          <button onClick={toggleAudio}>
            {isPlaying ? <Pause /> : <Play />}
          </button>
          <button>
            <Settings />
          </button>
        </div>
      </div>

      <div className="reader-content" ref={contentRef}>
        {/* PDF content will be rendered here */}
      </div>

      <div className="reader-footer">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft /> Previous
        </button>

        <span>Page {currentPage} of {totalPages}</span>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight />
        </button>
      </div>
    </div>
  );
};
