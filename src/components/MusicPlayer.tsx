import React, { useState } from 'react';
import { Music, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart } from 'lucide-react';

const MusicPlayer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong] = useState({
    title: "Peaceful Reading",
    artist: "Lo-Fi Study Beats",
    cover: "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=100"
  });

  const togglePlayer = () => {
    setIsVisible(!isVisible);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      {/* Music Toggle Button */}
      <button
        onClick={togglePlayer}
        className="fixed top-20 right-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors z-40"
      >
        <Music className="w-5 h-5" />
      </button>

      {/* Music Player Panel */}
      {isVisible && (
        <div className="fixed top-20 right-16 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Now Playing</h3>
              <button
                onClick={togglePlayer}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <img
                src={currentSong.cover}
                alt={currentSong.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {currentSong.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {currentSong.artist}
                </p>
              </div>
              <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center space-x-3 mb-4">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                <Shuffle className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-2">
              <div className="bg-green-500 h-1 rounded-full w-1/3"></div>
            </div>

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>1:23</span>
              <span>3:45</span>
            </div>

            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                🎵 Reading Playlist
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Connect Spotify for personalized reading music
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MusicPlayer;
