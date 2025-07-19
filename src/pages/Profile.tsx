import React, { useState } from 'react';
import { Edit, BookOpen, Star, Trophy, Music, Eye } from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Reader',
    email: 'alex@storyverse.com',
    bio: 'Passionate reader and aspiring writer who loves fantasy and sci-fi genres.',
    favoriteGenres: ['Fantasy', 'Sci-Fi', 'Mystery'],
    readingGoal: 50,
    booksRead: 32,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300'
  });

  const [personalityTest, setPersonalityTest] = useState({
    currentQuestion: 0,
    answers: [] as number[],
    completed: false
  });

  const personalityQuestions = [
    "I prefer fantasy worlds over realistic settings",
    "I enjoy complex, multi-layered characters",
    "I like books with romantic subplots",
    "I prefer fast-paced action over slow character development",
    "I enjoy reading series more than standalone books",
    "I like books that make me think deeply about life",
    "I prefer happy endings over ambiguous ones",
    "I enjoy books with mystery elements"
  ];

  const stats = [
    { icon: <BookOpen className="w-6 h-6" />, label: 'Books Read', value: profile.booksRead },
    { icon: <Star className="w-6 h-6" />, label: 'Average Rating', value: '4.2' },
    { icon: <Trophy className="w-6 h-6" />, label: 'Reading Streak', value: '12 days' },
    { icon: <Eye className="w-6 h-6" />, label: 'Pages Read', value: '8,450' }
  ];

  const handlePersonalityAnswer = (rating: number) => {
    const newAnswers = [...personalityTest.answers, rating];
    
    if (personalityTest.currentQuestion < personalityQuestions.length - 1) {
      setPersonalityTest({
        ...personalityTest,
        currentQuestion: personalityTest.currentQuestion + 1,
        answers: newAnswers
      });
    } else {
      setPersonalityTest({
        ...personalityTest,
        answers: newAnswers,
        completed: true
      });
    }
  };

  const saveProfile = () => {
    setIsEditing(false);
    // Here you would save to backend
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="text-2xl font-bold bg-transparent border-b-2 border-amber-500 text-gray-900 dark:text-white focus:outline-none"
                />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                />
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  rows={3}
                />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{profile.email}</p>
                <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
              </>
            )}
          </div>
          
          <button
            onClick={isEditing ? saveProfile : () => setIsEditing(true)}
            className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>{isEditing ? 'Save' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Favorite Genres */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Favorite Genres</h3>
          <div className="flex flex-wrap gap-2">
            {profile.favoriteGenres.map(genre => (
              <span
                key={genre}
                className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg text-center">
            <div className="text-amber-600 dark:text-amber-400 flex justify-center mb-2">
              {stat.icon}
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Reading Goal Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">2024 Reading Goal</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400">
            {profile.booksRead} of {profile.readingGoal} books
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            {Math.round((profile.booksRead / profile.readingGoal) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((profile.booksRead / profile.readingGoal) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Personality Test */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reading Personality Test
        </h3>
        
        {!personalityTest.completed ? (
          <div>
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Question {personalityTest.currentQuestion + 1} of {personalityQuestions.length}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((personalityTest.currentQuestion + 1) / personalityQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <p className="text-gray-900 dark:text-white mb-6 text-lg">
              {personalityQuestions[personalityTest.currentQuestion]}
            </p>
            
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => handlePersonalityAnswer(rating)}
                  className="w-12 h-12 rounded-full border-2 border-amber-500 hover:bg-amber-500 hover:text-white transition-colors text-amber-600 font-semibold"
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-green-600 dark:text-green-400 mb-4">
              <Trophy className="w-12 h-12 mx-auto mb-2" />
              <h4 className="text-xl font-semibold">Test Completed!</h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Based on your answers, we'll provide personalized book recommendations.
            </p>
            <button
              onClick={() => setPersonalityTest({ currentQuestion: 0, answers: [], completed: false })}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retake Test
            </button>
          </div>
        )}
      </div>

      {/* Connected Services */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connected Services
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Music className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Spotify</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Connect for reading playlists</div>
              </div>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
              Connect
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Pinterest</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Analyze your boards for book suggestions</div>
              </div>
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;