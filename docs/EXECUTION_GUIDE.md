 # StoryVerse: Complete Execution Guide
## From Zero to Production - Step by Step Implementation

---

## 🎯 **PHASE 0: PROJECT SETUP & PLANNING (Week 1)**

### **Day 1-2: Environment Setup**

#### **1. Development Environment Setup**
```bash
# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python (3.11+)
sudo apt update
sudo apt install python3.11 python3.11-pip python3.11-venv

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git

# Install VS Code with extensions
# - ES7+ React/Redux/React-Native snippets
# - Tailwind CSS IntelliSense
# - Python
# - Docker
# - GitLens
```

#### **2. Project Structure Creation**
```bash
mkdir storyverse-platform
cd storyverse-platform

# Create main directories
mkdir -p {frontend,backend,ai-services,database,docs,scripts,tests}

# Initialize Git repository
git init
git remote add origin https://github.com/yourusername/storyverse-platform.git
```

#### **3. Frontend Setup (React + TypeScript + Tailwind)**
```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install

# Install additional dependencies
npm install react-router-dom@latest lucide-react@latest
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
npm install @types/react@latest @types/react-dom@latest

# Initialize Tailwind CSS
npx tailwindcss init -p

# Install development tools
npm install -D eslint@latest prettier@latest @typescript-eslint/eslint-plugin@latest
```

#### **4. Backend Setup (Node.js + Express + TypeScript)**
```bash
cd ../backend
npm init -y
npm install express@latest cors@latest helmet@latest morgan@latest dotenv@latest
npm install jsonwebtoken@latest bcryptjs@latest multer@latest
npm install pg@latest redis@latest mongodb@latest
npm install @types/express@latest @types/cors@latest @types/jsonwebtoken@latest @types/bcryptjs@latest @types/multer@latest @types/pg@latest
npm install -D typescript@latest @types/node@latest ts-node@latest nodemon@latest

# Initialize TypeScript
npx tsc --init
```

#### **5. AI Services Setup (Python + FastAPI)**
```bash
cd ../ai-services
python3.11 -m venv venv
source venv/bin/activate

# Install core dependencies
pip install fastapi[all] uvicorn[standard] python-multipart
pip install openai langchain transformers torch
pip install pandas numpy scikit-learn tensorflow
pip install redis pymongo psycopg2-binary
pip install python-dotenv pydantic requests aiohttp
pip install azure-cognitiveservices-speech gTTS
pip install Pillow opencv-python pytesseract
pip install spacy nltk textblob
```

### **Day 3-4: Database Setup**

#### **1. Docker Compose for Development Databases**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: storyverse_dev
      POSTGRES_USER: storyverse_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: dev_password
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elastic_data:/usr/share/elasticsearch/data

volumes:
  postgres_data:
  redis_data:
  mongo_data:
  elastic_data:
```

#### **2. Database Schema Creation**
```sql
-- database/init.sql
-- Create all tables as defined in wireframe
-- (Copy the complete PostgreSQL schema from wireframe)
```

### **Day 5-7: API Keys & External Service Setup**

#### **1. Required API Keys & Services**
```bash
# Create .env files for each service

# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_PINTEREST_CLIENT_ID=your_pinterest_client_id

# backend/.env
DATABASE_URL=postgresql://storyverse_user:dev_password@localhost:5432/storyverse_dev
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://admin:dev_password@localhost:27017
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=your_openai_api_key
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
PINTEREST_CLIENT_ID=your_pinterest_client_id
PINTEREST_CLIENT_SECRET=your_pinterest_client_secret

# ai-services/.env
OPENAI_API_KEY=your_openai_api_key
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region
DATABASE_URL=postgresql://storyverse_user:dev_password@localhost:5432/storyverse_dev
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://admin:dev_password@localhost:27017
```

#### **2. External Service Registration**
- **OpenAI API**: Register at platform.openai.com
- **Azure Cognitive Services**: Create Speech service in Azure portal
- **Spotify Developer**: Register app at developer.spotify.com
- **Pinterest Developer**: Register app at developers.pinterest.com

---

## 🎯 **PHASE 1: CORE FOUNDATION (Weeks 2-4)**

### **Week 2: Authentication & User Management**

#### **Day 1-2: Backend Authentication System**
```typescript
// backend/src/models/User.ts
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserModel {
  constructor(private db: Pool) {}

  async createUser(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const query = `
      INSERT INTO users (email, password_hash, username, full_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, username, full_name, created_at
    `;
    const result = await this.db.query(query, [
      userData.email,
      hashedPassword,
      userData.username,
      userData.fullName
    ]);
    return result.rows[0];
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) return null;
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name
    };
  }

  generateTokens(userId: string): TokenPair {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );
    
    return { accessToken, refreshToken };
  }
}
```

#### **Day 3-4: Frontend Authentication**
```typescript
// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const { user, accessToken, refreshToken } = await response.json();
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
  };

  const register = async (userData: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) throw new Error('Registration failed');

    const { user, accessToken, refreshToken } = await response.json();
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### **Day 5-7: User Profile Management**
```typescript
// backend/src/controllers/profileController.ts
export class ProfileController {
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const updates = req.body;
      
      const updatedUser = await this.userModel.updateProfile(userId, updates);
      res.json({ user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: 'Profile update failed' });
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const avatarUrl = await this.fileService.uploadAvatar(userId, file);
      await this.userModel.updateAvatar(userId, avatarUrl);
      
      res.json({ avatarUrl });
    } catch (error) {
      res.status(500).json({ error: 'Avatar upload failed' });
    }
  }
}
```

### **Week 3: Library Management System**

#### **Day 1-3: PDF Upload & Processing**
```typescript
// backend/src/services/pdfService.ts
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';
import { v4 as uuidv4 } from 'uuid';

export class PDFService {
  private pdfExtract = new PDFExtract();
  
  async processPDF(file: Express.Multer.File, userId: string): Promise<ProcessedBook> {
    const bookId = uuidv4();
    const filePath = await this.saveFile(file, bookId);
    
    // Extract text content
    const extractedData = await this.pdfExtract.extract(filePath);
    const textContent = this.extractTextFromPages(extractedData.pages);
    
    // Extract metadata
    const metadata = await this.extractMetadata(extractedData);
    
    // Generate cover if not present
    const coverUrl = await this.generateCover(metadata.title, metadata.author);
    
    // Save to database
    const book = await this.bookModel.createBook({
      id: bookId,
      title: metadata.title || file.originalname.replace('.pdf', ''),
      author: metadata.author || 'Unknown Author',
      filePath,
      coverUrl,
      textContent,
      uploadedBy: userId,
      pageCount: extractedData.pages.length
    });
    
    return book;
  }

  private async extractMetadata(pdfData: any): Promise<BookMetadata> {
    // Use AI to extract title, author, genre from content
    const firstPages = pdfData.pages.slice(0, 3)
      .map(page => page.content.map(item => item.str).join(' '))
      .join('\n');
    
    const aiAnalysis = await this.aiService.analyzeBookContent(firstPages);
    
    return {
      title: aiAnalysis.title,
      author: aiAnalysis.author,
      genre: aiAnalysis.genre,
      description: aiAnalysis.description
    };
  }
}
```

#### **Day 4-5: Library Organization**
```typescript
// frontend/src/components/LibraryManager.tsx
import React, { useState, useEffect } from 'react';
import { Upload, Search, Filter, Grid, List } from 'lucide-react';

export const LibraryManager: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<LibraryFilters>({
    genre: 'all',
    status: 'all',
    rating: 'all'
  });

  const handleFileUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.type === 'application/pdf') {
        await uploadBook(file);
      }
    }
  };

  const uploadBook = async (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
      const response = await fetch('/api/books/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const newBook = await response.json();
        setBooks(prev => [...prev, newBook]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="library-manager">
      <div className="library-header">
        <h1>My Library</h1>
        <div className="library-controls">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <FilterPanel filters={filters} onChange={setFilters} />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <UploadButton onUpload={handleFileUpload} />
        </div>
      </div>
      
      <BookGrid 
        books={filteredBooks} 
        viewMode={viewMode}
        onBookSelect={handleBookSelect}
      />
    </div>
  );
};
```

#### **Day 6-7: Reading Progress Tracking**
```typescript
// backend/src/services/readingProgressService.ts
export class ReadingProgressService {
  async updateProgress(userId: string, bookId: string, progressData: ProgressUpdate) {
    const query = `
      INSERT INTO reading_sessions (user_id, book_id, start_time, end_time, pages_read, words_read)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, book_id) 
      DO UPDATE SET 
        end_time = $4,
        pages_read = reading_sessions.pages_read + $5,
        words_read = reading_sessions.words_read + $6,
        updated_at = NOW()
    `;
    
    await this.db.query(query, [
      userId, bookId, progressData.startTime, progressData.endTime,
      progressData.pagesRead, progressData.wordsRead
    ]);
    
    // Update overall progress in user_library
    await this.updateLibraryProgress(userId, bookId, progressData.percentage);
  }

  async getReadingStats(userId: string): Promise<ReadingStats> {
    const query = `
      SELECT 
        COUNT(*) as total_books,
        SUM(pages_read) as total_pages,
        SUM(EXTRACT(EPOCH FROM (end_time - start_time))/60) as total_minutes,
        AVG(pages_read / NULLIF(EXTRACT(EPOCH FROM (end_time - start_time))/60, 0)) as avg_reading_speed
      FROM reading_sessions 
      WHERE user_id = $1 AND end_time IS NOT NULL
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows[0];
  }
}
```

### **Week 4: Basic Reading Interface**

#### **Day 1-3: PDF Reader Component**
```typescript
// frontend/src/components/PDFReader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Settings, Play, Pause } from 'lucide-react';

export const PDFReader: React.FC<{ book: Book; onClose: () => void }> = ({ book, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  
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
      // Start text-to-speech
      const pageContent = await getPageContent(currentPage);
      await startTextToSpeech(pageContent);
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
          <button onClick={() => setShowSettings(!showSettings)}>
            <Settings />
          </button>
        </div>
      </div>
      
      <div className="reader-content" ref={contentRef} style={{ fontSize: `${fontSize}px` }}>
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
```

#### **Day 4-5: Text-to-Speech Integration**
```python
# ai-services/src/tts_service.py
from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer, AudioConfig
from azure.cognitiveservices.speech.audio import AudioOutputConfig
import os
import asyncio
from typing import Optional

class TextToSpeechService:
    def __init__(self):
        self.speech_config = SpeechConfig(
            subscription=os.getenv('AZURE_SPEECH_KEY'),
            region=os.getenv('AZURE_SPEECH_REGION')
        )
        
    async def synthesize_text(
        self, 
        text: str, 
        voice_name: str = "en-US-JennyNeural",
        speaking_rate: float = 1.0,
        output_format: str = "audio-16khz-32kbitrate-mono-mp3"
    ) -> bytes:
        """
        Convert text to speech using Azure Cognitive Services
        """
        self.speech_config.speech_synthesis_voice_name = voice_name
        self.speech_config.set_speech_synthesis_output_format_by_name(output_format)
        
        # Create SSML for better control
        ssml = self.create_ssml(text, voice_name, speaking_rate)
        
        # Configure audio output to memory
        audio_config = AudioOutputConfig(use_default_speaker=False)
        synthesizer = SpeechSynthesizer(
            speech_config=self.speech_config, 
            audio_config=audio_config
        )
        
        # Synthesize speech
        result = synthesizer.speak_ssml_async(ssml).get()
        
        if result.reason == result.reason.SynthesizingAudioCompleted:
            return result.audio_data
        else:
            raise Exception(f"Speech synthesis failed: {result.reason}")
    
    def create_ssml(self, text: str, voice_name: str, speaking_rate: float) -> str:
        """
        Create SSML markup for enhanced speech synthesis
        """
        # Add natural pauses and emphasis
        enhanced_text = self.enhance_text_for_speech(text)
        
        ssml = f"""
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
            <voice name="{voice_name}">
                <prosody rate="{speaking_rate}">
                    {enhanced_text}
                </prosody>
            </voice>
        </speak>
        """
        return ssml
    
    def enhance_text_for_speech(self, text: str) -> str:
        """
        Add pauses and emphasis for natural speech
        """
        import re
        
        # Add pauses at punctuation
        text = re.sub(r'\.', '.<break time="500ms"/>', text)
        text = re.sub(r',', ',<break time="200ms"/>', text)
        text = re.sub(r';', ';<break time="300ms"/>', text)
        text = re.sub(r':', ':<break time="250ms"/>', text)
        
        # Add emphasis to quoted text
        text = re.sub(r'"([^"]*)"', r'<emphasis level="moderate">"\1"</emphasis>', text)
        
        return text

# FastAPI endpoint
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()
tts_service = TextToSpeechService()

class TTSRequest(BaseModel):
    text: str
    voice_name: str = "en-US-JennyNeural"
    speaking_rate: float = 1.0

@app.post("/synthesize")
async def synthesize_speech(request: TTSRequest):
    try:
        audio_data = await tts_service.synthesize_text(
            request.text,
            request.voice_name,
            request.speaking_rate
        )
        
        return {
            "audio_data": audio_data.hex(),  # Convert to hex for JSON transport
            "content_type": "audio/mpeg"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### **Day 6-7: Reading Settings & Preferences**
```typescript
// frontend/src/components/ReaderSettings.tsx
export const ReaderSettings: React.FC = () => {
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 16,
    fontFamily: 'serif',
    lineHeight: 1.6,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    voiceType: 'female',
    readingSpeed: 1.0,
    autoScroll: false,
    nightMode: false
  });

  const voiceOptions = [
    { value: 'en-US-JennyNeural', label: 'Jenny (Female, Professional)' },
    { value: 'en-US-AriaNeural', label: 'Aria (Female, Warm)' },
    { value: 'en-US-GuyNeural', label: 'Guy (Male, Friendly)' },
    { value: 'en-US-DavisNeural', label: 'Davis (Male, Authoritative)' }
  ];

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
      
      <div className="setting-group">
        <label>Voice</label>
        <select
          value={settings.voiceType}
          onChange={(e) => setSettings({...settings, voiceType: e.target.value})}
        >
          {voiceOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="setting-group">
        <label>Reading Speed</label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={settings.readingSpeed}
          onChange={(e) => setSettings({...settings, readingSpeed: Number(e.target.value)})}
        />
        <span>{settings.readingSpeed}x</span>
      </div>
      
      <button onClick={saveSettings}>Save Preferences</button>
    </div>
  );
};
```

---

## 🎯 **PHASE 2: AI INTEGRATION (Weeks 5-8)**

### **Week 5: AI Story Generation System**

#### **Day 1-2: OpenAI Integration Setup**
```python
# ai-services/src/story_generation/story_engine.py
import openai
from typing import List, Dict, Any
import json
import asyncio
from dataclasses import dataclass

@dataclass
class StoryChoice:
    id: int
    text: str
    description: str
    consequences: str

@dataclass
class StorySegment:
    content: str
    choices: List[StoryChoice]
    metadata: Dict[str, Any]

class StoryGenerationEngine:
    def __init__(self, api_key: str):
        openai.api_key = api_key
        self.model = "gpt-4-turbo-preview"
        
    async def generate_initial_story(
        self,
        genre: str,
        characters: str,
        setting: str,
        user_preferences: Dict[str, Any]
    ) -> StorySegment:
        """
        Generate the opening segment of an interactive story
        """
        prompt = self.create_initial_prompt(genre, characters, setting, user_preferences)
        
        response = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=[
                {"role": "system", "content": self.get_system_prompt()},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=1000
        )
        
        story_data = self.parse_story_response(response.choices[0].message.content)
        choices = await self.generate_choices(story_data['content'], genre)
        
        return StorySegment(
            content=story_data['content'],
            choices=choices,
            metadata={
                'genre': genre,
                'mood': story_data.get('mood', 'neutral'),
                'complexity': story_data.get('complexity', 'medium')
            }
        )
    
    def create_initial_prompt(self, genre: str, characters: str, setting: str, preferences: Dict) -> str:
        return f"""
        Create an engaging opening for a {genre} story with these elements:
        
        Characters: {characters}
        Setting: {setting}
        Writing Style: {preferences.get('writing_style', 'descriptive')}
        Content Rating: {preferences.get('content_rating', 'PG-13')}
        
        Requirements:
        - Write 2-3 compelling paragraphs (200-300 words)
        - Establish the main character and conflict
        - Create an immersive atmosphere appropriate for {genre}
        - End with a situation requiring a decision
        - Use vivid, engaging language
        - Maintain appropriate tone for the genre
        
        Format your response as JSON:
        {{
            "content": "The story text here...",
            "mood": "mysterious/exciting/romantic/etc",
            "complexity": "simple/medium/complex",
            "themes": ["theme1", "theme2"]
        }}
        """
    
    async def generate_choices(self, story_content: str, genre: str) -> List[StoryChoice]:
        """
        Generate three meaningful choices for story continuation
        """
        prompt = f"""
        Based on this {genre} story segment:
        
        {story_content}
        
        Generate exactly 3 distinct choices for how the story could continue.
        Each choice should:
        - Lead to meaningfully different story paths
        - Be appropriate for the {genre} genre
        - Have clear consequences for character development
        - Maintain story momentum
        
        Format as JSON:
        {{
            "choices": [
                {{
                    "id": 1,
                    "text": "Brief choice description",
                    "description": "Detailed explanation of this choice",
                    "consequences": "What this choice might lead to"
                }},
                // ... 2 more choices
            ]
        }}
        """
        
        response = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        choices_data = json.loads(response.choices[0].message.content)
        return [StoryChoice(**choice) for choice in choices_data['choices']]
    
    async def continue_story(
        self,
        previous_content: str,
        chosen_choice: StoryChoice,
        story_context: Dict[str, Any]
    ) -> StorySegment:
        """
        Continue the story based on user's choice
        """
        prompt = f"""
        Previous story content:
        {previous_content}
        
        User chose: {chosen_choice.text}
        Choice description: {chosen_choice.description}
        
        Story context:
        - Genre: {story_context.get('genre')}
        - Current mood: {story_context.get('mood')}
        - Themes: {story_context.get('themes', [])}
        
        Continue the story based on this choice:
        - Write 2-3 paragraphs showing the consequences of the choice
        - Advance the plot meaningfully
        - Maintain character consistency
        - Create new tension or development
        - End with another decision point
        - Keep the same writing style and tone
        
        Format as JSON with the same structure as before.
        """
        
        response = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=800
        )
        
        story_data = self.parse_story_response(response.choices[0].message.content)
        new_choices = await self.generate_choices(story_data['content'], story_context['genre'])
        
        return StorySegment(
            content=story_data['content'],
            choices=new_choices,
            metadata=story_context
        )
    
    def get_system_prompt(self) -> str:
        return """
        You are a master storyteller specializing in interactive fiction. Your role is to:
        
        1. Create engaging, immersive narratives that draw readers in
        2. Maintain consistency in character development and world-building
        3. Generate meaningful choices that impact story direction
        4. Adapt writing style to match genre conventions
        5. Balance description, dialogue, and action appropriately
        6. Create natural cliffhangers that encourage continued reading
        
        Always respond in valid JSON format as requested.
        Ensure all content is appropriate for the specified rating.
        Focus on quality storytelling over quantity of text.
        """
    
    def parse_story_response(self, response: str) -> Dict[str, Any]:
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback parsing if JSON is malformed
            return {
                'content': response,
                'mood': 'neutral',
                'complexity': 'medium',
                'themes': []
            }
```

#### **Day 3-4: Story Management Backend**
```typescript
// backend/src/controllers/storyController.ts
import { Request, Response } from 'express';
import { StoryService } from '../services/storyService';
import { AIService } from '../services/aiService';

export class StoryController {
  constructor(
    private storyService: StoryService,
    private aiService: AIService
  ) {}

  async generateStory(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { genre, characters, setting, preferences } = req.body;
      
      // Validate input
      if (!genre || !characters || !setting) {
        return res.status(400).json({ 
          error: 'Genre, characters, and setting are required' 
        });
      }
      
      // Generate story using AI service
      const storySegment = await this.aiService.generateInitialStory({
        genre,
        characters,
        setting,
        preferences
      });
      
      // Save story to database
      const story = await this.storyService.createStory({
        userId,
        title: `${genre} Adventure`,
        genre,
        characters,
        setting,
        content: storySegment.content,
        choices: storySegment.choices,
        metadata: storySegment.metadata
      });
      
      res.json({ story });
    } catch (error) {
      console.error('Story generation failed:', error);
      res.status(500).json({ error: 'Story generation failed' });
    }
  }

  async continueStory(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { storyId } = req.params;
      const { choiceId } = req.body;
      
      // Get existing story
      const story = await this.storyService.getStory(storyId, userId);
      if (!story) {
        return res.status(404).json({ error: 'Story not found' });
      }
      
      // Find the chosen choice
      const chosenChoice = story.currentChoices.find(c => c.id === choiceId);
      if (!chosenChoice) {
        return res.status(400).json({ error: 'Invalid choice' });
      }
      
      // Generate continuation
      const continuation = await this.aiService.continueStory(
        story.content,
        chosenChoice,
        story.metadata
      );
      
      // Update story in database
      const updatedStory = await this.storyService.updateStory(storyId, {
        content: story.content + '\n\n' + continuation.content,
        choices: continuation.choices,
        choicesMade: [...story.choicesMade, chosenChoice]
      });
      
      res.json({ story: updatedStory });
    } catch (error) {
      console.error('Story continuation failed:', error);
      res.status(500).json({ error: 'Story continuation failed' });
    }
  }

  async saveStory(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { storyId } = req.params;
      const { title, isPublic } = req.body;
      
      const updatedStory = await this.storyService.updateStory(storyId, {
        title,
        isPublic,
        isCompleted: true
      });
      
      res.json({ story: updatedStory });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save story' });
    }
  }

  async getUserStories(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      const stories = await this.storyService.getUserStories(
        userId,
        Number(page),
        Number(limit)
      );
      
      res.json({ stories });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stories' });
    }
  }
}
```

#### **Day 5-7: Frontend Story Generator Interface**
```typescript
// frontend/src/components/StoryGenerator.tsx
import React, { useState } from 'react';
import { Wand2, Save, Play, Pause, Download } from 'lucide-react';

interface StoryGeneratorProps {}

export const StoryGenerator: React.FC<StoryGeneratorProps> = () => {
  const [storySetup, setStorySetup] = useState({
    genre: '',
    characters: '',
    setting: '',
    writingStyle: 'descriptive',
    contentRating: 'PG-13'
  });
  
  const [currentStory, setCurrentStory] = useState<GeneratedStory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const genres = [
    'Fantasy', 'Romance', 'Mystery', 'Sci-Fi', 'Horror', 'Adventure',
    'Historical Fiction', 'Comedy', 'Drama', 'Thriller'
  ];

  const generateStory = async () => {
    if (!storySetup.genre || !storySetup.characters || !storySetup.setting) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(storySetup)
      });

      if (response.ok) {
        const { story } = await response.json();
        setCurrentStory(story);
      } else {
        throw new Error('Story generation failed');
      }
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const continueStory = async (choiceId: number) => {
    if (!currentStory) return;

    setIsGenerating(true);
    
    try {
      const response = await fetch(`/api/stories/${currentStory.id}/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ choiceId })
      });

      if (response.ok) {
        const { story } = await response.json();
        setCurrentStory(story);
      }
    } catch (error) {
      console.error('Error continuing story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAudio = async () => {
    if (!currentStory) return;

    if (isPlaying) {
      // Stop audio
      setIsPlaying(false);
    } else {
      // Start text-to-speech
      try {
        const response = await fetch('/api/tts/synthesize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            text: currentStory.content,
            voiceType: 'female' // Get from user preferences
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onended = () => setIsPlaying(false);
          audio.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Audio playback failed:', error);
      }
    }
  };

  const saveStory = async () => {
    if (!currentStory) return;

    const title = prompt('Enter a title for your story:');
    if (!title) return;

    try {
      await fetch(`/api/stories/${currentStory.id}/save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ title, isPublic: false })
      });

      alert('Story saved successfully!');
    } catch (error) {
      console.error('Failed to save story:', error);
    }
  };

  return (
    <div className="story-generator">
      {!currentStory ? (
        <div className="story-setup">
          <h1>Create Your Interactive Story</h1>
          
          <div className="setup-form">
            <div className="form-group">
              <label>Genre *</label>
              <select
                value={storySetup.genre}
                onChange={(e) => setStorySetup({...storySetup, genre: e.target.value})}
              >
                <option value="">Select a genre</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Main Character(s) *</label>
              <input
                type="text"
                placeholder="e.g., A brave knight named Alex"
                value={storySetup.characters}
                onChange={(e) => setStorySetup({...storySetup, characters: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Setting *</label>
              <input
                type="text"
                placeholder="e.g., An enchanted forest in medieval times"
                value={storySetup.setting}
                onChange={(e) => setStorySetup({...storySetup, setting: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Writing Style</label>
              <select
                value={storySetup.writingStyle}
                onChange={(e) => setStorySetup({...storySetup, writingStyle: e.target.value})}
              >
                <option value="descriptive">Descriptive</option>
                <option value="action-packed">Action-Packed</option>
                <option value="dialogue-heavy">Dialogue-Heavy</option>
                <option value="atmospheric">Atmospheric</option>
              </select>
            </div>

            <button
              onClick={generateStory}
              disabled={isGenerating}
              className="generate-button"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="spinning" />
                  Generating Story...
                </>
              ) : (
                <>
                  <Wand2 />
                  Generate Story
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="story-display">
          <div className="story-header">
            <h2>{currentStory.title}</h2>
            <div className="story-controls">
              <button onClick={toggleAudio}>
                {isPlaying ? <Pause /> : <Play />}
              </button>
              <button onClick={saveStory}>
                <Save />
              </button>
              <button onClick={() => window.print()}>
                <Download />
              </button>
            </div>
          </div>

          <div className="story-content">
            <div className="story-text">
              {currentStory.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {currentStory.choices && currentStory.choices.length > 0 && (
              <div className="story-choices">
                <h3>What happens next?</h3>
                <div className="choices-grid">
                  {currentStory.choices.map(choice => (
                    <button
                      key={choice.id}
                      onClick={() => continueStory(choice.id)}
                      disabled={isGenerating}
                      className="choice-button"
                    >
                      <div className="choice-text">{choice.text}</div>
                      <div className="choice-description">{choice.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

### **Week 6: Recommendation Engine**

#### **Day 1-2: Collaborative Filtering Algorithm**
```python
# ai-services/src/recommendation/collaborative_filter.py
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from typing import List, Dict, Tuple
import asyncio

class CollaborativeFilter:
    def __init__(self, n_components: int = 50):
        self.n_components = n_components
        self.svd = TruncatedSVD(n_components=n_components, random_state=42)
        self.user_item_matrix = None
        self.user_similarity = None
        self.item_similarity = None
        
    async def train(self, ratings_data: pd.DataFrame):
        """
        Train the collaborative filtering model
        ratings_data: DataFrame with columns [user_id, book_id, rating]
        """
        # Create user-item matrix
        self.user_item_matrix = ratings_data.pivot(
            index='user_id', 
            columns='book_id', 
            values='rating'
        ).fillna(0)
        
        # Apply SVD for dimensionality reduction
        user_factors = self.svd.fit_transform(self.user_item_matrix)
        item_factors = self.svd.components_.T
        
        # Calculate similarities
        self.user_similarity = cosine_similarity(user_factors)
        self.item_similarity = cosine_similarity(item_factors)
        
    async def get_user_recommendations(
        self, 
        user_id: str, 
        n_recommendations: int = 10
    ) -> List[Dict]:
        """
        Get book recommendations for a specific user
        """
        if self.user_item_matrix is None:
            raise ValueError("Model not trained yet")
            
        user_idx = self.user_item_matrix.index.get_loc(user_id)
        user_ratings = self.user_item_matrix.iloc[user_idx]
        
        # Find similar users
        similar_users = self.get_similar_users(user_idx, top_k=50)
        
        # Get recommendations based on similar users' preferences
        recommendations = []
        for book_id in self.user_item_matrix.columns:
            if user_ratings[book_id] == 0:  # User hasn't rated this book
                predicted_rating = self.predict_rating(user_idx, book_id, similar_users)
                recommendations.append({
                    'book_id': book_id,
                    'predicted_rating': predicted_rating,
                    'recommendation_type': 'collaborative'
                })
        
        # Sort by predicted rating and return top N
        recommendations.sort(key=lambda x: x['predicted_rating'], reverse=True)
        return recommendations[:n_recommendations]
    
    def get_similar_users(self, user_idx: int, top_k: int = 50) -> List[Tuple[int, float]]:
        """
        Find users similar to the given user
        """
        similarities = self.user_similarity[user_idx]
        similar_indices = np.argsort(similarities)[::-1][1:top_k+1]  # Exclude self
        return [(idx, similarities[idx]) for idx in similar_indices]
    
    def predict_rating(
        self, 
        user_idx: int, 
        book_id: str, 
        similar_users: List[Tuple[int, float]]
    ) -> float:
        """
        Predict rating for a book based on similar users
        """
        weighted_sum = 0
        similarity_sum = 0
        
        for similar_user_idx, similarity in similar_users:
            rating = self.user_item_matrix.iloc[similar_user_idx][book_id]
            if rating > 0:  # User has rated this book
                weighted_sum += similarity * rating
                similarity_sum += abs(similarity)
        
        if similarity_sum == 0:
            return 0
        
        return weighted_sum / similarity_sum

# Content-based filtering
class ContentBasedFilter:
    def __init__(self):
        self.book_features = None
        self.tfidf_vectorizer = None
        self.content_similarity = None
        
    async def train(self, books_data: pd.DataFrame):
        """
        Train content-based model using book features
        books_data: DataFrame with columns [book_id, title, author, genre, description]
        """
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.preprocessing import MultiLabelBinarizer
        
        # Combine text features
        books_data['combined_features'] = (
            books_data['title'].fillna('') + ' ' +
            books_data['author'].fillna('') + ' ' +
            books_data['genre'].fillna('') + ' ' +
            books_data['description'].fillna('')
        )
        
        # Create TF-IDF vectors
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        tfidf_matrix = self.tfidf_vectorizer.fit_transform(books_data['combined_features'])
        
        # Calculate content similarity
        self.content_similarity = cosine_similarity(tfidf_matrix)
        self.book_features = books_data.set_index('book_id')
        
    async def get_content_recommendations(
        self, 
        user_profile: Dict, 
        n_recommendations: int = 10
    ) -> List[Dict]:
        """
        Get recommendations based on user's content preferences
        """
        # Analyze user's reading history to build preference profile
        preferred_genres = user_profile.get('preferred_genres', [])
        favorite_authors = user_profile.get('favorite_authors', [])
        reading_history = user_profile.get('reading_history', [])
        
        # Score books based on content similarity to user preferences
        recommendations = []
        
        for book_id, book_data in self.book_features.iterrows():
            if book_id not in reading_history:
                score = self.calculate_content_score(book_data, user_profile)
                recommendations.append({
                    'book_id': book_id,
                    'content_score': score,
                    'recommendation_type': 'content_based'
                })
        
        recommendations.sort(key=lambda x: x['content_score'], reverse=True)
        return recommendations[:n_recommendations]
    
    def calculate_content_score(self, book_data: pd.Series, user_profile: Dict) -> float:
        """
        Calculate content-based score for a book
        """
        score = 0
        
        # Genre preference
        if book_data['genre'] in user_profile.get('preferred_genres', []):
            score += 0.4
            
        # Author preference
        if book_data['author'] in user_profile.get('favorite_authors', []):
            score += 0.3
            
        # Similarity to previously liked books
        reading_history = user_profile.get('reading_history', [])
        if reading_history:
            book_idx = self.book_features.index.get_loc(book_data.name)
            max_similarity = 0
            
            for read_book_id in reading_history:
                if read_book_id in self.book_features.index:
                    read_book_idx = self.book_features.index.get_loc(read_book_id)
                    similarity = self.content_similarity[book_idx][read_book_idx]
                    max_similarity = max(max_similarity, similarity)
            
            score += 0.3 * max_similarity
        
        return score

# Hybrid recommendation system
class HybridRecommendationEngine:
    def __init__(self):
        self.collaborative_filter = CollaborativeFilter()
        self.content_filter = ContentBasedFilter()
        self.social_analyzer = SocialMediaAnalyzer()
        
    async def get_recommendations(
        self, 
        user_id: str, 
        user_profile: Dict,
        n_recommendations: int = 10
    ) -> List[Dict]:
        """
        Combine multiple recommendation approaches
        """
        # Get recommendations from different algorithms
        collab_recs = await self.collaborative_filter.get_user_recommendations(
            user_id, n_recommendations * 2
        )
        
        content_recs = await self.content_filter.get_content_recommendations(
            user_profile, n_recommendations * 2
        )
        
        social_recs = await self.social_analyzer.get_social_recommendations(
            user_profile, n_recommendations * 2
        )
        
        # Combine and weight recommendations
        combined_recs = self.combine_recommendations(
            collab_recs, content_recs, social_recs
        )
        
        return combined_recs[:n_recommendations]
    
    def combine_recommendations(
        self, 
        collab_recs: List[Dict], 
        content_recs: List[Dict], 
        social_recs: List[Dict]
    ) -> List[Dict]:
        """
        Combine recommendations using weighted scoring
        """
        book_scores = {}
        
        # Weight collaborative filtering (40%)
        for rec in collab_recs:
            book_id = rec['book_id']
            book_scores[book_id] = book_scores.get(book_id, 0) + 0.4 * rec['predicted_rating']
        
        # Weight content-based (35%)
        for rec in content_recs:
            book_id = rec['book_id']
            book_scores[book_id] = book_scores.get(book_id, 0) + 0.35 * rec['content_score']
        
        # Weight social recommendations (25%)
        for rec in social_recs:
            book_id = rec['book_id']
            book_scores[book_id] = book_scores.get(book_id, 0) + 0.25 * rec['social_score']
        
        # Convert to list and sort
        final_recommendations = [
            {
                'book_id': book_id,
                'combined_score': score,
                'recommendation_type': 'hybrid'
            }
            for book_id, score in book_scores.items()
        ]
        
        final_recommendations.sort(key=lambda x: x['combined_score'], reverse=True)
        return final_recommendations
```

#### **Day 3-4: Social Media Analysis**
```python
# ai-services/src/recommendation/social_analyzer.py
import requests
import asyncio
from typing import Dict, List, Any
import cv2
import numpy as np
from PIL import Image
import io
import colorsys

class PinterestAnalyzer:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        
    async def analyze_pinterest_boards(self, access_token: str) -> Dict[str, Any]:
        """
        Analyze user's Pinterest boards to extract reading preferences
        """
        boards = await self.get_user_boards(access_token)
        analysis_results = {
            'color_preferences': [],
            'aesthetic_themes': [],
            'interest_keywords': [],
            'mood_profile': {},
            'genre_indicators': []
        }
        
        for board in boards:
            board_analysis = await self.analyze_board(board, access_token)
            
            # Aggregate color preferences
            analysis_results['color_preferences'].extend(board_analysis['colors'])
            
            # Extract themes
            analysis_results['aesthetic_themes'].extend(board_analysis['themes'])
            
            # Collect keywords
            analysis_results['interest_keywords'].extend(board_analysis['keywords'])
            
            # Analyze mood
            mood = board_analysis['mood']
            for mood_type, score in mood.items():
                analysis_results['mood_profile'][mood_type] = (
                    analysis_results['mood_profile'].get(mood_type, 0) + score
                )
        
        # Normalize mood scores
        total_boards = len(boards)
        if total_boards > 0:
            for mood_type in analysis_results['mood_profile']:
                analysis_results['mood_profile'][mood_type] /= total_boards
        
        # Map to book genres
        analysis_results['genre_indicators'] = self.map_to_book_genres(analysis_results)
        
        return analysis_results
    
    async def get_user_boards(self, access_token: str) -> List[Dict]:
        """
        Fetch user's Pinterest boards
        """
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(
            'https://api.pinterest.com/v5/boards',
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json().get('items', [])
        return []
    
    async def analyze_board(self, board: Dict, access_token: str) -> Dict[str, Any]:
        """
        Analyze individual Pinterest board
        """
        pins = await self.get_board_pins(board['id'], access_token)
        
        colors = []
        themes = []
        keywords = []
        mood_scores = {'romantic': 0, 'dark': 0, 'bright': 0, 'minimalist': 0}
        
        for pin in pins[:20]:  # Analyze first 20 pins
            if pin.get('media', {}).get('images'):
                image_url = pin['media']['images']['original']['url']
                
                # Analyze image colors
                pin_colors = await self.extract_colors_from_image(image_url)
                colors.extend(pin_colors)
                
                # Analyze mood from colors and composition
                pin_mood = self.analyze_image_mood(pin_colors)
                for mood_type, score in pin_mood.items():
                    mood_scores[mood_type] += score
            
            # Extract keywords from description
            description = pin.get('description', '') + ' ' + pin.get('title', '')
            pin_keywords = self.extract_keywords(description)
            keywords.extend(pin_keywords)
        
        # Normalize mood scores
        total_pins = len(pins)
        if total_pins > 0:
            for mood_type in mood_scores:
                mood_scores[mood_type] /= total_pins
        
        return {
            'colors': colors,
            'themes': themes,
            'keywords': keywords,
            'mood': mood_scores
        }
    
    async def extract_colors_from_image(self, image_url: str) -> List[str]:
        """
        Extract dominant colors from Pinterest image
        """
        try:
            response = requests.get(image_url)
            image = Image.open(io.BytesIO(response.content))
            image = image.convert('RGB')
            
            # Resize for faster processing
            image = image.resize((150, 150))
            
            # Convert to numpy array
            img_array = np.array(image)
            
            # Reshape to list of pixels
            pixels = img_array.reshape(-1, 3)
            
            # Use k-means clustering to find dominant colors
            from sklearn.cluster import KMeans
            kmeans = KMeans(n_clusters=5, random_state=42)
            kmeans.fit(pixels)
            
            # Convert colors to hex
            dominant_colors = []
            for color in kmeans.cluster_centers_:
                hex_color = '#{:02x}{:02x}{:02x}'.format(
                    int(color[0]), int(color[1]), int(color[2])
                )
                dominant_colors.append(hex_color)
            
            return dominant_colors
            
        except Exception as e:
            print(f"Error extracting colors: {e}")
            return []
    
    def analyze_image_mood(self, colors: List[str]) -> Dict[str, float]:
        """
        Analyze mood based on color palette
        """
        mood_scores = {'romantic': 0, 'dark': 0, 'bright': 0, 'minimalist': 0}
        
        for hex_color in colors:
            # Convert hex to RGB
            rgb = tuple(int(hex_color[i:i+2], 16) for i in (1, 3, 5))
            
            # Convert to HSV for better analysis
            hsv = colorsys.rgb_to_hsv(rgb[0]/255, rgb[1]/255, rgb[2]/255)
            hue, saturation, value = hsv
            
            # Analyze mood based on HSV values
            if saturation < 0.3 and value > 0.8:  # Light, desaturated
                mood_scores['minimalist'] += 1
            elif value < 0.3:  # Dark colors
                mood_scores['dark'] += 1
            elif saturation > 0.7 and value > 0.7:  # Bright, saturated
                mood_scores['bright'] += 1
            elif 0.8 < hue < 1.0 or 0.0 < hue < 0.1:  # Pink/red hues
                mood_scores['romantic'] += 1
        
        # Normalize scores
        total_colors = len(colors)
        if total_colors > 0:
            for mood in mood_scores:
                mood_scores[mood] /= total_colors
        
        return mood_scores
    
    def map_to_book_genres(self, analysis: Dict[str, Any]) -> List[str]:
        """
        Map Pinterest analysis to book genres
        """
        genre_mapping = []
        
        # Mood-based mapping
        mood_profile = analysis['mood_profile']
        
        if mood_profile.get('romantic', 0) > 0.3:
            genre_mapping.append('Romance')
        
        if mood_profile.get('dark', 0) > 0.4:
            genre_mapping.extend(['Horror', 'Mystery', 'Thriller'])
        
        if mood_profile.get('bright', 0) > 0.4:
            genre_mapping.extend(['Comedy', 'Adventure'])
        
        if mood_profile.get('minimalist', 0) > 0.3:
            genre_mapping.extend(['Literary Fiction', 'Philosophy'])
        
        # Keyword-based mapping
        keywords = analysis['interest_keywords']
        keyword_genre_map = {
            'vintage': ['Historical Fiction'],
            'nature': ['Adventure', 'Environmental'],
            'travel': ['Adventure', 'Travel'],
            'art': ['Art', 'Biography'],
            'fashion': ['Contemporary Fiction'],
            'food': ['Cooking', 'Memoir'],
            'quotes': ['Poetry', 'Philosophy']
        }
        
        for keyword in keywords:
            for key, genres in keyword_genre_map.items():
                if key in keyword.lower():
                    genre_mapping.extend(genres)
        
        return list(set(genre_mapping))  # Remove duplicates

class SpotifyAnalyzer:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        
    async def analyze_spotify_preferences(self, access_token: str) -> Dict[str, Any]:
        """
        Analyze Spotify listening habits for book recommendations
        """
        playlists = await self.get_user_playlists(access_token)
        top_tracks = await self.get_user_top_tracks(access_token)
        
        analysis = {
            'genre_preferences': {},
            'mood_profile': {},
            'energy_level': 0,
            'complexity_preference': 0,
            'book_genre_mapping': []
        }
        
        all_tracks = []
        
        # Analyze playlists
        for playlist in playlists:
            tracks = await self.get_playlist_tracks(playlist['id'], access_token)
            all_tracks.extend(tracks)
        
        # Add top tracks
        all_tracks.extend(top_tracks)
        
        # Analyze audio features
        for track in all_tracks:
            audio_features = await self.get_audio_features(track['id'], access_token)
            if audio_features:
                self.update_analysis_with_track(analysis, track, audio_features)
        
        # Normalize scores
        total_tracks = len(all_tracks)
        if total_tracks > 0:
            analysis['energy_level'] /= total_tracks
            analysis['complexity_preference'] /= total_tracks
            
            for mood in analysis['mood_profile']:
                analysis['mood_profile'][mood] /= total_tracks
        
        # Map to book genres
        analysis['book_genre_mapping'] = self.map_music_to_book_genres(analysis)
        
        return analysis
    
    def update_analysis_with_track(
        self, 
        analysis: Dict, 
        track: Dict, 
        audio_features: Dict
    ):
        """
        Update analysis with individual track data
        """
        # Energy level
        analysis['energy_level'] += audio_features.get('energy', 0)
        
        # Complexity (based on instrumentalness and acousticness)
        complexity = (
            audio_features.get('instrumentalness', 0) * 0.6 +
            audio_features.get('acousticness', 0) * 0.4
        )
        analysis['complexity_preference'] += complexity
        
        # Mood analysis
        valence = audio_features.get('valence', 0)
        energy = audio_features.get('energy', 0)
        
        if valence > 0.7:
            analysis['mood_profile']['happy'] = analysis['mood_profile'].get('happy', 0) + 1
        elif valence < 0.3:
            analysis['mood_profile']['melancholy'] = analysis['mood_profile'].get('melancholy', 0) + 1
        
        if energy > 0.7:
            analysis['mood_profile']['energetic'] = analysis['mood_profile'].get('energetic', 0) + 1
        elif energy < 0.3:
            analysis['mood_profile']['calm'] = analysis['mood_profile'].get('calm', 0) + 1
        
        # Genre preferences
        for artist in track.get('artists', []):
            genres = artist.get('genres', [])
            for genre in genres:
                analysis['genre_preferences'][genre] = (
                    analysis['genre_preferences'].get(genre, 0) + 1
                )
    
    def map_music_to_book_genres(self, analysis: Dict) -> List[str]:
        """
        Map music preferences to book genres
        """
        book_genres = []
        
        # Energy-based mapping
        energy = analysis['energy_level']
        if energy > 0.7:
            book_genres.extend(['Action', 'Adventure', 'Thriller'])
        elif energy < 0.3:
            book_genres.extend(['Literary Fiction', 'Poetry', 'Philosophy'])
        
        # Mood-based mapping
        mood_profile = analysis['mood_profile']
        
        if mood_profile.get('happy', 0) > 0.4:
            book_genres.extend(['Comedy', 'Romance', 'Feel-good Fiction'])
        
        if mood_profile.get('melancholy', 0) > 0.4:
            book_genres.extend(['Drama', 'Literary Fiction', 'Memoir'])
        
        if mood_profile.get('calm', 0) > 0.4:
            book_genres.extend(['Meditation', 'Nature Writing', 'Poetry'])
        
        # Music genre to book genre mapping
        music_genres = analysis['genre_preferences']
        
        genre_mapping = {
            'classical': ['Classical Literature', 'Philosophy', 'History'],
            'jazz': ['Beat Literature', 'Biography', 'Music'],
            'rock': ['Counterculture', 'Biography', 'Music'],
            'electronic': ['Science Fiction', 'Cyberpunk', 'Futurism'],
            'folk': ['Historical Fiction', 'Nature Writing', 'Americana'],
            'hip-hop': ['Urban Fiction', 'Social Commentary', 'Biography'],
            'country': ['Southern Fiction', 'Americana', 'Rural Life'],
            'indie': ['Independent Literature', 'Alternative Fiction']
        }
        
        for music_genre, count in music_genres.items():
            for key, book_genre_list in genre_mapping.items():
                if key in music_genre.lower():
                    book_genres.extend(book_genre_list)
        
        return list(set(book_genres))
```

#### **Day 5-7: Recommendation API Integration**
```typescript
// backend/src/controllers/recommendationController.ts
export class RecommendationController {
  constructor(
    private recommendationService: RecommendationService,
    private aiService: AIService
  ) {}

  async getPersonalizedRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { limit = 10, refresh = false } = req.query;
      
      // Check cache first (unless refresh requested)
      if (!refresh) {
        const cachedRecs = await this.recommendationService.getCachedRecommendations(userId);
        if (cachedRecs) {
          return res.json({ recommendations: cachedRecs });
        }
      }
      
      // Get user profile and preferences
      const userProfile = await this.recommendationService.getUserProfile(userId);
      
      // Generate recommendations using AI service
      const recommendations = await this.aiService.generateRecommendations(
        userId,
        userProfile,
        Number(limit)
      );
      
      // Cache recommendations
      await this.recommendationService.cacheRecommendations(userId, recommendations);
      
      // Log recommendation event for analytics
      await this.recommendationService.logRecommendationEvent(userId, recommendations);
      
      res.json({ recommendations });
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  }

  async analyzeSocialMedia(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { platform, accessToken } = req.body;
      
      let analysis;
      
      switch (platform) {
        case 'pinterest':
          analysis = await this.aiService.analyzePinterestAccount(accessToken);
          break;
        case 'spotify':
          analysis = await this.aiService.analyzeSpotifyAccount(accessToken);
          break;
        default:
          return res.status(400).json({ error: 'Unsupported platform' });
      }
      
      // Save analysis to user profile
      await this.recommendationService.updateSocialAnalysis(userId, platform, analysis);
      
      // Generate updated recommendations
      const updatedProfile = await this.recommendationService.getUserProfile(userId);
      const recommendations = await this.aiService.generateRecommendations(
        userId,
        updatedProfile,
        10
      );
      
      res.json({ 
        analysis,
        recommendations,
        message: `${platform} analysis completed successfully`
      });
    } catch (error) {
      console.error('Social media analysis failed:', error);
      res.status(500).json({ error: 'Social media analysis failed' });
    }
  }

  async trackRecommendationInteraction(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { bookId, action, recommendationType } = req.body;
      
      // Valid actions: 'clicked', 'added_to_library', 'dismissed', 'rated'
      await this.recommendationService.trackInteraction(
        userId,
        bookId,
        action,
        recommendationType
      );
      
      // Update recommendation model based on feedback
      if (action === 'rated' || action === 'added_to_library') {
        await this.aiService.updateRecommendationModel(userId, bookId, action);
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to track interaction' });
    }
  }

  async getRecommendationExplanation(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;
      
      const explanation = await this.recommendationService.getRecommendationExplanation(
        userId,
        bookId
      );
      
      res.json({ explanation });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get explanation' });
    }
  }
}
```

### **Week 7: Personality Analysis System**

#### **Day 1-3: Personality Quiz Implementation**
```typescript
// frontend/src/components/PersonalityQuiz.tsx
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Brain } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  category: string;
  options: {
    text: string;
    value: number;
    trait: string;
  }[];
}

const personalityQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "When choosing a book, I prefer...",
    category: "reading_preference",
    options: [
      { text: "Complex, challenging narratives", value: 5, trait: "openness" },
      { text: "Familiar genres I know I'll enjoy", value: 3, trait: "conscientiousness" },
      { text: "Popular bestsellers", value: 2, trait: "extraversion" },
      { text: "Unique, experimental stories", value: 4, trait: "openness" }
    ]
  },
  {
    id: 2,
    question: "I'm most drawn to stories with...",
    category: "content_preference",
    options: [
      { text: "Deep character development", value: 5, trait: "agreeableness" },
      { text: "Fast-paced action", value: 4, trait: "extraversion" },
      { text: "Emotional depth and complexity", value: 4, trait: "neuroticism" },
      { text: "Clear moral lessons", value: 3, trait: "conscientiousness" }
    ]
  },
  {
    id: 3,
    question: "When reading, I prefer...",
    category: "reading_style",
    options: [
      { text: "Complete silence", value: 2, trait: "introversion" },
      { text: "Background music", value: 3, trait: "openness" },
      { text: "Busy environments like cafes", value: 4, trait: "extraversion" },
      { text: "Nature sounds", value: 3, trait: "agreeableness" }
    ]
  },
  {
    id: 4,
    question: "I'm most likely to finish a book if...",
    category: "completion_style",
    options: [
      { text: "I set a specific reading schedule", value: 5, trait: "conscientiousness" },
      { text: "The story grabs me immediately", value: 4, trait: "openness" },
      { text: "Friends are also reading it", value: 3, trait: "extraversion" },
      { text: "It helps me understand myself better", value: 4, trait: "neuroticism" }
    ]
  },
  {
    id: 5,
    question: "My ideal book length is...",
    category: "length_preference",
    options: [
      { text: "Short stories or novellas (under 200 pages)", value: 2, trait: "efficiency" },
      { text: "Standard novels (200-400 pages)", value: 3, trait: "balanced" },
      { text: "Epic novels (400+ pages)", value: 4, trait: "conscientiousness" },
      { text: "It doesn't matter if the story is good", value: 5, trait: "openness" }
    ]
  },
  // Add more questions...
];

export const PersonalityQuiz: React.FC<{
  onComplete: (results: PersonalityResults) => void;
}> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAnswer = (questionId: number, option: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));

    if (currentQuestion < personalityQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setIsCompleted(true);
    
    // Calculate personality scores
    const results = calculatePersonalityScores(answers);
    
    // Send results to backend for analysis
    try {
      const response = await fetch('/api/personality/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ answers, results })
      });

      if (response.ok) {
        const analysisResults = await response.json();
        onComplete(analysisResults);
      }
    } catch (error) {
      console.error('Failed to submit personality quiz:', error);
    }
  };

  const calculatePersonalityScores = (answers: Record<number, any>) => {
    const traits = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    const traitCounts = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    Object.values(answers).forEach((answer: any) => {
      if (traits.hasOwnProperty(answer.trait)) {
        traits[answer.trait as keyof typeof traits] += answer.value;
        traitCounts[answer.trait as keyof typeof traitCounts]++;
      }
    });

    // Normalize scores
    Object.keys(traits).forEach(trait => {
      const key = trait as keyof typeof traits;
      if (traitCounts[key] > 0) {
        traits[key] = traits[key] / (traitCounts[key] * 5); // Normalize to 0-1
      }
    });

    return traits;
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / personalityQuestions.length) * 100;

  if (isCompleted) {
    return (
      <div className="personality-quiz-complete">
        <div className="completion-animation">
          <Brain className="w-16 h-16 text-amber-600 animate-pulse" />
          <h3>Analyzing Your Reading Personality...</h3>
          <p>We're processing your responses to create personalized recommendations.</p>
        </div>
      </div>
    );
  }

  const question = personalityQuestions[currentQuestion];

  return (
    <div className="personality-quiz">
      <div className="quiz-header">
        <h2>Reading Personality Assessment</h2>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">
          Question {currentQuestion + 1} of {personalityQuestions.length}
        </span>
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <h3>{question.question}</h3>
          
          <div className="options-grid">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option)}
                className="option-button"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          <button 
            onClick={goBack}
            disabled={currentQuestion === 0}
            className="nav-button"
          >
            <ChevronLeft /> Back
          </button>
          
          <span className="question-counter">
            {currentQuestion + 1} / {personalityQuestions.length}
          </span>
        </div>
      </div>
    </div>
  );
};
```

#### **Day 4-5: Personality Analysis Backend**
```python
# ai-services/src/personality/analyzer.py
from typing import Dict, List, Any
import numpy as np
from dataclasses import dataclass

@dataclass
class PersonalityProfile:
    openness: float
    conscientiousness: float
    extraversion: float
    agreeableness: float
    neuroticism: float
    reading_preferences: Dict[str, Any]
    book_recommendations: List[str]

class PersonalityAnalyzer:
    def __init__(self):
        self.trait_weights = {
            'openness': {
                'experimental_genres': 0.8,
                'complex_narratives': 0.7,
                'diverse_authors': 0.6,
                'unconventional_formats': 0.5
            },
            'conscientiousness': {
                'non_fiction': 0.7,
                'educational_content': 0.8,
                'structured_narratives': 0.6,
                'goal_oriented_reading': 0.9
            },
            'extraversion': {
                'social_themes': 0.7,
                'dialogue_heavy': 0.6,
                'group_reading': 0.8,
                'popular_titles': 0.5
            },
            'agreeableness': {
                'character_driven': 0.8,
                'emotional_stories': 0.7,
                'positive_endings': 0.6,
                'relationship_focus': 0.9
            },
            'neuroticism': {
                'emotional_intensity': 0.6,
                'psychological_themes': 0.7,
                'cathartic_stories': 0.8,
                'self_help': 0.5
            }
        }
        
    def analyze_personality(
        self, 
        quiz_responses: Dict[int, Any],
        reading_history: List[Dict] = None
    ) -> PersonalityProfile:
        """
        Analyze personality based on quiz responses and reading history
        """
        # Calculate Big Five traits from quiz
        traits = self.calculate_big_five_traits(quiz_responses)
        
        # Enhance with reading history analysis if available
        if reading_history:
            historical_traits = self.analyze_reading_history(reading_history)
            traits = self.combine_trait_analyses(traits, historical_traits)
        
        # Generate reading preferences
        reading_preferences = self.generate_reading_preferences(traits)
        
        # Generate book recommendations
        book_recommendations = self.generate_personality_recommendations(traits)
        
        return PersonalityProfile(
            openness=traits['openness'],
            conscientiousness=traits['conscientiousness'],
            extraversion=traits['extraversion'],
            agreeableness=traits['agreeableness'],
            neuroticism=traits['neuroticism'],
            reading_preferences=reading_preferences,
            book_recommendations=book_recommendations
        )
    
    def calculate_big_five_traits(self, quiz_responses: Dict[int, Any]) -> Dict[str, float]:
        """
        Calculate Big Five personality traits from quiz responses
        """
        traits = {
            'openness': [],
            'conscientiousness': [],
            'extraversion': [],
            'agreeableness': [],
            'neuroticism': []
        }
        
        for question_id, response in quiz_responses.items():
            trait = response.get('trait')
            value = response.get('value', 0) / 5.0  # Normalize to 0-1
            
            if trait in traits:
                traits[trait].append(value)
        
        # Calculate average scores
        final_traits = {}
        for trait, values in traits.items():
            if values:
                final_traits[trait] = np.mean(values)
            else:
                final_traits[trait] = 0.5  # Default neutral score
        
        return final_traits
    
    def analyze_reading_history(self, reading_history: List[Dict]) -> Dict[str, float]:
        """
        Infer personality traits from reading history
        """
        genre_preferences = {}
        completion_rates = []
        rating_patterns = []
        
        for book in reading_history:
            genre = book.get('genre', '').lower()
            genre_preferences[genre] = genre_preferences.get(genre, 0) + 1
            
            if book.get('completion_percentage'):
                completion_rates.append(book['completion_percentage'])
            
            if book.get('user_rating'):
                rating_patterns.append(book['user_rating'])
        
        # Infer traits from patterns
        inferred_traits = {
            'openness': self.calculate_openness_from_history(genre_preferences),
            'conscientiousness': self.calculate_conscientiousness_from_completion(completion_rates),
            'extraversion': self.calculate_extraversion_from_genres(genre_preferences),
            'agreeableness': self.calculate_agreeableness_from_ratings(rating_patterns),
            'neuroticism': self.calculate_neuroticism_from_genres(genre_preferences)
        }
        
        return inferred_traits
    
    def generate_reading_preferences(self, traits: Dict[str, float]) -> Dict[str, Any]:
        """
        Generate detailed reading preferences based on personality traits
        """
        preferences = {
            'preferred_genres': [],
            'content_complexity': 'medium',
            'narrative_style': 'balanced',
            'book_length': 'medium',
            'reading_pace': 'moderate',
            'social_reading': False,
            'experimental_content': False
        }
        
        # Genre preferences based on traits
        if traits['openness'] > 0.7:
            preferences['preferred_genres'].extend([
                'Experimental Fiction', 'Science Fiction', 'Philosophy', 
                'Magical Realism', 'Avant-garde'
            ])
            preferences['experimental_content'] = True
            preferences['content_complexity'] = 'high'
        
        if traits['conscientiousness'] > 0.7:
            preferences['preferred_genres'].extend([
                'Non-fiction', 'Biography', 'History', 'Self-help', 
                'Educational', 'Technical'
            ])
            preferences['reading_pace'] = 'structured'
        
        if traits['extraversion'] > 0.7:
            preferences['preferred_genres'].extend([
                'Contemporary Fiction', 'Romance', 'Adventure', 
                'Social Commentary'
            ])
            preferences['social_reading'] = True
            preferences['narrative_style'] = 'dialogue-heavy'
        
        if traits['agreeableness'] > 0.7:
            preferences['preferred_genres'].extend([
                'Romance', 'Family Saga', 'Coming-of-age', 
                'Inspirational', 'Feel-good Fiction'
            ])
            preferences['narrative_style'] = 'character-driven'
        
        if traits['neuroticism'] > 0.6:
            preferences['preferred_genres'].extend([
                'Psychological Fiction', 'Drama', 'Memoir', 
                'Self-help', 'Mental Health'
            ])
        
        # Book length preferences
        if traits['conscientiousness'] > 0.7:
            preferences['book_length'] = 'long'  # Willing to commit to longer books
        elif traits['openness'] < 0.3:
            preferences['book_length'] = 'short'  # Prefers familiar, shorter reads
        
        return preferences
    
    def generate_personality_recommendations(self, traits: Dict[str, float]) -> List[str]:
        """
        Generate specific book recommendations based on personality profile
        """
        recommendations = []
        
        # High Openness recommendations
        if traits['openness'] > 0.7:
            recommendations.extend([
                'Experimental literature and avant-garde fiction',
                'Cross-cultural narratives and diverse perspectives',
                'Genre-blending and unconventional storytelling',
                'Philosophy and abstract concepts in fiction'
            ])
        
        # High Conscientiousness recommendations
        if traits['conscientiousness'] > 0.7:
            recommendations.extend([
                'Non-fiction and educational content',
                'Biographies of successful individuals',
                'Self-improvement and productivity books',
                'Historical and factual narratives'
            ])
        
        # High Extraversion recommendations
        if traits['extraversion'] > 0.7:
            recommendations.extend([
                'Books with strong social themes',
                'Dialogue-driven narratives',
                'Popular contemporary fiction',
                'Books that spark discussion and debate'
            ])
        
        # High Agreeableness recommendations
        if traits['agreeableness'] > 0.7:
            recommendations.extend([
                'Character-driven stories with emotional depth',
                'Books exploring relationships and human connection',
                'Uplifting and inspirational narratives',
                'Stories with positive, hopeful endings'
            ])
        
        # High Neuroticism recommendations
        if traits['neuroticism'] > 0.6:
            recommendations.extend([
                'Psychological fiction and introspective narratives',
                'Books dealing with mental health and personal growth',
                'Cathartic and emotionally intense stories',
                'Memoirs and personal transformation stories'
            ])
        
        return recommendations[:10]  # Return top 10 recommendations

# FastAPI endpoint
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()
personality_analyzer = PersonalityAnalyzer()

class PersonalityAnalysisRequest(BaseModel):
    quiz_responses: Dict[int, Any]
    reading_history: List[Dict] = None

@app.post("/analyze-personality")
async def analyze_personality(request: PersonalityAnalysisRequest):
    try:
        profile = personality_analyzer.analyze_personality(
            request.quiz_responses,
            request.reading_history
        )
        
        return {
            "personality_profile": {
                "openness": profile.openness,
                "conscientiousness": profile.conscientiousness,
                "extraversion": profile.extraversion,
                "agreeableness": profile.agreeableness,
                "neuroticism": profile.neuroticism
            },
            "reading_preferences": profile.reading_preferences,
            "recommendations": profile.book_recommendations,
            "analysis_summary": generate_personality_summary(profile)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_personality_summary(profile: PersonalityProfile) -> str:
    """
    Generate a human-readable summary of the personality analysis
    """
    dominant_traits = []
    
    if profile.openness > 0.7:
        dominant_traits.append("highly open to new experiences")
    if profile.conscientiousness > 0.7:
        dominant_traits.append("very organized and goal-oriented")
    if profile.extraversion > 0.7:
        dominant_traits.append("socially engaged")
    if profile.agreeableness > 0.7:
        dominant_traits.append("empathetic and cooperative")
    if profile.neuroticism > 0.6:
        dominant_traits.append("emotionally sensitive")
    
    if not dominant_traits:
        return "You have a balanced personality profile with moderate scores across all traits."
    
    summary = f"Your reading personality shows that you are {', '.join(dominant_traits)}. "
    
    # Add reading-specific insights
    if profile.openness > 0.7:
        summary += "You're likely to enjoy experimental and diverse literature. "
    if profile.conscientiousness > 0.7:
        summary += "You prefer structured, informative content and are likely to finish books you start. "
    if profile.extraversion > 0.7:
        summary += "You enjoy books that you can discuss with others and prefer socially relevant themes. "
    
    return summary
```

### **Week 8: External API Integration**

#### **Day 1-3: Spotify Integration**
```typescript
// backend/src/services/spotifyService.ts
import axios from 'axios';
import { URLSearchParams } from 'url';

export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID!;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI!;
  }

  getAuthorizationUrl(state: string): string {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'user-top-read',
      'user-read-recently-played'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      state: state
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to exchange code for tokens');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to refresh access token');
    }
  }

  async getUserProfile(accessToken: string): Promise<SpotifyUser> {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to get user profile');
    }
  }

  async getUserPlaylists(accessToken: string, limit: number = 50): Promise<SpotifyPlaylist[]> {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/me/playlists?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.items;
    } catch (error) {
      throw new Error('Failed to get user playlists');
    }
  }

  async getPlaylistTracks(
    accessToken: string, 
    playlistId: string, 
    limit: number = 100
  ): Promise<SpotifyTrack[]> {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.items.map((item: any) => item.track);
    } catch (error) {
      throw new Error('Failed to get playlist tracks');
    }
  }

  async getUserTopTracks(
    accessToken: string, 
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 50
  ): Promise<SpotifyTrack[]> {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.items;
    } catch (error) {
      throw new Error('Failed to get top tracks');
    }
  }

  async getAudioFeatures(accessToken: string, trackIds: string[]): Promise<SpotifyAudioFeatures[]> {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.audio_features;
    } catch (error) {
      throw new Error('Failed to get audio features');
    }
  }

  async createReadingPlaylist(
    accessToken: string, 
    userId: string, 
    playlistName: string,
    trackUris: string[]
  ): Promise<SpotifyPlaylist> {
    try {
      // Create playlist
      const createResponse = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: playlistName,
          description: 'Generated by StoryVerse for reading',
          public: false
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const playlist = createResponse.data;

      // Add tracks to playlist
      if (trackUris.length > 0) {
        await axios.post(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          {
            uris: trackUris
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      return playlist;
    } catch (error) {
      throw new Error('Failed to create reading playlist');
    }
  }
}

// Spotify integration controller
export class SpotifyController {
  constructor(private spotifyService: SpotifyService) {}

  async initiateConnection(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
      
      const authUrl = this.spotifyService.getAuthorizationUrl(state);
      
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ error: 'Failed to initiate Spotify connection' });
    }
  }

  async handleCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).json({ error: 'Missing code or state parameter' });
      }

      // Decode state to get user ID
      const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      const userId = stateData.userId;

      // Exchange code for tokens
      const tokens = await this.spotifyService.exchangeCodeForTokens(code as string);
      
      // Get user profile
      const profile = await this.spotifyService.getUserProfile(tokens.access_token);
      
      // Save connection to database
      await this.saveSpotifyConnection(userId, tokens, profile);
      
      // Analyze user's music preferences
      await this.analyzeSpotifyData(userId, tokens.access_token);
      
      res.redirect(`${process.env.FRONTEND_URL}/profile?spotify=connected`);
    } catch (error) {
      console.error('Spotify callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/profile?spotify=error`);
    }
  }

  async generateReadingPlaylist(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { genre, mood, duration } = req.body;
      
      // Get user's Spotify connection
      const connection = await this.getSpotifyConnection(userId);
      if (!connection) {
        return res.status(400).json({ error: 'Spotify not connected' });
      }
      
      // Generate playlist based on reading context
      const playlist = await this.createContextualPlaylist(
        connection.accessToken,
        connection.spotifyUserId,
        genre,
        mood,
        duration
      );
      
      res.json({ playlist });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate reading playlist' });
    }
  }

  private async analyzeSpotifyData(userId: string, accessToken: string) {
    try {
      // Get user's playlists and top tracks
      const playlists = await this.spotifyService.getUserPlaylists(accessToken);
      const topTracks = await this.spotifyService.getUserTopTracks(accessToken);
      
      // Analyze music preferences
      const analysis = await this.analyzeMusicPreferences(accessToken, playlists, topTracks);
      
      // Save analysis to user profile
      await this.updateUserMusicProfile(userId, analysis);
      
      // Generate updated book recommendations
      await this.updateRecommendationsBasedOnMusic(userId, analysis);
      
    } catch (error) {
      console.error('Failed to analyze Spotify data:', error);
    }
  }
}
```

#### **Day 4-5: Pinterest Integration**
```typescript
// backend/src/services/pinterestService.ts
export class PinterestService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.PINTEREST_CLIENT_ID!;
    this.clientSecret = process.env.PINTEREST_CLIENT_SECRET!;
    this.redirectUri = process.env.PINTEREST_REDIRECT_URI!;
  }

  getAuthorizationUrl(state: string): string {
    const scopes = ['read_public', 'read_secret'].join(',');
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes,
      state: state
    });

    return `https://www.pinterest.com/oauth/?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<PinterestTokens> {
    try {
      const response = await axios.post(
        'https://api.pinterest.com/v5/oauth/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to exchange code for token');
    }
  }

  async getUserInfo(accessToken: string): Promise<PinterestUser> {
    try {
      const response = await axios.get(
        'https://api.pinterest.com/v5/user_account',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to get user info');
    }
  }

  async getUserBoards(accessToken: string): Promise<PinterestBoard[]> {
    try {
      const response = await axios.get(
        'https://api.pinterest.com/v5/boards',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.items;
    } catch (error) {
      throw new Error('Failed to get user boards');
    }
  }

  async getBoardPins(accessToken: string, boardId: string): Promise<PinterestPin[]> {
    try {
      const response = await axios.get(
        `https://api.pinterest.com/v5/boards/${boardId}/pins`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.items;
    } catch (error) {
      throw new Error('Failed to get board pins');
    }
  }

  async analyzeUserAesthetics(accessToken: string): Promise<AestheticAnalysis> {
    try {
      const boards = await this.getUserBoards(accessToken);
      const analysis: AestheticAnalysis = {
        colorPalette: [],
        themes: [],
        interests: [],
        moodProfile: {},
        bookGenreMapping: []
      };

      for (const board of boards.slice(0, 10)) { // Analyze top 10 boards
        const pins = await this.getBoardPins(accessToken, board.id);
        const boardAnalysis = await this.analyzeBoardAesthetics(board, pins);
        
        // Aggregate analysis
        analysis.colorPalette.push(...boardAnalysis.colors);
        analysis.themes.push(...boardAnalysis.themes);
        analysis.interests.push(...boardAnalysis.interests);
        
        // Merge mood profiles
        Object.keys(boardAnalysis.mood).forEach(mood => {
          analysis.moodProfile[mood] = 
            (analysis.moodProfile[mood] || 0) + boardAnalysis.mood[mood];
        });
      }

      // Normalize mood scores
      const totalBoards = boards.length;
      Object.keys(analysis.moodProfile).forEach(mood => {
        analysis.moodProfile[mood] /= totalBoards;
      });

      // Map to book genres
      analysis.bookGenreMapping = this.mapAestheticsToBookGenres(analysis);

      return analysis;
    } catch (error) {
      throw new Error('Failed to analyze user aesthetics');
    }
  }

  private async analyzeBoardAesthetics(
    board: PinterestBoard, 
    pins: PinterestPin[]
  ): Promise<BoardAnalysis> {
    const analysis: BoardAnalysis = {
      colors: [],
      themes: [],
      interests: [],
      mood: {}
    };

    // Analyze board name and description for themes
    const boardText = `${board.name} ${board.description || ''}`.toLowerCase();
    analysis.themes = this.extractThemesFromText(boardText);
    analysis.interests = this.extractInterestsFromText(boardText);

    // Analyze pins
    for (const pin of pins.slice(0, 20)) { // Analyze first 20 pins
      if (pin.media?.images?.original?.url) {
        try {
          // Extract colors from pin image
          const colors = await this.extractColorsFromImage(pin.media.images.original.url);
          analysis.colors.push(...colors);

          // Analyze pin description
          const pinText = `${pin.title || ''} ${pin.description || ''}`.toLowerCase();
          analysis.interests.push(...this.extractInterestsFromText(pinText));
        } catch (error) {
          console.error('Error analyzing pin:', error);
        }
      }
    }

    // Analyze mood from colors and themes
    analysis.mood = this.analyzeMoodFromAesthetics(analysis.colors, analysis.themes);

    return analysis;
  }

  private mapAestheticsToBookGenres(analysis: AestheticAnalysis): string[] {
    const genreMapping: string[] = [];

    // Color-based mapping
    const dominantColors = this.getDominantColors(analysis.colorPalette);
    
    if (dominantColors.includes('pink') || dominantColors.includes('red')) {
      genreMapping.push('Romance');
    }
    
    if (dominantColors.includes('black') || dominantColors.includes('dark')) {
      genreMapping.push('Horror', 'Mystery', 'Thriller');
    }
    
    if (dominantColors.includes('blue') || dominantColors.includes('teal')) {
      genreMapping.push('Science Fiction', 'Fantasy');
    }

    // Theme-based mapping
    const themes = analysis.themes;
    
    if (themes.some(theme => ['vintage', 'antique', 'classic'].includes(theme))) {
      genreMapping.push('Historical Fiction', 'Classic Literature');
    }
    
    if (themes.some(theme => ['nature', 'outdoor', 'adventure'].includes(theme))) {
      genreMapping.push('Adventure', 'Nature Writing');
    }
    
    if (themes.some(theme => ['art', 'creative', 'design'].includes(theme))) {
      genreMapping.push('Art', 'Biography', 'Creative Non-fiction');
    }

    // Mood-based mapping
    const moodProfile = analysis.moodProfile;
    
    if (moodProfile.romantic > 0.3) {
      genreMapping.push('Romance');
    }
    
    if (moodProfile.dark > 0.4) {
      genreMapping.push('Gothic', 'Horror');
    }
    
    if (moodProfile.minimalist > 0.3) {
      genreMapping.push('Philosophy', 'Poetry');
    }

    return [...new Set(genreMapping)]; // Remove duplicates
  }
}
```

#### **Day 6-7: Integration Testing & Frontend**
```typescript
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
                        .map(([genre, count]) => (
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
```

---

## 🎯 **PHASE 3: ADVANCED FEATURES (Weeks 9-12)**

### **Week 9: Advanced Text-to-Speech & Audio**

#### **Day 1-3: Enhanced TTS with SSML**
```python
# ai-services/src/tts/advanced_tts.py
import azure.cognitiveservices.speech as speechsdk
import re
from typing import Dict, List, Optional
from dataclasses import dataclass
import asyncio

@dataclass
class VoiceProfile:
    name: str
    gender: str
    age_range: str
    accent: str
    personality: str
    sample_rate: int = 24000

class AdvancedTTSEngine:
    def __init__(self, speech_key: str, speech_region: str):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=speech_key,
            region=speech_region
        )
        
        # Available voice profiles
        self.voice_profiles = {
            'jenny_professional': VoiceProfile(
                name='en-US-JennyNeural',
                gender='female',
                age_range='adult',
                accent='american',
                personality='professional'
            ),
            'aria_warm': VoiceProfile(
                name='en-US-AriaNeural',
                gender='female',
                age_range='young_adult',
                accent='american',
                personality='warm'
            ),
            'guy_friendly': VoiceProfile(
                name='en-US-GuyNeural',
                gender='male',
                age_range='adult',
                accent='american',
                personality='friendly'
            ),
            'davis_authoritative': VoiceProfile(
                name='en-US-DavisNeural',
                gender='male',
                age_range='mature',
                accent='american',
                personality='authoritative'
            )
        }
    
    async def synthesize_with_emotions(
        self,
        text: str,
        voice_profile: str,
        emotion: str = 'neutral',
        speaking_rate: float = 1.0,
        pitch: str = 'medium'
    ) -> bytes:
        """
        Synthesize speech with emotional expression
        """
        voice = self.voice_profiles.get(voice_profile, self.voice_profiles['jenny_professional'])
        
        # Create enhanced SSML with emotions
        ssml = self.create_emotional_ssml(text, voice, emotion, speaking_rate, pitch)
        
        # Configure speech synthesizer
        self.speech_config.speech_synthesis_voice_name = voice.name
        self.speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3
        )
        
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=self.speech_config,
            audio_config=None
        )
        
        # Synthesize speech
        result = synthesizer.speak_ssml_async(ssml).get()
        
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return result.audio_data
        else:
            raise Exception(f"Speech synthesis failed: {result.reason}")
    
    def create_emotional_ssml(
        self,
        text: str,
        voice: VoiceProfile,
        emotion: str,
        speaking_rate: float,
        pitch: str
    ) -> str:
        """
        Create SSML with emotional expression and natural speech patterns
        """
        # Preprocess text for better speech
        enhanced_text = self.enhance_text_for_speech(text)
        
        # Map emotions to SSML styles
        emotion_styles = {
            'neutral': '',
            'cheerful': 'style="cheerful"',
            'sad': 'style="sad"',
            'angry': 'style="angry"',
            'fearful': 'style="fearful"',
            'excited': 'style="excited"',
            'friendly': 'style="friendly"',
            'hopeful': 'style="hopeful"',
            'shouting': 'style="shouting"',
            'terrified': 'style="terrified"',
            'unfriendly': 'style="unfriendly"',
            'whispering': 'style="whispering"'
        }
        
        style_attribute = emotion_styles.get(emotion, '')
        
        ssml = f"""
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
               xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
            <voice name="{voice.name}">
                <mstts:express-as {style_attribute}>
                    <prosody rate="{speaking_rate}" pitch="{pitch}">
                        {enhanced_text}
                    </prosody>
                </mstts:express-as>
            </voice>
        </speak>
        """
        
        return ssml
    
    def enhance_text_for_speech(self, text: str) -> str:
        """
        Enhance text with natural speech patterns and pauses
        """
        # Add pauses for punctuation
        text = re.sub(r'\.', '.<break time="600ms"/>', text)
        text = re.sub(r',', ',<break time="300ms"/>', text)
        text = re.sub(r';', ';<break time="400ms"/>', text)
        text = re.sub(r':', ':<break time="300ms"/>', text)
        text = re.sub(r'\?', '?<break time="700ms"/>', text)
        text = re.sub(r'!', '!<break time="700ms"/>', text)
        
        # Add emphasis for quoted speech
        text = re.sub(
            r'"([^"]*)"',
            r'<emphasis level="moderate">"\1"</emphasis>',
            text
        )
        
        # Add emphasis for italicized text (assuming *text* format)
        text = re.sub(
            r'\*([^*]*)\*',
            r'<emphasis level="strong">\1</emphasis>',
            text
        )
        
        # Handle chapter breaks
        text = re.sub(
            r'Chapter \d+',
            r'<break time="2s"/>Chapter <say-as interpret-as="cardinal">\g<0></say-as><break time="1s"/>',
            text
        )
        
        # Handle dialogue attribution
        text = re.sub(
            r'," (he|she|they) (said|asked|replied|whispered|shouted)',
            r',<break time="200ms"/> \1 \2',
            text
        )
        
        return text
    
    async def analyze_text_emotion(self, text: str) -> str:
        """
        Analyze text to determine appropriate emotional tone
        """
        # Simple emotion detection based on keywords and punctuation
        text_lower = text.lower()
        
        # Excitement indicators
        if '!' in text or any(word in text_lower for word in ['amazing', 'incredible', 'fantastic', 'wonderful']):
            return 'excited'
        
        # Sadness indicators
        if any(word in text_lower for word in ['sad', 'tragic', 'sorrow', 'grief', 'died', 'death']):
            return 'sad'
        
        # Fear indicators
        if any(word in text_lower for word in ['scared', 'terrified', 'afraid', 'horror', 'nightmare']):
            return 'fearful'
        
        # Anger indicators
        if any(word in text_lower for word in ['angry', 'furious', 'rage', 'hate', 'damn']):
            return 'angry'
        
        # Cheerful indicators
        if any(word in text_lower for word in ['happy', 'joy', 'laugh', 'smile', 'cheerful']):
            return 'cheerful'
        
        return 'neutral'
    
    async def create_audiobook_chapter(
        self,
        chapter_text: str,
        voice_profile: str,
        chapter_number: int,
        book_title: str
    ) -> bytes:
        """
        Create a complete audiobook chapter with intro and enhanced narration
        """
        # Add chapter introduction
        intro_text = f"Chapter {chapter_number}."
        
        # Analyze chapter for emotional tone
        dominant_emotion = await self.analyze_text_emotion(chapter_text)
        
        # Create full chapter SSML
        full_ssml = self.create_chapter_ssml(
            intro_text,
            chapter_text,
            voice_profile,
            dominant_emotion
        )
        
        # Synthesize complete chapter
        return await self.synthesize_ssml(full_ssml)
    
    def create_chapter_ssml(
        self,
        intro_text: str,
        chapter_text: str,
        voice_profile: str,
        emotion: str
    ) -> str:
        """
        Create SSML for a complete chapter with proper pacing
        """
        voice = self.voice_profiles.get(voice_profile, self.voice_profiles['jenny_professional'])
        
        ssml = f"""
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
               xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
            <voice name="{voice.name}">
                <!-- Chapter Introduction -->
                <mstts:express-as style="newscast">
                    <prosody rate="0.9" pitch="medium">
                        {intro_text}
                        <break time="2s"/>
                    </prosody>
                </mstts:express-as>
                
                <!-- Chapter Content -->
                <mstts:express-as style="{emotion if emotion != 'neutral' else 'friendly'}">
                    <prosody rate="1.0" pitch="medium">
                        {self.enhance_text_for_speech(chapter_text)}
                    </prosody>
                </mstts:express-as>
                
                <!-- Chapter End -->
                <break time="3s"/>
            </voice>
        </speak>
        """
        
        return ssml

# FastAPI endpoints for advanced TTS
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uuid

app = FastAPI()
tts_engine = AdvancedTTSEngine(
    speech_key=os.getenv('AZURE_SPEECH_KEY'),
    speech_region=os.getenv('AZURE_SPEECH_REGION')
)

class TTSRequest(BaseModel):
    text: str
    voice_profile: str = 'jenny_professional'
    emotion: str = 'neutral'
    speaking_rate: float = 1.0
    pitch: str = 'medium'

class AudiobookRequest(BaseModel):
    chapter_text: str
    voice_profile: str
    chapter_number: int
    book_title: str

@app.post("/synthesize-advanced")
async def synthesize_advanced_speech(request: TTSRequest):
    try:
        audio_data = await tts_engine.synthesize_with_emotions(
            request.text,
            request.voice_profile,
            request.emotion,
            request.speaking_rate,
            request.pitch
        )
        
        return {
            "audio_data": audio_data.hex(),
            "content_type": "audio/mpeg",
            "voice_profile": request.voice_profile,
            "emotion": request.emotion
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-audiobook-chapter")
async def create_audiobook_chapter(request: AudiobookRequest, background_tasks: BackgroundTasks):
    try:
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Start background processing
        background_tasks.add_task(
            process_audiobook_chapter,
            job_id,
            request.chapter_text,
            request.voice_profile,
            request.chapter_number,
            request.book_title
        )
        
        return {
            "job_id": job_id,
            "status": "processing",
            "message": "Audiobook chapter generation started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_audiobook_chapter(
    job_id: str,
    chapter_text: str,
    voice_profile: str,
    chapter_number: int,
    book_title: str
):
    try:
        audio_data = await tts_engine.create_audiobook_chapter(
            chapter_text,
            voice_profile,
            chapter_number,
            book_title
        )
        
        # Save audio file
        file_path = f"audiobooks/{job_id}_chapter_{chapter_number}.mp3"
        with open(file_path, 'wb') as f:
            f.write(audio_data)
        
        # Update job status in database
        # await update_job_status(job_id, 'completed', file_path)
        
    except Exception as e:
        # await update_job_status(job_id, 'failed', str(e))
        print(f"Audiobook generation failed: {e}")
```

#### **Day 4-5: Audio Player Enhancement**
```typescript
// frontend/src/components/AdvancedAudioPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Settings, Bookmark, Speed, Rewind, FastForward 
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
          [new Uint8Array(data.audio_data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))],
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
          <Speed className="w-4 h-4" />
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
```

#### **Day 6-7: Background Music Integration**
```typescript
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
```

### **Week 10: Social Features & Reviews**

#### **Day 1-3: Review System Implementation**
```typescript
// backend/src/models/Review.ts
import { Pool } from 'pg';

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  title?: string;
  content: string;
  spoilerWarning: boolean;
  helpfulVotes: number;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    username: string;
    avatar?: string;
  };
}

export class ReviewModel {
  constructor(private db: Pool) {}

  async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpfulVotes' | 'totalVotes'>): Promise<Review> {
    const query = `
      INSERT INTO reviews (user_id, book_id, rating, title, content, spoiler_warning)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await this.db.query(query, [
      reviewData.userId,
      reviewData.bookId,
      reviewData.rating,
      reviewData.title,
      reviewData.content,
      reviewData.spoilerWarning
    ]);
    
    return result.rows[0];
  }

  async getBookReviews(bookId: string, page: number = 1, limit: number = 10): Promise<Review[]> {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        r.*,
        u.username,
        u.avatar_url as avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = $1
      ORDER BY r.helpful_votes DESC, r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await this.db.query(query, [bookId, limit, offset]);
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      rating: row.rating,
      title: row.title,
      content: row.content,
      spoilerWarning: row.spoiler_warning,
      helpfulVotes: row.helpful_votes,
      totalVotes: row.total_votes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        username: row.username,
        avatar: row.avatar
      }
    }));
  }

  async voteOnReview(reviewId: string, userId: string, isHelpful: boolean): Promise<void> {
    // Check if user already voted
    const existingVote = await this.db.query(
      'SELECT * FROM review_votes WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (existingVote.rows.length > 0) {
      // Update existing vote
      await this.db.query(
        'UPDATE review_votes SET is_helpful = $1 WHERE review_id = $2 AND user_id = $3',
        [isHelpful, reviewId, userId]
      );
    } else {
      // Create new vote
      await this.db.query(
        'INSERT INTO review_votes (review_id, user_id, is_helpful) VALUES ($1, $2, $3)',
        [reviewId, userId, isHelpful]
      );
    }

    // Update review vote counts
    await this.updateReviewVoteCounts(reviewId);
  }

  private async updateReviewVoteCounts(reviewId: string): Promise<void> {
    const query = `
      UPDATE reviews 
      SET 
        helpful_votes = (
          SELECT COUNT(*) FROM review_votes 
          WHERE review_id = $1 AND is_helpful = true
        ),
        total_votes = (
          SELECT COUNT(*) FROM review_votes 
          WHERE review_id = $1
        )
      WHERE id = $1
    `;
    
    await this.db.query(query, [reviewId]);
  }

  async getReviewAnalytics(bookId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const query = `
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews,
        rating,
        COUNT(*) as count
      FROM reviews 
      WHERE book_id = $1
      GROUP BY rating
    `;
    
    const result = await this.db.query(query, [bookId]);
    
    const ratingDistribution: { [key: number]: number } = {};
    let totalReviews = 0;
    let weightedSum = 0;

    result.rows.forEach(row => {
      const rating = parseInt(row.rating);
      const count = parseInt(row.count);
      ratingDistribution[rating] = count;
      totalReviews += count;
      weightedSum += rating * count;
    });

    return {
      averageRating: totalReviews > 0 ? weightedSum / totalReviews : 0,
      totalReviews,
      ratingDistribution
    };
  }
}
```

#### **Day 4-5: Social Feed & Community Features**
```typescript
// frontend/src/components/SocialFeed.tsx
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, BookOpen, Star, MoreHorizontal } from 'lucide-react';

interface SocialPost {
  id: string;
  type: 'review' | 'reading_update' | 'recommendation' | 'story_share';
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  book?: {
    id: string;
    title: string;
    author: string;
    cover: string;
  };
  content: string;
  rating?: number;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await fetch(`/api/social/feed?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const { posts: newPosts } = await response.json();
        setPosts(prev => page === 1 ? newPosts : [...prev, ...newPosts]);
      }
    } catch (error) {
      console.error('Failed to load social feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const sharePost = async (post: SocialPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.user.username}'s review of ${post.book?.title}`,
          text: post.content,
          url: window.location.href
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Check out ${post.user.username}'s review of ${post.book?.title}: ${post.content}`
      );
      alert('Link copied to clipboard!');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'reading_update':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'recommendation':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'story_share':
        return <Share2 className="w-4 h-4 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading && posts.length === 0) {
    return (
      <div className="social-feed-loading">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="social-feed">
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={post.user.avatar || '/default-avatar.png'}
                  alt={post.user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {post.user.username}
                    </h4>
                    {getPostTypeIcon(post.type)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(post.createdAt)}
                  </p>
                </div>
              </div>
              
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Book Info (if applicable) */}
            {post.book && (
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={post.book.cover}
                  alt={post.book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {post.book.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {post.book.author}
                  </p>
                  {post.rating && (
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(post.rating)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => likePost(post.id)}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.isLiked 
                      ? 'text-red-500' 
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{post.likes}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments}</span>
                </button>
                
                <button
                  onClick={() => sharePost(post)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
              
              {post.book && (
                <button className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors">
                  Add to Library
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-8">
        <button
          onClick={() => {
            setPage(prev => prev + 1);
            loadFeed();
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Load More Posts
        </button>
      </div>
    </div>
  );
};
```

#### **Day 6-7: Book Clubs & Reading Groups**
```typescript
// frontend/src/components/BookClubs.tsx
import React, { useState, useEffect } from 'react';
import { Users, Calendar, BookOpen, MessageSquare, Plus, Search } from 'lucide-react';

interface BookClub {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  currentBook?: {
    id: string;
    title: string;
    author: string;
    cover: string;
  };
  nextMeeting?: string;
  tags: string[];
  createdBy: string;
  isMember: boolean;
}

interface ReadingChallenge {
  id: string;
  title: string;
  description: string;
  targetBooks: number;
  currentProgress: number;
  endDate: string;
  participants: number;
  isParticipating: boolean;
}

export const BookClubs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clubs' | 'challenges'>('clubs');
  const [bookClubs, setBookClubs] = useState<BookClub[]>([]);
  const [challenges, setChallenges] = useState<ReadingChallenge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'clubs') {
      loadBookClubs();
    } else {
      loadChallenges();
    }
  }, [activeTab]);

  const loadBookClubs = async () => {
    try {
      const response = await fetch('/api/book-clubs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const clubs = await response.json();
        setBookClubs(clubs);
      }
    } catch (error) {
      console.error('Failed to load book clubs:', error);
    }
  };

  const loadChallenges = async () => {
    try {
      const response = await fetch('/api/reading-challenges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const challengeData = await response.json();
        setChallenges(challengeData);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  const joinClub = async (clubId: string) => {
    try {
      const response = await fetch(`/api/book-clubs/${clubId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setBookClubs(prev => prev.map(club => 
          club.id === clubId 
            ? { ...club, isMember: true, memberCount: club.memberCount + 1 }
            : club
        ));
      }
    } catch (error) {
      console.error('Failed to join club:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/reading-challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setChallenges(prev => prev.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, isParticipating: true, participants: challenge.participants + 1 }
            : challenge
        ));
      }
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const filteredClubs = bookClubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredChallenges = challenges.filter(challenge =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="book-clubs">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Community
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join book clubs and reading challenges to connect with fellow readers
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mt-4 lg:mt-0"
        >
          <Plus className="w-5 h-5" />
          <span>Create {activeTab === 'clubs' ? 'Club' : 'Challenge'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-8">
        <button
          onClick={() => setActiveTab('clubs')}
          className={`flex-1 py-3 px-4 rounded-md transition-colors ${
            activeTab === 'clubs'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Book Clubs
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex-1 py-3 px-4 rounded-md transition-colors ${
            activeTab === 'challenges'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5 inline mr-2" />
          Reading Challenges
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Content */}
      {activeTab === 'clubs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <div key={club.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {club.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {club.memberCount} members
                    </span>
                    {club.isPrivate && (
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        Private
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {club.description}
              </p>

              {club.currentBook && (
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img
                    src={club.currentBook.cover}
                    alt={club.currentBook.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      Currently Reading
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {club.currentBook.title}
                    </p>
                  </div>
                </div>
              )}

              {club.nextMeeting && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  Next meeting: {new Date(club.nextMeeting).toLocaleDateString()}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {club.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                {club.isMember ? (
                  <button className="flex-1 bg-green-100 text-green-800 py-2 px-4 rounded-lg text-sm font-medium">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    View Discussions
                  </button>
                ) : (
                  <button
                    onClick={() => joinClub(club.id)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Join Club
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredChallenges.map(challenge => (
            <div key={challenge.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {challenge.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {challenge.participants} participants
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Ends {new Date(challenge.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                {challenge.description}
              </p>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {challenge.currentProgress} / {challenge.targetBooks} books
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((challenge.currentProgress / challenge.targetBooks) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {challenge.isParticipating ? (
                <button className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg text-sm font-medium">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  View Progress
                </button>
              ) : (
                <button
                  onClick={() => joinChallenge(challenge.id)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Join Challenge
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### **Week 11: Performance Optimization**

#### **Day 1-3: Frontend Performance**
```typescript
// frontend/src/hooks/useVirtualization.ts
import { useState, useEffect, useMemo } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualization = <T>(
  items: T[],
  options: VirtualizationOptions
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { itemHeight, containerHeight, overscan = 5 } = options;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange
  };
};

// frontend/src/components/VirtualizedBookList.tsx
import React, { useRef, useCallback } from 'react';
import { useVirtualization } from '../hooks/useVirtualization';
import BookCard from './BookCard';

interface VirtualizedBookListProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

export const VirtualizedBookList: React.FC<VirtualizedBookListProps> = ({
  books,
  onBookSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 200; // Height of each book card
  const CONTAINER_HEIGHT = 600; // Height of the scrollable container

  const {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  } = useVirtualization(books, {
    itemHeight: ITEM_HEIGHT,
    containerHeight: CONTAINER_HEIGHT,
    overscan: 3
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, [setScrollTop]);

  return (
    <div
      ref={containerRef}
      className="virtualized-list"
      style={{ height: CONTAINER_HEIGHT, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleItems.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={() => onBookSelect(book)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// frontend/src/hooks/useInfiniteScroll.ts
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = (
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
) => {
  const [isFetching, setIsFetching] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const { threshold = 1.0, rootMargin = '0px' } = options;

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching) {
          setIsFetching(true);
          callback();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, callback, isFetching, threshold, rootMargin]);

  const setRef = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  const resetFetching = useCallback(() => {
    setIsFetching(false);
  }, []);

  return { setRef, isFetching, resetFetching };
};

// frontend/src/hooks/useImageLazyLoading.ts
import { useState, useEffect, useRef } from 'react';

export const useImageLazyLoading = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          
          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
            observer.disconnect();
          };
          
          img.onerror = () => {
            setIsError(true);
            observer.disconnect();
          };
          
          img.src = src;
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return { imgRef, imageSrc, isLoaded, isError };
};

// frontend/src/components/LazyImage.tsx
import React from 'react';
import { useImageLazyLoading } from '../hooks/useImageLazyLoading';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = '/placeholder-book.jpg',
  className = ''
}) => {
  const { imgRef, imageSrc, isLoaded, isError } = useImageLazyLoading(src, placeholder);

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-50'
        } ${className}`}
      />
      
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      )}
      
      {isError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
          <span className="text-gray-500 text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
};
```

#### **Day 4-5: Backend Optimization**
```typescript
// backend/src/middleware/caching.ts
import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';

const redis = new Redis(process.env.REDIS_URL!);

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = (req) => `cache:${req.method}:${req.originalUrl}`,
    condition = () => true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests by default
    if (req.method !== 'GET' || !condition(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);

    try {
      // Try to get cached response
      const cachedResponse = await redis.get(cacheKey);
      
      if (cachedResponse) {
        const parsed = JSON.parse(cachedResponse);
        res.set(parsed.headers);
        return res.status(parsed.status).json(parsed.data);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function(data: any) {
        const responseData = {
          status: res.statusCode,
          headers: res.getHeaders(),
          data
        };

        // Cache the response
        redis.setex(cacheKey, ttl, JSON.stringify(responseData));

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// backend/src/services/databaseOptimization.ts
import { Pool } from 'pg';

export class DatabaseOptimizer {
  constructor(private db: Pool) {}

  async createIndexes() {
    const indexes = [
      // Books table indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_genre ON books(genre)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_author ON books(author)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_title_search ON books USING gin(to_tsvector(\'english\', title))',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_created_at ON books(created_at DESC)',
      
      // Reviews table indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_book_id ON reviews(book_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews(rating)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_helpful_votes ON reviews(helpful_votes DESC)',
      
      // User library indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_library_user_id ON user_library(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_library_status ON user_library(status)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_library_progress ON user_library(progress)',
      
      // Reading sessions indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions(book_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_sessions_start_time ON reading_sessions(start_time DESC)',
      
      // Generated stories indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_stories_user_id ON generated_stories(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_stories_genre ON generated_stories(genre)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_stories_created_at ON generated_stories(created_at DESC)'
    ];

    for (const indexQuery of indexes) {
      try {
        await this.db.query(indexQuery);
        console.log(`Created index: ${indexQuery.split(' ')[5]}`);
      } catch (error) {
        console.error(`Failed to create index: ${indexQuery}`, error);
      }
    }
  }

  async optimizeQueries() {
    // Analyze table statistics
    const tables = [
      'books', 'reviews', 'user_library', 'reading_sessions', 
      'generated_stories', 'users', 'bookmarks'
    ];

    for (const table of tables) {
      try {
        await this.db.query(`ANALYZE ${table}`);
        console.log(`Analyzed table: ${table}`);
      } catch (error) {
        console.error(`Failed to analyze table: ${table}`, error);
      }
    }
  }

  async getSlowQueries() {
    const query = `
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      WHERE mean_time > 100 
      ORDER BY mean_time DESC 
      LIMIT 10
    `;

    try {
      const result = await this.db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Failed to get slow queries:', error);
      return [];
    }
  }
}

// backend/src/services/queryOptimizer.ts
export class QueryOptimizer {
  constructor(private db: Pool) {}

  async getOptimizedBookSearch(searchParams: {
    query?: string;
    genre?: string;
    author?: string;
    rating?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }) {
    const {
      query,
      genre,
      author,
      rating,
      sortBy = 'relevance',
      limit = 20,
      offset = 0
    } = searchParams;

    let baseQuery = `
      SELECT 
        b.*,
        AVG(r.rating) as average_rating,
        COUNT(r.id) as review_count,
        COUNT(ul.id) as library_count
      FROM books b
      LEFT JOIN reviews r ON b.id = r.book_id
      LEFT JOIN user_library ul ON b.id = ul.book_id
    `;

    const conditions: string[] = ['b.is_public = true'];
    const params: any[] = [];
    let paramIndex = 1;

    // Full-text search
    if (query) {
      conditions.push(`(
        to_tsvector('english', b.title) @@ plainto_tsquery('english', $${paramIndex}) OR
        to_tsvector('english', b.author) @@ plainto_tsquery('english', $${paramIndex}) OR
        to_tsvector('english', b.description) @@ plainto_tsquery('english', $${paramIndex})
      )`);
      params.push(query);
      paramIndex++;
    }

    // Genre filter
    if (genre && genre !== 'all') {
      conditions.push(`b.genre = $${paramIndex}`);
      params.push(genre);
      paramIndex++;
    }

    // Author filter
    if (author) {
      conditions.push(`b.author ILIKE $${paramIndex}`);
      params.push(`%${author}%`);
      paramIndex++;
    }

    // Rating filter
    if (rating) {
      conditions.push(`AVG(r.rating) >= $${paramIndex}`);
      params.push(rating);
      paramIndex++;
    }

    // Add WHERE clause
    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add GROUP BY
    baseQuery += ` GROUP BY b.id`;

    // Add ORDER BY
    switch (sortBy) {
      case 'rating':
        baseQuery += ` ORDER BY average_rating DESC NULLS LAST, review_count DESC`;
        break;
      case 'popularity':
        baseQuery += ` ORDER BY library_count DESC, review_count DESC`;
        break;
      case 'recent':
        baseQuery += ` ORDER BY b.created_at DESC`;
        break;
      case 'title':
        baseQuery += ` ORDER BY b.title ASC`;
        break;
      default: // relevance
        if (query) {
          baseQuery += ` ORDER BY ts_rank(to_tsvector('english', b.title || ' ' || b.author || ' ' || b.description), plainto_tsquery('english', $1)) DESC`;
        } else {
          baseQuery += ` ORDER BY b.created_at DESC`;
        }
    }

    // Add pagination
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    try {
      const result = await this.db.query(baseQuery, params);
      return result.rows;
    } catch (error) {
      console.error('Optimized search query failed:', error);
      throw error;
    }
  }

  async getPersonalizedRecommendations(userId: string, limit: number = 10) {
    // Optimized query using CTEs and proper indexing
    const query = `
      WITH user_preferences AS (
        SELECT 
          genre,
          COUNT(*) as genre_count,
          AVG(rating) as avg_rating
        FROM user_library ul
        JOIN books b ON ul.book_id = b.id
        WHERE ul.user_id = $1 AND ul.rating IS NOT NULL
        GROUP BY genre
      ),
      similar_users AS (
        SELECT 
          ul2.user_id,
          COUNT(*) as common_books
        FROM user_library ul1
        JOIN user_library ul2 ON ul1.book_id = ul2.book_id
        WHERE ul1.user_id = $1 
          AND ul2.user_id != $1
          AND ul1.rating >= 4 
          AND ul2.rating >= 4
        GROUP BY ul2.user_id
        HAVING COUNT(*) >= 3
        ORDER BY common_books DESC
        LIMIT 50
      )
      SELECT DISTINCT
        b.*,
        AVG(r.rating) as average_rating,
        COUNT(r.id) as review_count,
        up.avg_rating as genre_preference_score
      FROM books b
      JOIN reviews r ON b.id = r.book_id
      JOIN user_preferences up ON b.genre = up.genre
      JOIN user_library ul ON b.id = ul.book_id
      JOIN similar_users su ON ul.user_id = su.user_id
      WHERE b.id NOT IN (
        SELECT book_id FROM user_library WHERE user_id = $1
      )
      AND ul.rating >= 4
      GROUP BY b.id, up.avg_rating
      HAVING AVG(r.rating) >= 4.0
      ORDER BY 
        up.avg_rating DESC,
        AVG(r.rating) DESC,
        COUNT(r.id) DESC
      LIMIT $2
    `;

    try {
      const result = await this.db.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Personalized recommendations query failed:', error);
      throw error;
    }
  }
}
```

#### **Day 6-7: Caching Strategy**
```typescript
// backend/src/services/cacheService.ts
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';

export class CacheService {
  private redis: Redis;
  private memoryCache: LRUCache<string, any>;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
    this.memoryCache = new LRUCache({
      max: 1000, // Maximum number of items
      ttl: 1000 * 60 * 5, // 5 minutes
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false
    });
  }

  // Multi-level caching: Memory -> Redis -> Database
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult !== undefined) {
      return memoryResult;
    }

    // Try Redis cache
    try {
      const redisResult = await this.redis.get(key);
      if (redisResult) {
        const parsed = JSON.parse(redisResult);
        // Store in memory cache for faster access
        this.memoryCache.set(key, parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }

    return null;
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    // Store in memory cache
    this.memoryCache.set(key, value);

    // Store in Redis
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    // Remove from memory cache
    this.memoryCache.delete(key);

    // Remove from Redis
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis pattern invalidation error:', error);
    }

    // Clear memory cache (simple approach - clear all)
    this.memoryCache.clear();
  }

  // Specific caching methods for different data types
  async cacheBookMetadata(bookId: string, metadata: any, ttl: number = 3600): Promise<void> {
    await this.set(`book:metadata:${bookId}`, metadata, ttl);
  }

  async getCachedBookMetadata(bookId: string): Promise<any> {
    return await this.get(`book:metadata:${bookId}`);
  }

  async cacheUserRecommendations(userId: string, recommendations: any[], ttl: number = 1800): Promise<void> {
    await this.set(`user:recommendations:${userId}`, recommendations, ttl);
  }

  async getCachedUserRecommendations(userId: string): Promise<any[]> {
    return await this.get(`user:recommendations:${userId}`) || [];
  }

  async cacheSearchResults(searchKey: string, results: any[], ttl: number = 600): Promise<void> {
    await this.set(`search:${searchKey}`, results, ttl);
  }

  async getCachedSearchResults(searchKey: string): Promise<any[]> {
    return await this.get(`search:${searchKey}`) || [];
  }

  async cacheGeneratedAudio(textHash: string, audioData: Buffer, ttl: number = 86400): Promise<void> {
    try {
      await this.redis.setex(`audio:tts:${textHash}`, ttl, audioData);
    } catch (error) {
      console.error('Audio cache error:', error);
    }
  }

  async getCachedGeneratedAudio(textHash: string): Promise<Buffer | null> {
    try {
      const result = await this.redis.getBuffer(`audio:tts:${textHash}`);
      return result;
    } catch (error) {
      console.error('Audio cache retrieval error:', error);
      return null;
    }
  }

  // Cache warming strategies
  async warmCache(): Promise<void> {
    console.log('Starting cache warming...');

    // Warm popular books cache
    await this.warmPopularBooks();

    // Warm trending content cache
    await this.warmTrendingContent();

    console.log('Cache warming completed');
  }

  private async warmPopularBooks(): Promise<void> {
    // This would typically fetch from database and cache popular books
    // Implementation depends on your specific needs
  }

  private async warmTrendingContent(): Promise<void> {
    // Cache trending books, popular reviews, etc.
  }

  // Cache statistics and monitoring
  async getCacheStats(): Promise<{
    memoryCache: any;
    redisStats: any;
  }> {
    const memoryStats = {
      size: this.memoryCache.size,
      max: this.memoryCache.max,
      calculatedSize: this.memoryCache.calculatedSize
    };

    let redisStats = {};
    try {
      const info = await this.redis.info('memory');
      redisStats = this.parseRedisInfo(info);
    } catch (error) {
      console.error('Failed to get Redis stats:', error);
    }

    return {
      memoryCache: memoryStats,
      redisStats
    };
  }

  private parseRedisInfo(info: string): any {
    const stats: any = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    }
    
    return stats;
  }
}

// Usage in controllers
export class BookController {
  constructor(
    private bookService: BookService,
    private cacheService: CacheService
  ) {}

  async getBook(req: Request, res: Response) {
    const { bookId } = req.params;
    const cacheKey = `book:${bookId}`;

    try {
      // Try cache first
      let book = await this.cacheService.get(cacheKey);
      
      if (!book) {
        // Fetch from database
        book = await this.bookService.getBookById(bookId);
        
        if (book) {
          // Cache for 1 hour
          await this.cacheService.set(cacheKey, book, 3600);
        }
      }

      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json({ book });
    } catch (error) {
      console.error('Get book error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async searchBooks(req: Request, res: Response) {
    const searchParams = req.query;
    const searchKey = Buffer.from(JSON.stringify(searchParams)).toString('base64');
    const cacheKey = `search:${searchKey}`;

    try {
      // Try cache first
      let results = await this.cacheService.getCachedSearchResults(cacheKey);
      
      if (results.length === 0) {
        // Perform search
        results = await this.bookService.searchBooks(searchParams);
        
        // Cache results for 10 minutes
        await this.cacheService.cacheSearchResults(cacheKey, results, 600);
      }

      res.json({ books: results });
    } catch (error) {
      console.error('Search books error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

### **Week 12: Testing & Deployment**

#### **Day 1-3: Testing Implementation**
```typescript
// frontend/src/__tests__/components/BookCard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BookCard from '../../components/BookCard';

const mockBook = {
  id: '1',
  title: 'Test Book',
  author: 'Test Author',
  genre: 'Fiction',
  coverUrl: 'https://example.com/cover.jpg',
  description: 'A test book description',
  rating: 4.5,
  reviews: [
    {
      user: 'TestUser',
      rating: 5,
      comment: 'Great book!'
    }
  ]
};

describe('BookCard', () => {
  const mockOnRead = vi.fn();
  const mockOnAddToLibrary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders book information correctly', () => {
    render(
      <BookCard 
        book={mockBook} 
        onRead={mockOnRead}
        showActions={true}
      />
    );

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('by Test Author')).toBeInTheDocument();
    expect(screen.getByText('A test book description')).toBeInTheDocument();
    expect(screen.getByText('Fiction')).toBeInTheDocument();
  });

  it('displays correct rating stars', () => {
    render(
      <BookCard 
        book={mockBook} 
        onRead={mockOnRead}
        showActions={true}
      />
    );

    const stars = screen.getAllByTestId('star');
    expect(stars).toHaveLength(5);
    
    // Check that 4 stars are filled (rating 4.5 rounds down to 4)
    const filledStars = stars.filter(star => 
      star.classList.contains('fill-current')
    );
    expect(filledStars).toHaveLength(4);
  });

  it('calls onRead when read button is clicked', async () => {
    render(
      <BookCard 
        book={mockBook} 
        onRead={mockOnRead}
        showActions={true}
      />
    );

    const readButton = screen.getByText('Read');
    fireEvent.click(readButton);

    await waitFor(() => {
      expect(mockOnRead).toHaveBeenCalledTimes(1);
    });
  });

  it('shows add to library button when showAddButton is true', () => {
    render(
      <BookCard 
        book={mockBook} 
        onAddToLibrary={mockOnAddToLibrary}
        showAddButton={true}
      />
    );

    expect(screen.getByText('Add to Library')).toBeInTheDocument();
  });

  it('displays reviews when expanded', async () => {
    render(
      <BookCard 
        book={mockBook} 
        onRead={mockOnRead}
        showActions={true}
      />
    );

    const reviewButton = screen.getByText('1 Review');
    fireEvent.click(reviewButton);

    await waitFor(() => {
      expect(screen.getByText('TestUser')).toBeInTheDocument();
      expect(screen.getByText('Great book!')).toBeInTheDocument();
    });
  });
});

// frontend/src/__tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth } from '../../contexts/AuthContext';

// Mock fetch
global.fetch = vi.fn();

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com' },
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token'
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockResponse.user);
    expect(localStorage.getItem('accessToken')).toBe('mock-token');
    expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
  });

  it('should handle login failure', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.login('test@example.com', 'wrong-password');
      })
    ).rejects.toThrow('Login failed');
  });

  it('should logout correctly', () => {
    localStorage.setItem('accessToken', 'mock-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});

// backend/src/__tests__/controllers/bookController.test.ts
import request from 'supertest';
import { app } from '../../app';
import { BookService } from '../../services/bookService';
import { CacheService } from '../../services/cacheService';

// Mock services
vi.mock('../../services/bookService');
vi.mock('../../services/cacheService');

describe('BookController', () => {
  const mockBookService = BookService as vi.MockedClass<typeof BookService>;
  const mockCacheService = CacheService as vi.MockedClass<typeof CacheService>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/books/:id', () => {
    it('should return book from cache', async () => {
      const mockBook = {
        id: '1',
        title: 'Test Book',
        author: 'Test Author'
      };

      mockCacheService.prototype.get.mockResolvedValue(mockBook);

      const response = await request(app)
        .get('/api/books/1')
        .expect(200);

      expect(response.body.book).toEqual(mockBook);
      expect(mockCacheService.prototype.get).toHaveBeenCalledWith('book:1');
      expect(mockBookService.prototype.getBookById).not.toHaveBeenCalled();
    });

    it('should fetch book from database when not in cache', async () => {
      const mockBook = {
        id: '1',
        title: 'Test Book',
        author: 'Test Author'
      };

      mockCacheService.prototype.get.mockResolvedValue(null);
      mockBookService.prototype.getBookById.mockResolvedValue(mockBook);

      const response = await request(app)
        .get('/api/books/1')
        .expect(200);

      expect(response.body.book).toEqual(mockBook);
      expect(mockBookService.prototype.getBookById).toHaveBeenCalledWith('1');
      expect(mockCacheService.prototype.set).toHaveBeenCalledWith('book:1', mockBook, 3600);
    });

    it('should return 404 when book not found', async () => {
      mockCacheService.prototype.get.mockResolvedValue(null);
      mockBookService.prototype.getBookById.mockResolvedValue(null);

      await request(app)
        .get('/api/books/999')
        .expect(404);
    });
  });

  describe('POST /api/books/upload', () => {
    it('should upload PDF successfully', async () => {
      const mockBook = {
        id: '1',
        title: 'Uploaded Book',
        author: 'Unknown Author'
      };

      mockBookService.prototype.processPDF.mockResolvedValue(mockBook);

      const response = await request(app)
        .post('/api/books/upload')
        .attach('pdf', Buffer.from('fake pdf content'), 'test.pdf')
        .expect(200);

      expect(response.body.book).toEqual(mockBook);
    });

    it('should reject non-PDF files', async () => {
      await request(app)
        .post('/api/books/upload')
        .attach('pdf', Buffer.from('fake content'), 'test.txt')
        .expect(400);
    });
  });
});

// backend/src/__tests__/services/storyGenerationService.test.ts
import { StoryGenerationService } from '../../services/storyGenerationService';
import { OpenAI } from 'openai';

vi.mock('openai');

describe('StoryGenerationService', () => {
  const mockOpenAI = OpenAI as vi.MockedClass<typeof OpenAI>;
  let storyService: StoryGenerationService;

  beforeEach(() => {
    vi.clearAllMocks();
    storyService = new StoryGenerationService();
  });

  describe('generateInitialStory', () => {
    it('should generate story with choices', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              content: 'Once upon a time...',
              mood: 'mysterious',
              complexity: 'medium'
            })
          }
        }]
      };

      mockOpenAI.prototype.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await storyService.generateInitialStory({
        genre: 'Fantasy',
        characters: 'A brave knight',
        setting: 'Medieval castle',
        preferences: { writingStyle: 'descriptive' }
      });

      expect(result.content).toBe('Once upon a time...');
      expect(result.metadata.mood).toBe('mysterious');
      expect(result.choices).toHaveLength(3);
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.prototype.chat.completions.create.mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        storyService.generateInitialStory({
          genre: 'Fantasy',
          characters: 'A brave knight',
          setting: 'Medieval castle',
          preferences: {}
        })
      ).rejects.toThrow('Story generation failed');
    });
  });
});

// E2E tests with Playwright
// e2e/tests/reading-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Reading Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
  });

  test('should upload and read a PDF', async ({ page }) => {
    // Navigate to library
    await page.click('[data-testid="library-link"]');
    
    // Upload PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-files/sample.pdf');
    
    // Wait for upload to complete
    await page.waitForSelector('[data-testid="book-card"]');
    
    // Click on the uploaded book
    await page.click('[data-testid="book-card"]');
    
    // Verify PDF reader opens
    await expect(page.locator('[data-testid="pdf-reader"]')).toBeVisible();
    
    // Test audio playback
    await page.click('[data-testid="play-audio"]');
    await expect(page.locator('[data-testid="audio-playing"]')).toBeVisible();
  });

  test('should generate an interactive story', async ({ page }) => {
    // Navigate to story generator
    await page.click('[data-testid="story-generator-link"]');
    
    // Fill story setup form
    await page.selectOption('[data-testid="genre-select"]', 'Fantasy');
    await page.fill('[data-testid="characters-input"]', 'A brave wizard');
    await page.fill('[data-testid="setting-input"]', 'Magical forest');
    
    // Generate story
    await page.click('[data-testid="generate-story"]');
    
    // Wait for story to be generated
    await page.waitForSelector('[data-testid="story-content"]');
    
    // Verify story content is displayed
    await expect(page.locator('[data-testid="story-content"]')).toContainText('wizard');
    
    // Verify choices are available
    await expect(page.locator('[data-testid="story-choice"]')).toHaveCount(3);
    
    // Make a choice
    await page.click('[data-testid="story-choice"]:first-child');
    
    // Verify story continues
    await page.waitForSelector('[data-testid="story-content"]');
  });

  test('should connect social media accounts', async ({ page }) => {
    // Navigate to profile
    await page.click('[data-testid="profile-link"]');
    
    // Connect Spotify
    await page.click('[data-testid="connect-spotify"]');
    
    // Mock Spotify OAuth (in real test, you'd handle the OAuth flow)
    await page.route('**/api/integrations/spotify/connect', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ authUrl: 'https://accounts.spotify.com/authorize?...' })
      });
    });
    
    // Verify connection initiated
    await expect(page.locator('[data-testid="spotify-connecting"]')).toBeVisible();
  });
});
```

#### **Day 4-5: Production Deployment**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
          cpus: '0.5'

  ai-services:
    build:
      context: ./ai-services
      dockerfile: Dockerfile.prod
    ports:
      - "8001:8001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - AZURE_SPEECH_KEY=${AZURE_SPEECH_KEY}
      - AZURE_SPEECH_REGION=${AZURE_SPEECH_REGION}
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 2G
          cpus: '1.0'

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

# Kubernetes deployment files
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: storyverse

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: storyverse-config
  namespace: storyverse
data:
  NODE_ENV: "production"
  REDIS_URL: "redis://redis-service:6379"

---
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: storyverse-secrets
  namespace: storyverse
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  jwt-secret: <base64-encoded-jwt-secret>
  openai-api-key: <base64-encoded-openai-key>
  azure-speech-key: <base64-encoded-azure-key>

---
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  namespace: storyverse
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: storyverse/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
  namespace: storyverse
spec:
  replicas: 5
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: storyverse/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: storyverse-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: storyverse-secrets
              key: jwt-secret
        envFrom:
        - configMapRef:
            name: storyverse-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/services.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: storyverse
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: storyverse
spec:
  selector:
    app: backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: storyverse-ingress
  namespace: storyverse
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - storyverse.com
    - api.storyverse.com
    secretName: storyverse-tls
  rules:
  - host: storyverse.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: api.storyverse.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000

---
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: storyverse
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-deployment
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### **Day 6-7: Monitoring & Analytics**
```typescript
// monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'storyverse-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'storyverse-ai-services'
    static_configs:
      - targets: ['ai-services:8001']
    metrics_path: /metrics
    scrape_interval: 15s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

# monitoring/alert_rules.yml
groups:
  - name: storyverse_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Database has {{ $value }} active connections"

      - alert: RedisMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Redis memory usage high"
          description: "Redis memory usage is {{ $value }}%"

# backend/src/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';

// Create metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const storyGenerationDuration = new promClient.Histogram({
  name: 'story_generation_duration_seconds',
  help: 'Duration of story generation in seconds',
  buckets: [1, 5, 10, 30, 60, 120]
});

const ttsGenerationDuration = new promClient.Histogram({
  name: 'tts_generation_duration_seconds',
  help: 'Duration of TTS generation in seconds',
  buckets: [0.5, 1, 2, 5, 10, 20]
});

// Register default metrics
promClient.register.setDefaultLabels({
  app: 'storyverse-backend'
});

promClient.collectDefaultMetrics();

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  
  // Increment active connections
  activeConnections.inc();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    // Record metrics
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status: res.statusCode
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route,
      status: res.statusCode
    }, duration);
    
    // Decrement active connections
    activeConnections.dec();
  });

  next();
};

export const metricsEndpoint = (req: Request, res: Response) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
};

export const recordStoryGeneration = (duration: number) => {
  storyGenerationDuration.observe(duration);
};

export const recordTTSGeneration = (duration: number) => {
  ttsGenerationDuration.observe(duration);
};

// analytics/src/analytics.ts
export class AnalyticsService {
  private events: any[] = [];

  async trackEvent(event: {
    userId?: string;
    eventType: string;
    properties: Record<string, any>;
    timestamp?: Date;
  }) {
    const analyticsEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
      sessionId: this.getSessionId(),
      userAgent: this.getUserAgent()
    };

    // Store in database
    await this.storeEvent(analyticsEvent);

    // Send to analytics service (e.g., Mixpanel, Amplitude)
    await this.sendToAnalyticsService(analyticsEvent);
  }

  async trackUserBehavior(userId: string, action: string, context: Record<string, any>) {
    await this.trackEvent({
      userId,
      eventType: 'user_behavior',
      properties: {
        action,
        ...context
      }
    });
  }

  async trackBookInteraction(userId: string, bookId: string, interaction: string) {
    await this.trackEvent({
      userId,
      eventType: 'book_interaction',
      properties: {
        bookId,
        interaction,
        timestamp: new Date()
      }
    });
  }

  async trackStoryGeneration(userId: string, storyData: any) {
    await this.trackEvent({
      userId,
      eventType: 'story_generation',
      properties: {
        genre: storyData.genre,
        characters: storyData.characters,
        setting: storyData.setting,
        generationTime: storyData.generationTime,
        choicesMade: storyData.choicesMade?.length || 0
      }
    });
  }

  async trackRecommendationInteraction(userId: string, recommendationId: string, action: string) {
    await this.trackEvent({
      userId,
      eventType: 'recommendation_interaction',
      properties: {
        recommendationId,
        action, // 'viewed', 'clicked', 'dismissed', 'added_to_library'
        timestamp: new Date()
      }
    });
  }

  async generateUserInsights(userId: string): Promise<UserInsights> {
    // Analyze user behavior patterns
    const events = await this.getUserEvents(userId);
    
    const insights = {
      readingHabits: this.analyzeReadingHabits(events),
      preferredGenres: this.analyzeGenrePreferences(events),
      engagementScore: this.calculateEngagementScore(events),
      recommendationAccuracy: this.calculateRecommendationAccuracy(events),
      socialActivity: this.analyzeSocialActivity(events)
    };

    return insights;
  }

  private analyzeReadingHabits(events: any[]): ReadingHabits {
    const readingSessions = events.filter(e => e.eventType === 'reading_session');
    
    return {
      averageSessionLength: this.calculateAverageSessionLength(readingSessions),
      preferredReadingTimes: this.analyzeReadingTimes(readingSessions),
      readingSpeed: this.calculateReadingSpeed(readingSessions),
      completionRate: this.calculateCompletionRate(readingSessions)
    };
  }

  private analyzeGenrePreferences(events: any[]): GenrePreferences {
    const bookInteractions = events.filter(e => e.eventType === 'book_interaction');
    const genreCounts: Record<string, number> = {};
    
    bookInteractions.forEach(event => {
      const genre = event.properties.genre;
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });

    return {
      topGenres: Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count })),
      genreDistribution: genreCounts
    };
  }

  private calculateEngagementScore(events: any[]): number {
    // Calculate engagement based on various factors
    const factors = {
      sessionFrequency: this.calculateSessionFrequency(events),
      featureUsage: this.calculateFeatureUsage(events),
      socialInteractions: this.calculateSocialInteractions(events),
      contentCreation: this.calculateContentCreation(events)
    };

    // Weighted average
    return (
      factors.sessionFrequency * 0.3 +
      factors.featureUsage * 0.25 +
      factors.socialInteractions * 0.25 +
      factors.contentCreation * 0.2
    );
  }
}

// deployment/scripts/deploy.sh
#!/bin/bash

set -e

echo "Starting StoryVerse deployment..."

# Build and push Docker images
echo "Building Docker images..."
docker build -t storyverse/frontend:latest ./frontend
docker build -t storyverse/backend:latest ./backend
docker build -t storyverse/ai-services:latest ./ai-services

echo "Pushing images to registry..."
docker push storyverse/frontend:latest
docker push storyverse/backend:latest
docker push storyverse/ai-services:latest

# Deploy to Kubernetes
echo "Deploying to Kubernetes..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/

# Wait for deployment to complete
echo "Waiting for deployment to complete..."
kubectl rollout status deployment/frontend-deployment -n storyverse
kubectl rollout status deployment/backend-deployment -n storyverse
kubectl rollout status deployment/ai-services-deployment -n storyverse

# Run database migrations
echo "Running database migrations..."
kubectl exec -n storyverse deployment/backend-deployment -- npm run migrate

# Warm up caches
echo "Warming up caches..."
kubectl exec -n storyverse deployment/backend-deployment -- npm run cache:warm

echo "Deployment completed successfully!"
echo "Application is available at: https://storyverse.com"
