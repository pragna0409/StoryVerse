// frontend/src/services/api.ts
import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  genre: string;
  characters: string[];
  setting: string;
  choices: Choice[];
  currentChoices: Choice[];
  choicesMade: Choice[];
  metadata: StoryMetadata;
  isPublic: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Choice {
  id: string;
  text: string;
  nextSegmentId?: string;
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
  tone: string;
  complexity: 'simple' | 'moderate' | 'complex';
  targetAge: string;
}

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData: { fullName: string; username: string; email: string; password: string }) => {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', credentials);
    return response.data;
  },
  
  refresh: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Story API calls
export const storyAPI = {
  generateStory: async (request: StoryGenerationRequest) => {
    const response = await api.post<ApiResponse<Story>>('/stories/generate', request);
    return response.data;
  },
  
  continueStory: async (storyId: string, choiceId: string) => {
    const response = await api.post<ApiResponse<Story>>(`/stories/${storyId}/continue`, { choiceId });
    return response.data;
  },
  
  saveStory: async (storyId: string, updates: Partial<Story>) => {
    const response = await api.put<ApiResponse<Story>>(`/stories/${storyId}`, updates);
    return response.data;
  },
  
  getUserStories: async () => {
    const response = await api.get<ApiResponse<Story[]>>('/stories/user');
    return response.data;
  },
  
  getStory: async (storyId: string) => {
    const response = await api.get<ApiResponse<Story>>(`/stories/${storyId}`);
    return response.data;
  },
};

export default api; 