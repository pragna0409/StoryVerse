// frontend/src/components/BackgroundMusicPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, Shuffle, Repeat, SkipForward } from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  genre: string;
  mood: string;
  duration: number;
}

interface BackgroundMusicPlayerProps {
  isReading: boolean;
  bookGenre?: string;
  currentMood?: string;
}

export const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({
  isReading,
  bookGenre,
  currentMood
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [volume, setVolume] = useState(0.3); // Lower volume for background
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(true);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('all');
  const [isVisible, setIsVisible] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Ambient music collections
  const ambientCollections = {
    fantasy: [
      {
        id: 'fantasy_1',
        title: 'Enchanted Forest',
        artist: 'Ambient Realms',
        url: '/audio/ambient/enchanted_forest.mp3',
        genre: 'ambient',
        mood: 'mystical',
        duration: 300
      },
      {
        id: 'fantasy_2',
        title: 'Dragon\'s Lair',
        artist: 'Epic Soundscapes',
        url: '/audio/ambient/dragons_lair.mp3',
        genre: 'ambient',
        mood: 'epic',
        duration: 280
      }
    ],
    mystery: [
      {
        id: 'mystery_1',
        title: 'Foggy Streets',
        artist: 'Noir Atmospheres',
        url: '/audio/ambient/foggy_streets.mp3',
        genre: 'ambient',
        mood: 'mysterious',
        duration: 320
      },
      {
        id: 'mystery_2',
        title: 'Old Library',
        artist: 'Study Sounds',
        url: '/audio/ambient/old_library.mp3',
        genre: 'ambient',
        mood: 'contemplative',
        duration: 400
      }
    ],
    romance: [
      {
        id: 'romance_1',
        title: 'Gentle Rain',
        artist: 'Romantic Moods',
        url: '/audio/ambient/gentle_rain.mp3',
        genre: 'ambient',
        mood: 'romantic',
        duration: 360
      },
      {
        id: 'romance_2',
        title: 'Café Parisien',
        artist: 'Urban Ambience',
        url: '/audio/ambient/cafe_parisien.mp3',
        genre: 'ambient',
        mood: 'cozy',
        duration: 420
      }
    ],
    'sci-fi': [
      {
        id: 'scifi_1',
        title: 'Space Station',
        artist: 'Cosmic Sounds',
        url: '/audio/ambient/space_station.mp3',
        genre: 'ambient',
        mood: 'futuristic',
        duration: 380
      },
      {
        id: 'scifi_2',
        title: 'Nebula Dreams',
        artist: 'Stellar Atmospheres',
        url: '/audio/ambient/nebula_dreams.mp3',
        genre: 'ambient',
        mood: 'ethereal',
        duration: 340
      }
    ]
  };

  useEffect(() => {
    // Generate playlist based on book genre and mood
    if (bookGenre) {
      const genreKey = bookGenre.toLowerCase().replace(/\s+/g, '-');
      const genreTracks = ambientCollections[genreKey as keyof typeof ambientCollections] ||
                         ambientCollections.fantasy;

      setPlaylist(genreTracks);

      if (genreTracks.length > 0 && !currentTrack) {
        setCurrentTrack(genreTracks[0]);
      }
    }
  }, [bookGenre, currentTrack]);

  useEffect(() => {
    // Auto-play when reading starts
    if (isReading && currentTrack && !isPlaying) {
      playTrack();
    } else if (!isReading && isPlaying) {
      pauseTrack();
    }
  }, [isReading]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNextTrack();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentTrack, playlist, repeatMode, isShuffled]);

  const playTrack = async () => {
    if (audioRef.current && currentTrack) {
      try {
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to play track:', error);
      }
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const playNextTrack = () => {
    if (playlist.length === 0) return;

    let nextTrack: MusicTrack;

    if (repeatMode === 'one') {
      nextTrack = currentTrack!;
    } else if (isShuffled) {
      const availableTracks = playlist.filter(track => track.id !== currentTrack?.id);
      nextTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)] || playlist[0];
    } else {
      const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % playlist.length;
      nextTrack = playlist[nextIndex];
    }

    setCurrentTrack(nextTrack);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const generateSpotifyPlaylist = async () => {
    try {
      const response = await fetch('/api/integrations/spotify/generate-reading-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          genre: bookGenre,
          mood: currentMood,
          duration: 60,
          instrumental: true
        })
      });

      if (response.ok) {
        const { playlist: spotifyPlaylist } = await response.json();
        // Convert Spotify tracks to our format and add to playlist
        console.log('Generated Spotify playlist:', spotifyPlaylist);
      }
    } catch (error) {
      console.error('Failed to generate Spotify playlist:', error);
    }
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Floating Music Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-20 right-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors z-40"
      >
        <Music className="w-5 h-5" />
      </button>

      {/* Music Player Panel */}
      {isVisible && (
        <div className="fixed top-20 right-16 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-30">
          <audio ref={audioRef} src={currentTrack.url} preload="metadata" />

          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Background Music
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            {/* Current Track Info */}
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`p-2 rounded-lg transition-colors ${
                  isShuffled
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlayPause}
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <div className="w-4 h-4 flex space-x-1">
                    <div className="w-1 h-4 bg-white"></div>
                    <div className="w-1 h-4 bg-white"></div>
                  </div>
                ) : (
                  <div className="w-4 h-4 border-l-4 border-l-white border-y-2 border-y-transparent border-r-0"></div>
                )}
              </button>

              <button
                onClick={playNextTrack}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => setRepeatMode(
                  repeatMode === 'none' ? 'all' :
                  repeatMode === 'all' ? 'one' : 'none'
                )}
                className={`p-2 rounded-lg transition-colors ${
                  repeatMode !== 'none'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                }`}
              >
                <Repeat className="w-4 h-4" />
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3 mb-4">
              <button onClick={toggleMute} className="text-gray-600 dark:text-gray-400">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* Spotify Integration */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={generateSpotifyPlaylist}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Generate Spotify Playlist
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Create a reading playlist based on this book
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
