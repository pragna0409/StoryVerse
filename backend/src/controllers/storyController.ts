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
        content: story.content + '\\n\\n' + continuation.content,
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
