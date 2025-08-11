// frontend/src/components/AdvancedAudioPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX,
  Settings, Bookmark, Rewind, FastForward
} from 'lucide-react';

interface AudioPlayerProps {
  audioUrl?: string;
  text?: string;
  onPositionChange?: (position: number) => void;
  onComplete?: () => void;
}

export const AdvancedAudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  text,
  onPositionChange,
  onComplete
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Audio settings
  const [audioSettings, setAudioSettings] = useState({
    voiceProfile: 'jenny_professional',
    emotion: 'neutral',
    pitch: 'medium',
    skipInterval: 15 // seconds
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  const generateAudio = async () => {
    if (!text) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/api/tts/synthesize-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          text,
          voice_profile: audioSettings.voiceProfile,
          emotion: audioSettings.emotion,
          speaking_rate: playbackRate,
          pitch: audioSettings.pitch
        })
      });

      if (response.ok) {
        const data = await response.json();
        const audioBlob = new Blob(
          [new Uint8Array(data.audio_data.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    if (!audioRef.current.src && text) {
      await generateAudio();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime - audioSettings.skipInterval
      );
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        duration,
        audioRef.current.currentTime + audioSettings.skipInterval
      );
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    audioRef.current.currentTime = newTime;
    onPositionChange?.(newTime);
  };

  const addBookmark = () => {
    if (audioRef.current) {
      const bookmark = {
        time: audioRef.current.currentTime,
        text: `Bookmark at ${formatTime(audioRef.current.currentTime)}`
      };

      // Save bookmark to backend
      fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(bookmark)
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const voiceProfiles = [
    { value: 'jenny_professional', label: 'Jenny (Professional)' },
    { value: 'aria_warm', label: 'Aria (Warm)' },
    { value: 'guy_friendly', label: 'Guy (Friendly)' },
    { value: 'davis_authoritative', label: 'Davis (Authoritative)' }
  ];

  return (
    <div className="advanced-audio-player">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Main Controls */}
      <div className="player-controls">
        <button onClick={skipBackward} className="control-button">
          <Rewind className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlayPause}
          disabled={isGenerating}
          className="play-pause-button"
        >
          {isGenerating ? (
            <div className="spinner" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        <button onClick={skipForward} className="control-button">
          <FastForward className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <span className="time-display">{formatTime(currentTime)}</span>

        <div
          ref={progressRef}
          className="progress-bar"
          onClick={handleProgressClick}
        >
          <div
            className="progress-fill"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <span className="time-display">{formatTime(duration)}</span>
      </div>

      {/* Secondary Controls */}
      <div className="secondary-controls">
        <button onClick={addBookmark} className="control-button">
          <Bookmark className="w-4 h-4" />
        </button>

        <div className="volume-control">
          <button onClick={() => setIsMuted(!isMuted)} className="control-button">
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
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              setIsMuted(newVolume === 0);
            }}
            className="volume-slider"
          />
        </div>

        <div className="speed-control">
          <Settings className="w-4 h-4" />
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            className="speed-select"
          >
            {playbackRates.map(rate => (
              <option key={rate} value={rate}>{rate}x</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="control-button"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h4>Audio Settings</h4>

          <div className="setting-group">
            <label>Voice Profile</label>
            <select
              value={audioSettings.voiceProfile}
              onChange={(e) => setAudioSettings({
                ...audioSettings,
                voiceProfile: e.target.value
              })}
            >
              {voiceProfiles.map(profile => (
                <option key={profile.value} value={profile.value}>
                  {profile.label}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-group">
            <label>Emotion</label>
            <select
              value={audioSettings.emotion}
              onChange={(e) => setAudioSettings({
                ...audioSettings,
                emotion: e.target.value
              })}
            >
              <option value="neutral">Neutral</option>
              <option value="cheerful">Cheerful</option>
              <option value="friendly">Friendly</option>
              <option value="hopeful">Hopeful</option>
              <option value="sad">Sad</option>
              <option value="excited">Excited</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Skip Interval</label>
            <select
              value={audioSettings.skipInterval}
              onChange={(e) => setAudioSettings({
                ...audioSettings,
                skipInterval: parseInt(e.target.value)
              })}
            >
              <option value={10}>10 seconds</option>
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
            </select>
          </div>

          <button
            onClick={generateAudio}
            disabled={isGenerating || !text}
            className="regenerate-button"
          >
            {isGenerating ? 'Generating...' : 'Apply Settings'}
          </button>
        </div>
      )}
    </div>
  );
};
