#!/bin/bash

echo "🚀 Starting Storyverse Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start database services
echo "📊 Starting database services..."
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating backend environment file..."
    cp env.example .env
    echo "✅ Backend environment file created. Please update JWT_SECRET in .env file."
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating frontend environment file..."
    echo "VITE_API_URL=http://localhost:3001" > .env
    echo "✅ Frontend environment file created."
fi

echo ""
echo "🎉 Setup complete! To start the application:"
echo ""
echo "1. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Backend API will be available at http://localhost:3001"
echo "🏠 Frontend will be available at http://localhost:5173"
echo ""
echo "💡 Don't forget to update the JWT_SECRET in backend/.env for production use!" 