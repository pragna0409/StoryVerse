import React, { useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Settings, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface PDFReaderProps {
  book: Book;
  onClose: () => void;
}

const PDFReader = ({ book, onClose }: PDFReaderProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceType, setVoiceType] = useState('female');
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [showSettings, setShowSettings] = useState(false);

  // Sample text content (in real app, this would be extracted from PDF)
  const sampleText = `Chapter 1: The Beginning

In the quiet town of Willowbrook, nestled between rolling hills and ancient oak trees, something extraordinary was about to happen. The morning mist clung to the cobblestone streets as Emma walked to her favorite bookshop, unaware that her life was about to change forever.

The old brass bell above the door chimed as she entered, and the familiar scent of aged paper and leather bindings welcomed her like an old friend. Mrs. Henderson, the elderly shopkeeper, looked up from behind her wire-rimmed glasses with a knowing smile.

"Ah, Emma dear," she said, her voice carrying a hint of mystery, "I've been expecting you. There's something special I'd like to show you today."

Emma's curiosity was immediately piqued. In all her years of visiting the shop, Mrs. Henderson had never spoken with such intrigue. She followed the older woman to the back of the store, where shadows danced between towering bookshelves.

"This arrived yesterday," Mrs. Henderson whispered, pulling out an ornate, leather-bound volume. "No return address, no note. Just your name written on a small piece of parchment tucked inside the cover."

Emma's heart raced as she reached for the mysterious book. The moment her fingers touched the ancient leather, a warm sensation spread through her hands, and the world around her seemed to shimmer with possibility.`;

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // In real implementation, this would start/stop text-to-speech
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const nextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const previousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{book.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">by {book.author}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voice Type
                </label>
                <select
                  value={voiceType}
                  onChange={(e) => setVoiceType(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="female">Female Voice</option>
                  <option value="male">Male Voice</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reading Speed
                </label>
                <select
                  value={readingSpeed}
                  onChange={(e) => setReadingSpeed(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{fontSize}px</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Audio Controls */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={togglePlayback}
              className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <button
              onClick={toggleMute}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Voice: {voiceType}</span>
              <span>•</span>
              <span>Speed: {readingSpeed}x</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Navigation */}
          <div className="w-64 p-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Table of Contents</h3>
            <div className="space-y-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded cursor-pointer">
                Chapter 1: The Beginning
              </div>
              <div className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                Chapter 2: The Discovery
              </div>
              <div className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                Chapter 3: The Journey
              </div>
            </div>
          </div>

          {/* Reading Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div 
                className="prose dark:prose-invert max-w-none leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
              >
                <div className="whitespace-pre-line text-gray-800 dark:text-gray-200">
                  {sampleText}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={previousPage}
            disabled={currentPage === 1}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <span className="text-gray-600 dark:text-gray-400">
            Page {currentPage} of 150
          </span>
          
          <button
            onClick={nextPage}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFReader;
