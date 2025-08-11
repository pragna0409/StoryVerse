-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    reading_goal INTEGER DEFAULT 12,
    preferred_genres TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    subscription_tier VARCHAR(20) DEFAULT 'free'
);

-- Books Table
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    author VARCHAR(200),
    isbn VARCHAR(20),
    genre VARCHAR(50),
    description TEXT,
    cover_url VARCHAR(500),
    page_count INTEGER,
    publication_date DATE,
    language VARCHAR(10) DEFAULT 'en',
    file_url VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(20),
    uploaded_by UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Library Table
CREATE TABLE user_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'to_read', -- to_read, reading, completed, abandoned
    progress DECIMAL(5,2) DEFAULT 0.00, -- percentage
    current_page INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Generated Stories Table
CREATE TABLE generated_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    genre VARCHAR(50),
    characters TEXT,
    setting TEXT,
    content TEXT NOT NULL,
    choices_made JSONB, -- Array of choice objects
    story_tree JSONB, -- Complete story structure
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    spoiler_warning BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Reading Sessions Table
CREATE TABLE reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    pages_read INTEGER DEFAULT 0,
    words_read INTEGER DEFAULT 0,
    session_type VARCHAR(20) DEFAULT 'reading', -- reading, listening
    device_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(10) DEFAULT 'light',
    font_size INTEGER DEFAULT 16,
    font_family VARCHAR(50) DEFAULT 'serif',
    reading_speed DECIMAL(3,2) DEFAULT 1.00,
    voice_type VARCHAR(20) DEFAULT 'female',
    voice_speed DECIMAL(3,2) DEFAULT 1.00,
    auto_play_music BOOLEAN DEFAULT TRUE,
    notification_settings JSONB,
    privacy_settings JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Connected Accounts Table
CREATE TABLE connected_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- spotify, pinterest, goodreads
    platform_user_id VARCHAR(100),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    account_data JSONB, -- Platform-specific data
    is_active BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMP DEFAULT NOW(),
    last_sync TIMESTAMP,
    UNIQUE(user_id, platform)
);

-- Bookmarks Table
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    page_number INTEGER,
    position_percentage DECIMAL(5,2),
    note TEXT,
    highlight_text TEXT,
    highlight_color VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Recommendations Table
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50), -- collaborative, content_based, social, ai
    confidence_score DECIMAL(3,2),
    reasoning TEXT,
    is_clicked BOOLEAN DEFAULT FALSE,
    is_added_to_library BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
