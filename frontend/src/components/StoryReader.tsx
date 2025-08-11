import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Save, Share2, ArrowLeft, Play, Pause } from 'lucide-react';

interface Choice {
  id: string;
  text: string;
  description?: string;
  consequences?: string[];
}

interface Story {
  id: string;
  title: string;
  content: string;
  choices: Choice[];
  genre: string;
  isCompleted: boolean;
}

const StoryReader: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');

  useEffect(() => {
    // Mock story data - in production this would fetch from API
    const mockStory: Story = {
      id: storyId || '1',
      title: 'The Mysterious Forest Adventure',
      content: `In the mystical realm of an enchanted forest, where ancient trees whispered secrets and magical creatures roamed freely, a great adventure was about to unfold. The air crackled with ancient magic as the sun set behind the towering mountains, casting long shadows across the enchanted landscape.

A young adventurer named Alex felt a strange pull towards the heart of the forest, where legends spoke of a hidden artifact that could change the fate of their world forever. The decision lay heavy on their shoulders as they stood at the crossroads of destiny.

The forest path stretched before them, winding through groves of silver-barked trees whose leaves shimmered like precious metals in the fading light. Somewhere in the distance, the haunting melody of a mysterious flute echoed through the trees, calling to something deep within Alex's soul.

As they ventured deeper into the forest, the path became less clear, but their resolve only grew stronger. Suddenly, a soft glow appeared ahead, pulsing with the rhythm of an ancient heartbeat. The source of the light revealed itself to be a magnificent crystal embedded in the trunk of an ancient oak tree, its facets catching and reflecting the starlight in a mesmerizing dance.

The crystal seemed to hum with energy, and as Alex approached, they could feel its power resonating with their own spirit. But they weren't alone in this discovery. From the shadows emerged a wise old owl with eyes that held the wisdom of centuries, and a mischievous fox whose coat seemed to change colors in the shifting light.

The owl spoke in a voice that seemed to come from everywhere and nowhere: "You have been chosen, young one. The crystal you see before you is the Heart of the Forest, and it has been waiting for someone worthy to claim its power. But beware, for with great power comes great responsibility, and the choices you make now will shape not only your destiny but the fate of this entire realm."`,
      choices: [
        {
          id: 'choice_1',
          text: 'Accept the crystal and its power',
          description: 'Embrace the responsibility and become the guardian of the forest',
          consequences: ['Gain immense magical power', 'Become bound to protect the forest', 'Face new challenges and enemies']
        },
        {
          id: 'choice_2',
          text: 'Ask for more information first',
          description: 'Seek wisdom before making such a life-changing decision',
          consequences: ['Learn about the forest\'s history', 'Understand the true nature of the power', 'Risk losing the opportunity']
        },
        {
          id: 'choice_3',
          text: 'Decline the power and walk away',
          description: 'Choose a simpler path and avoid the burden of responsibility',
          consequences: ['Return to normal life', 'Miss out on adventure and magic', 'Stay safe from danger']
        }
      ],
      genre: 'fantasy',
      isCompleted: false
    };

    setStory(mockStory);
    setStoryTitle(mockStory.title);
    setIsLoading(false);
  }, [storyId]);

  const handleChoice = async (choiceId: string) => {
    if (!story) return;

    // In production, this would call the API to continue the story
    console.log('Choice selected:', choiceId);
    
    // For now, we'll just mark the story as completed
    setStory({ ...story, isCompleted: true });
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // In production, this would handle text-to-speech
  };

  const handleSave = () => {
    // In production, this would save the story to the user's library
    console.log('Saving story:', storyTitle);
    setShowSaveModal(false);
    alert('Story saved successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Story not found</h2>
        <button
          onClick={() => navigate('/generate')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Create New Story
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleAudio}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Save</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{story.title}</h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span className="capitalize">{story.genre}</span>
            </span>
            <span>•</span>
            <span>{story.isCompleted ? 'Completed' : 'In Progress'}</span>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="prose prose-lg max-w-none">
          {story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Story Choices */}
      {story.choices && story.choices.length > 0 && !story.isCompleted && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What happens next?
          </h3>
          <div className="grid gap-4">
            {story.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
              >
                <div className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-purple-700">
                  {choice.text}
                </div>
                {choice.description && (
                  <div className="text-gray-600 mb-3">{choice.description}</div>
                )}
                {choice.consequences && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Consequences:</span>
                    <ul className="mt-1 space-y-1">
                      {choice.consequences.map((consequence, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                          <span>{consequence}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Save Your Story</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Title
              </label>
              <input
                type="text"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter a title for your story"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryReader; 