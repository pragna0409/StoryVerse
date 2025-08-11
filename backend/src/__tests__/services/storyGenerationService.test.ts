
// backend/src/__tests__/services/storyGenerationService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoryService } from '../../services/storyService';
import { AIService } from '../../services/aiService';
import { DatabaseService } from '../../services/databaseService';
import type { Choice, StoryMetadata } from '../../types';

// Mock the database service
const mockDatabaseService = {
  query: vi.fn(),
  getClient: vi.fn(),
  transaction: vi.fn(),
  initializeTables: vi.fn(),
  close: vi.fn(),
  healthCheck: vi.fn(),
};

// Mock the AI service
const mockAIService = {
  generateInitialStory: vi.fn(),
  continueStory: vi.fn(),
};

describe('StoryService', () => {
  let storyService: StoryService;
  let aiService: AIService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create new instances
    storyService = new StoryService(mockDatabaseService as any);
    aiService = new AIService();
  });

  describe('createStory', () => {
    it('should create a story successfully', async () => {
      const mockStoryData = {
        userId: 'user123',
        title: 'Test Story',
        genre: 'fantasy',
        characters: ['Hero', 'Villain'],
        setting: 'Medieval Kingdom',
        content: 'Once upon a time...',
        choices: [] as Choice[],
        metadata: {
          genre: 'fantasy',
          tone: 'adventurous',
          complexity: 'moderate' as const,
          targetAge: 'young adult',
          themes: ['courage', 'adventure']
        } as StoryMetadata
      };

      const mockResult = {
        rows: [{
          id: 'story123',
          user_id: 'user123',
          title: 'Test Story',
          genre: 'fantasy',
          characters: JSON.stringify(['Hero', 'Villain']),
          setting: 'Medieval Kingdom',
          content: 'Once upon a time...',
          choices: JSON.stringify([]),
          current_choices: JSON.stringify([]),
          choices_made: JSON.stringify([]),
          metadata: JSON.stringify(mockStoryData.metadata),
          is_public: false,
          is_completed: false,
          created_at: new Date(),
          updated_at: new Date()
        }]
      };

      mockDatabaseService.query.mockResolvedValue(mockResult);

      const result = await storyService.createStory(mockStoryData);

      expect(result).toBeDefined();
      expect(result.id).toBe('story123');
      expect(result.title).toBe('Test Story');
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO stories'),
        expect.arrayContaining([
          'user123',
          'Test Story',
          'fantasy',
          JSON.stringify(['Hero', 'Villain']),
          'Medieval Kingdom',
          'Once upon a time...',
          JSON.stringify([]),
          JSON.stringify([]),
          JSON.stringify(mockStoryData.metadata),
          false,
          false
        ])
      );
    });
  });

  describe('getStory', () => {
    it('should return a story when found', async () => {
      const mockResult = {
        rows: [{
          id: 'story123',
          user_id: 'user123',
          title: 'Test Story',
          genre: 'fantasy',
          characters: JSON.stringify(['Hero', 'Villain']),
          setting: 'Medieval Kingdom',
          content: 'Once upon a time...',
          choices: JSON.stringify([]),
          current_choices: JSON.stringify([]),
          choices_made: JSON.stringify([]),
          metadata: JSON.stringify({}),
          is_public: false,
          is_completed: false,
          created_at: new Date(),
          updated_at: new Date()
        }]
      };

      mockDatabaseService.query.mockResolvedValue(mockResult);

      const result = await storyService.getStory('story123', 'user123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('story123');
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM stories'),
        ['story123', 'user123']
      );
    });

    it('should return null when story not found', async () => {
      mockDatabaseService.query.mockResolvedValue({ rows: [] });

      const result = await storyService.getStory('nonexistent', 'user123');

      expect(result).toBeNull();
    });
  });
});
