 
import React, { useState } from 'react';
import { Wand2, Shuffle, Save, Play, Pause } from 'lucide-react';

interface StoryChoice {
  id: number;
  text: string;
  description: string;
}

const StoryGenerator = () => {
  const [genre, setGenre] = useState('');
  const [characters, setCharacters] = useState('');
  const [setting, setSetting] = useState('');
  const [storyText, setStoryText] = useState('');
  const [currentChoices, setCurrentChoices] = useState<StoryChoice[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const genres = [
    'Fantasy', 'Romance', 'Mystery', 'Sci-Fi', 'Horror', 'Adventure', 
    'Historical Fiction', 'Comedy', 'Drama', 'Thriller'
  ];

  const generateStory = async () => {
    if (!genre || !characters || !setting) return;
    
    setIsGenerating(true);
    
    // Simulate AI story generation
    setTimeout(() => {
      const generatedStory = `In the mystical realm of ${setting}, ${characters} discovered something extraordinary. The ${genre.toLowerCase()} adventure was about to begin in ways they never imagined.

As the morning mist cleared from the ancient forest, ${characters} could hear strange whispers echoing through the trees. The air shimmered with an otherworldly energy, and every step forward seemed to lead them deeper into a mystery that would change their lives forever.

Suddenly, three paths revealed themselves before them, each glowing with a different colored light.`;

      setStoryText(generatedStory);
      setCurrentChoices([
        {
          id: 1,
          text: "Take the golden path",
          description: "A warm, inviting light that promises safety and wisdom"
        },
        {
          id: 2,
          text: "Follow the silver path", 
          description: "A mysterious shimmer that hints at magical discoveries"
        },
        {
          id: 3,
          text: "Choose the crimson path",
          description: "A bold red glow that suggests danger and great rewards"
        }
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  const continueStory = (choice: StoryChoice) => {
    const continuations = {
      1: "\n\nThe golden path led them to a wise old sage who offered ancient knowledge and powerful artifacts. The journey ahead would be guided by wisdom and careful planning.",
      2: "\n\nThe silver path opened into a realm of pure magic, where spells danced in the air and mythical creatures offered their aid. Reality itself seemed to bend to their will.",
      3: "\n\nThe crimson path thrust them into immediate danger, but also revealed a hidden strength within. Each challenge overcome made them more powerful than before."
    };

    setStoryText(prev => prev + continuations[choice.id as keyof typeof continuations]);
    
    // Generate new choices
    const newChoices = [
      { id: 1, text: "Seek allies", description: "Find companions to join the quest" },
      { id: 2, text: "Face the challenge alone", description: "Test your individual strength" },
      { id: 3, text: "Look for another way", description: "Search for alternative solutions" }
    ];
    setCurrentChoices(newChoices);
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // Here you would implement actual text-to-speech
  };

  const saveStory = () => {
    // Implement save functionality
    console.log('Story saved!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          AI Story Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create your own interactive adventure with AI assistance
        </p>
      </div>

      {/* Story Setup */}
      {!storyText && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Set Up Your Story
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select a genre</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Main Character(s)
              </label>
              <input
                type="text"
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                placeholder="e.g., A brave knight named Alex"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Setting
              </label>
              <input
                type="text"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="e.g., An enchanted forest"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          
          <button
            onClick={generateStory}
            disabled={!genre || !characters || !setting || isGenerating}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Shuffle className="w-5 h-5 animate-spin" />
                <span>Generating Story...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate Story</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Story Display */}
      {storyText && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Story
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={toggleAudio}
                className="p-2 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={saveStory}
                className="p-2 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {storyText}
            </p>
          </div>

          {/* Story Choices */}
          {currentChoices.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What happens next?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentChoices.map(choice => (
                  <button
                    key={choice.id}
                    onClick={() => continueStory(choice)}
                    className="p-4 border-2 border-amber-200 dark:border-amber-700 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                      {choice.text}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {choice.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;