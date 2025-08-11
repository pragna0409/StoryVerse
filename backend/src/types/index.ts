// backend/src/types/index.ts

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  createdAt?: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface Story {
  id: string;
  userId: string;
  title: string;
  genre: string;
  characters: string[];
  setting: string;
  content: string;
  choices: Choice[];
  currentChoices: Choice[];
  choicesMade: Choice[];
  metadata: StoryMetadata;
  isPublic: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Choice {
  id: string;
  text: string;
  description?: string;
  consequences?: string[];
}

export interface StoryMetadata {
  genre: string;
  tone: string;
  complexity: 'simple' | 'moderate' | 'complex';
  targetAge: string;
  themes: string[];
}

export interface StoryGenerationRequest {
  genre: string;
  characters: string[];
  setting: string;
  preferences?: {
    tone?: string;
    complexity?: string;
    targetAge?: string;
    themes?: string[];
  };
}

export interface StorySegment {
  content: string;
  choices: Choice[];
  metadata: StoryMetadata;
}

export interface StoryContinuationRequest {
  content: string;
  choice: Choice;
  metadata: StoryMetadata;
}

export interface AuthRequest extends Request {
  user: User;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
} 