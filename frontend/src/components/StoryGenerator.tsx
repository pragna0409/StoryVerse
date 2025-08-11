// frontend/src/components/StoryGenerator.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Users, MapPin } from 'lucide-react';

interface StoryForm {
  genre: string;
  characters: string[];
  setting: string;
  tone: string;
  complexity: string;
  targetAge: string;
}

const StoryGenerator: React.FC = () => {
  const [formData, setFormData] = useState<StoryForm>({
    genre: '',
    characters: [''],
    setting: '',
    tone: 'adventurous',
    complexity: 'moderate',
    targetAge: 'young adult'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const genres = [
    'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Adventure', 
    'Horror', 'Historical', 'Contemporary', 'Dystopian', 'Steampunk'
  ];

  const tones = [
    'Adventurous', 'Mysterious', 'Romantic', 'Dark', 'Humorous', 
    'Serious', 'Whimsical', 'Epic', 'Intimate', 'Suspenseful'
  ];

  const complexities = ['Simple', 'Moderate', 'Complex'];
  const targetAges = ['Children', 'Young Adult', 'Adult', 'All Ages'];

  const handleCharacterChange = (index: number, value: string) => {
    const newCharacters = [...formData.characters];
    newCharacters[index] = value;
    setFormData({ ...formData, characters: newCharacters });
  };

  const addCharacter = () => {
    setFormData({
      ...formData,
      characters: [...formData.characters, '']
    });
  };

  const removeCharacter = (index: number) => {
    if (formData.characters.length > 1) {
      const newCharacters = formData.characters.filter((_, i) => i !== index);
      setFormData({ ...formData, characters: newCharacters });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // Filter out empty character names
    const validCharacters = formData.characters.filter(char => char.trim() !== '');
    
    if (validCharacters.length === 0) {
      alert('Please add at least one character');
      setIsGenerating(false);
      return;
    }

    try {
      // Mock story generation - in production this would call the API
      const mockStoryId = 'story_' + Date.now();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to the story reader
      navigate(`/story/${mockStoryId}`);
    } catch (error) {
      console.error('Story generation failed:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Story</h1>
        <p className="text-xl text-gray-600">
          Let your imagination run wild and craft an unforgettable adventure
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Genre Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <BookOpen className="w-5 h-5 inline mr-2" />
                Story Genre
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select a genre</option>
                {genres.map(genre => (
                  <option key={genre} value={genre.toLowerCase()}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <MapPin className="w-5 h-5 inline mr-2" />
                Story Setting
              </label>
              <textarea
                value={formData.setting}
                onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                placeholder="Describe the world where your story takes place..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={4}
                required
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Story Tone
              </label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {tones.map(tone => (
                  <option key={tone} value={tone.toLowerCase()}>{tone}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Characters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Users className="w-5 h-5 inline mr-2" />
                Main Characters
              </label>
              <div className="space-y-3">
                {formData.characters.map((character, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={character}
                      onChange={(e) => handleCharacterChange(index, e.target.value)}
                      placeholder={`Character ${index + 1} name`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {formData.characters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCharacter(index)}
                        className="px-3 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCharacter}
                  className="w-full py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-400 transition-colors"
                >
                  + Add Character
                </button>
              </div>
            </div>

            {/* Complexity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Story Complexity
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {complexities.map(complexity => (
                  <option key={complexity} value={complexity.toLowerCase()}>{complexity}</option>
                ))}
              </select>
            </div>

            {/* Target Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Age Group
              </label>
              <select
                value={formData.targetAge}
                onChange={(e) => setFormData({ ...formData, targetAge: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {targetAges.map(age => (
                  <option key={age} value={age.toLowerCase()}>{age}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            disabled={isGenerating || !formData.genre || !formData.setting}
            className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center mx-auto space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Story...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate My Story</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoryGenerator;
