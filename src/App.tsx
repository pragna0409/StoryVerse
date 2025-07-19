 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Library from './pages/Library';
import Discover from './pages/Discover';
import StoryGenerator from './pages/StoryGenerator';
import Profile from './pages/Profile';
import AudioPlayer from './components/AudioPlayer';
import MusicPlayer from './components/MusicPlayer';
import { ThemeProvider } from './contexts/ThemeContext';
import { LibraryProvider } from './contexts/LibraryContext';

function App() {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/story-generator" element={<StoryGenerator />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <AudioPlayer />
            <MusicPlayer />
          </div>
        </Router>
      </LibraryProvider>
    </ThemeProvider>
  );
}

export default App;