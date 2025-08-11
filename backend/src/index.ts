// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { DatabaseService } from './services/databaseService.js';
import { StoryController } from './controllers/storyController.js';
import { StoryService } from './services/storyService.js';
import { AIService } from './services/aiService.js';
import { UserModel } from './models/User.js';
import { authenticateToken } from './middleware/auth.js';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'storyverse_dev',
  user: process.env.DB_USER || 'storyverse_user',
  password: process.env.DB_PASSWORD || 'dev_password'
};

// Initialize services
const databaseService = new DatabaseService(dbConfig);
const storyService = new StoryService(databaseService as any);
const aiService = new AIService();
const userModel = new UserModel(databaseService as any);

// Initialize controllers
const storyController = new StoryController(storyService, aiService);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealthy = await databaseService.healthCheck();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;
    
    if (!email || !password || !username || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await userModel.createUser({ email, password, username, fullName });
    const tokens = userModel.generateTokens(user.id);
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName
      },
      tokens
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userModel.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = userModel.generateTokens(user.id);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName
      },
      tokens
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    const newTokens = userModel.generateTokens(decoded.userId);
    
    res.json({
      message: 'Token refreshed successfully',
      tokens: newTokens
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});

// Story routes (protected)
app.post('/api/stories/generate', authenticateToken, (req, res) => {
  storyController.generateStory(req, res);
});

app.post('/api/stories/:storyId/continue', authenticateToken, (req, res) => {
  storyController.continueStory(req, res);
});

app.put('/api/stories/:storyId/save', authenticateToken, (req, res) => {
  storyController.saveStory(req, res);
});

app.get('/api/stories/user', authenticateToken, (req, res) => {
  storyController.getUserStories(req, res);
});

app.get('/api/stories/public', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const stories = await storyService.getPublicStories(Number(page), Number(limit));
    res.json({ stories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public stories' });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await databaseService.initializeTables();
    console.log('Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Storyverse Backend Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await databaseService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await databaseService.close();
  process.exit(0);
});

startServer(); 