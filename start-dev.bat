@echo off
echo 🚀 Starting Storyverse Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Start database services
echo 📊 Starting database services...
docker-compose -f docker-compose.dev.yml up -d postgres redis

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo 🔧 Creating backend environment file...
    copy env.example .env
    echo ✅ Backend environment file created. Please update JWT_SECRET in .env file.
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo 🔧 Creating frontend environment file...
    echo VITE_API_URL=http://localhost:3001 > .env
    echo ✅ Frontend environment file created.
)

echo.
echo 🎉 Setup complete! To start the application:
echo.
echo 1. Start the backend:
echo    cd backend ^&^& npm run dev
echo.
echo 2. In a new terminal, start the frontend:
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Open http://localhost:5173 in your browser
echo.
echo 📚 Backend API will be available at http://localhost:3001
echo 🏠 Frontend will be available at http://localhost:5173
echo.
echo 💡 Don't forget to update the JWT_SECRET in backend/.env for production use!
echo.
pause 