// backend/src/services/aiService.ts
import { StoryGenerationRequest, StorySegment, StoryContinuationRequest, Choice, StoryMetadata } from '../types/index.js';

export class AIService {
  constructor() {}

  async generateInitialStory(request: StoryGenerationRequest): Promise<StorySegment> {
    // This is a mock implementation - in production, you'd integrate with OpenAI, Claude, or similar
    const mockStory = this.generateMockStory(request);
    
    return {
      content: mockStory.content,
      choices: mockStory.choices,
      metadata: mockStory.metadata
    };
  }

  async continueStory(content: string, choice: Choice, metadata: StoryMetadata): Promise<StorySegment> {
    // Mock story continuation
    const continuation = this.generateMockContinuation(content, choice, metadata);
    
    return {
      content: continuation.content,
      choices: continuation.choices,
      metadata: metadata
    };
  }

  private generateMockStory(request: StoryGenerationRequest): StorySegment {
    const { genre, characters, setting } = request;
    
    const mockContent = `In the mystical realm of ${setting}, where ${characters.join(' and ')} roamed freely, a great adventure was about to unfold. The air crackled with ancient magic as the sun set behind the towering mountains, casting long shadows across the enchanted landscape.

${characters[0]} felt a strange pull towards the heart of the forest, where legends spoke of a hidden artifact that could change the fate of their world forever. The decision lay heavy on their shoulders as they stood at the crossroads of destiny.`;

    const mockChoices: Choice[] = [
      {
        id: 'choice_1',
        text: 'Follow the mysterious pull into the forest',
        description: 'Venture deeper into the unknown',
        consequences: ['Discover ancient secrets', 'Face unknown dangers']
      },
      {
        id: 'choice_2',
        text: 'Seek guidance from the village elders first',
        description: 'Gather wisdom before acting',
        consequences: ['Gain valuable knowledge', 'Risk losing the opportunity']
      },
      {
        id: 'choice_3',
        text: 'Wait and observe the situation',
        description: 'Take time to understand what\'s happening',
        consequences: ['Avoid immediate danger', 'Miss the moment of action']
      }
    ];

    const mockMetadata: StoryMetadata = {
      genre: genre,
      tone: 'mysterious and adventurous',
      complexity: 'moderate',
      targetAge: 'young adult',
      themes: ['destiny', 'courage', 'mystery', 'adventure']
    };

    return {
      content: mockContent,
      choices: mockChoices,
      metadata: mockMetadata
    };
  }

  private generateMockContinuation(content: string, choice: Choice, metadata: StoryMetadata): StorySegment {
    let continuation = '';
    
    switch (choice.id) {
      case 'choice_1':
        continuation = `\n\nWith determination burning in their heart, ${metadata.genre === 'fantasy' ? 'the brave adventurer' : 'they'} stepped forward into the shadowy depths of the forest. The ancient trees seemed to whisper secrets as they passed, and the ground beneath their feet felt alive with ancient energy.

As they ventured deeper, the path became less clear, but their resolve only grew stronger. Suddenly, a soft glow appeared ahead, pulsing with the rhythm of an ancient heartbeat.`;
        break;
      case 'choice_2':
        continuation = `\n\nWisdom often comes from those who have walked the path before. ${metadata.genre === 'fantasy' ? 'The adventurer' : 'They'} turned back towards the village, seeking the counsel of the elders who had witnessed countless generations come and go.

The village elders gathered in their sacred circle, their eyes filled with the wisdom of ages. They shared tales of the artifact and the great responsibility that came with its power.`;
        break;
      case 'choice_3':
        continuation = `\n\nSometimes the greatest strength lies in patience. ${metadata.genre === 'fantasy' ? 'The adventurer' : 'They'} chose to wait and observe, watching as the forest seemed to breathe and change around them.

In the stillness, patterns began to emerge - the way the shadows moved, the rhythm of the wind through the leaves, and the subtle signs that pointed towards a hidden truth.`;
        break;
      default:
        continuation = `\n\nThe path forward remained uncertain, but every choice shapes the story yet to be told.`;
    }

    const newChoices: Choice[] = [
      {
        id: `choice_${Date.now()}_1`,
        text: 'Continue forward with renewed purpose',
        description: 'Embrace the consequences of your choice',
        consequences: ['Progress in the story', 'Face new challenges']
      },
      {
        id: `choice_${Date.now()}_2`,
        text: 'Reflect on what you\'ve learned',
        description: 'Take a moment to understand the situation',
        consequences: ['Gain insight', 'Prepare for what\'s ahead']
      }
    ];

    return {
      content: continuation,
      choices: newChoices,
      metadata: metadata
    };
  }
} 