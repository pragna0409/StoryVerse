// frontend/src/components/SocialIntegrations.tsx
import React, { useState } from 'react';
import { Music, Image, CheckCircle, AlertCircle } from 'lucide-react';

interface IntegrationStatus {
  spotify: 'disconnected' | 'connecting' | 'connected' | 'error';
  pinterest: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export const SocialIntegrations: React.FC = () => {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    spotify: 'disconnected',
    pinterest: 'disconnected'
  });

  const [analysisResults, setAnalysisResults] = useState<{
    spotify?: any;
    pinterest?: any;
  }>({});

  const connectSpotify = async () => {
    setIntegrationStatus(prev => ({ ...prev, spotify: 'connecting' }));

    try {
      const response = await fetch('/api/integrations/spotify/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      } else {
        throw new Error('Failed to initiate Spotify connection');
      }
    } catch (error) {
      setIntegrationStatus(prev => ({ ...prev, spotify: 'error' }));
      console.error('Spotify connection failed:', error);
    }
  };

  const connectPinterest = async () => {
    setIntegrationStatus(prev => ({ ...prev, pinterest: 'connecting' }));

    try {
      const response = await fetch('/api/integrations/pinterest/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      } else {
        throw new Error('Failed to initiate Pinterest connection');
      }
    } catch (error) {
      setIntegrationStatus(prev => ({ ...prev, pinterest: 'error' }));
      console.error('Pinterest connection failed:', error);
    }
  };

  const generateReadingPlaylist = async () => {
    try {
      const response = await fetch('/api/integrations/spotify/generate-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          genre: 'ambient',
          mood: 'focused',
          duration: 60 // minutes
        })
      });

      if (response.ok) {
        const { playlist } = await response.json();
        alert(`Created reading playlist: ${playlist.name}`);
      }
    } catch (error) {
      console.error('Failed to generate playlist:', error);
    }
  };

  const analyzeAesthetics = async () => {
    try {
      const response = await fetch('/api/integrations/pinterest/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const analysis = await response.json();
        setAnalysisResults(prev => ({ ...prev, pinterest: analysis }));
      }
    } catch (error) {
      console.error('Failed to analyze Pinterest:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'connecting':
        return <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="social-integrations">
      <h3 className="text-xl font-semibold mb-6">Connected Services</h3>

      {/* Spotify Integration */}
      <div className="integration-card">
        <div className="integration-header">
          <div className="integration-info">
            <Music className="w-8 h-8 text-green-500" />
            <div>
              <h4>Spotify</h4>
              <p>Connect for personalized reading playlists</p>
            </div>
          </div>
          <div className="integration-status">
            {getStatusIcon(integrationStatus.spotify)}
            {integrationStatus.spotify === 'disconnected' && (
              <button onClick={connectSpotify} className="connect-button">
                Connect
              </button>
            )}
          </div>
        </div>

        {integrationStatus.spotify === 'connected' && (
          <div className="integration-features">
            <button onClick={generateReadingPlaylist} className="feature-button">
              Generate Reading Playlist
            </button>

            {analysisResults.spotify && (
              <div className="analysis-results">
                <h5>Your Music Profile:</h5>
                <div className="music-insights">
                  <div className="insight">
                    <span>Energy Level:</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${analysisResults.spotify.energyLevel * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="genre-preferences">
                    <span>Top Genres:</span>
                    <div className="genre-tags">
                      {Object.entries(analysisResults.spotify.genrePreferences)
                        .slice(0, 3)
                        .map(([genre]) => (
                          <span key={genre} className="genre-tag">
                            {genre}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pinterest Integration */}
      <div className="integration-card">
        <div className="integration-header">
          <div className="integration-info">
            <Image className="w-8 h-8 text-red-500" />
            <div>
              <h4>Pinterest</h4>
              <p>Analyze your boards for book recommendations</p>
            </div>
          </div>
          <div className="integration-status">
            {getStatusIcon(integrationStatus.pinterest)}
            {integrationStatus.pinterest === 'disconnected' && (
              <button onClick={connectPinterest} className="connect-button">
                Connect
              </button>
            )}
          </div>
        </div>

        {integrationStatus.pinterest === 'connected' && (
          <div className="integration-features">
            <button onClick={analyzeAesthetics} className="feature-button">
              Analyze My Aesthetic
            </button>

            {analysisResults.pinterest && (
              <div className="analysis-results">
                <h5>Your Aesthetic Profile:</h5>
                <div className="aesthetic-insights">
                  <div className="color-palette">
                    <span>Dominant Colors:</span>
                    <div className="color-swatches">
                      {analysisResults.pinterest.colorPalette.slice(0, 5).map((color: string, index: number) => (
                        <div
                          key={index}
                          className="color-swatch"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="recommended-genres">
                    <span>Recommended Genres:</span>
                    <div className="genre-tags">
                      {analysisResults.pinterest.bookGenreMapping.map((genre: string) => (
                        <span key={genre} className="genre-tag">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
