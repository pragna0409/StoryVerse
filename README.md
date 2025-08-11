# Storyverse Platform

A modern, AI-powered interactive storytelling platform that allows users to create, read, and share interactive stories with branching narratives.

## 🚀 Features

- **AI-Powered Story Generation**: Create unique stories based on genre, characters, and settings
- **Interactive Narratives**: Make choices that shape the story's direction
- **User Authentication**: Secure login and registration system
- **Story Management**: Dashboard to organize and manage your stories
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Updates**: Live story progression and choice selection

## 🏗️ Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Redis for caching
- **AI Services**: Mock AI service (ready for OpenAI/Claude integration)
- **Authentication**: JWT-based auth with refresh tokens

## 📁 Project Structure

```
storyverse-platform/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/    # API route controllers
│   │   ├── services/       # Business logic services
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   ├── types/          # TypeScript interfaces
│   │   └── index.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API client services
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
├── database/               # Database initialization scripts
├── docker-compose.dev.yml  # Development environment setup
└── README.md
```

## 🛠️ Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (or use Docker)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd storyverse-platform
```

### 2. Set Up Environment Variables

Create environment files for both backend and frontend:

**Backend** (`backend/env.example` → `backend/.env`):
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=storyverse_dev
DB_USER=storyverse_user
DB_PASSWORD=dev_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_URL=http://localhost:3001
```

### 3. Start the Database

```bash
docker-compose -f docker-compose.dev.yml up -d postgres redis
```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Start the Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001` and automatically create the database tables.

### 6. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`.

## 🔧 Development

### Backend Development

```bash
cd backend

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

### Frontend Development

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Stories
- `POST /api/stories/generate` - Generate new story
- `POST /api/stories/:id/continue` - Continue story with choice
- `PUT /api/stories/:id/save` - Save story
- `GET /api/stories/user` - Get user's stories
- `GET /api/stories/public` - Get public stories

### Health Check
- `GET /health` - Server health status

## 🗄️ Database Schema

The platform uses PostgreSQL with the following main tables:

- **users**: User accounts and authentication
- **stories**: Story content and metadata
- **reviews**: User reviews and ratings

## 🎨 UI Components

The frontend includes:

- **Navbar**: Navigation and user menu
- **Home**: Landing page with features
- **Login/Register**: Authentication forms
- **StoryGenerator**: Story creation interface
- **StoryReader**: Interactive story reading
- **Dashboard**: User story management

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Input validation and sanitization

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve the dist/ folder with your web server
```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Future Enhancements

- Real AI integration (OpenAI, Claude)
- Text-to-speech functionality
- Social features and story sharing
- Advanced story analytics
- Mobile app development
- Multi-language support

---

**Happy Storytelling! 📚✨** 