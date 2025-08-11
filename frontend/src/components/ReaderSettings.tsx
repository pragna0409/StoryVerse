// frontend/src/components/ReaderSettings.tsx
import React, { useState } from 'react';
import type { ReaderSettings as ReaderSettingsType } from '../types';

export const ReaderSettings: React.FC = () => {
    const [settings, setSettings] = useState<ReaderSettingsType>({
      fontSize: 16,
      fontFamily: 'serif',
      lineHeight: 1.6,
      theme: 'light',
      autoScroll: false,
      textToSpeech: false,
      backgroundMusic: false
    });
  

  
    const saveSettings = async () => {
      await fetch('/api/user/reading-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(settings)
      });
    };
  
    return (
      <div className="reader-settings">
        <h3>Reading Preferences</h3>
  
        <div className="setting-group">
          <label>Font Size</label>
          <input
            type="range"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={(e) => setSettings({...settings, fontSize: Number(e.target.value)})}
          />
          <span>{settings.fontSize}px</span>
        </div>
  
        
  
        <button onClick={saveSettings}>Save Preferences</button>
      </div>
    );
  };
  