// frontend/src/components/BookClubs.tsx
import React, { useState, useEffect } from 'react';
import { Users, Calendar, BookOpen, MessageSquare, Search } from 'lucide-react';

interface BookClub {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  currentBook?: {
    id: string;
    title: string;
    author: string;
    cover: string;
  };
  nextMeeting?: string;
  tags: string[];
  createdBy: string;
  isMember: boolean;
}

interface ReadingChallenge {
  id: string;
  title: string;
  description: string;
  targetBooks: number;
  currentProgress: number;
  endDate: string;
  participants: number;
  isParticipating: boolean;
}

export const BookClubs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clubs' | 'challenges'>('clubs');
  const [bookClubs, setBookClubs] = useState<BookClub[]>([]);
  const [challenges, setChallenges] = useState<ReadingChallenge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    if (activeTab === 'clubs') {
      loadBookClubs();
    } else {
      loadChallenges();
    }
  }, [activeTab]);

  const loadBookClubs = async () => {
    try {
      const response = await fetch('/api/book-clubs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const clubs = await response.json();
        setBookClubs(clubs);
      }
    } catch (error) {
      console.error('Failed to load book clubs:', error);
    }
  };

  const loadChallenges = async () => {
    try {
      const response = await fetch('/api/reading-challenges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const challengeData = await response.json();
        setChallenges(challengeData);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  const joinClub = async (clubId: string) => {
    try {
      const response = await fetch(`/api/book-clubs/${clubId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setBookClubs(prev => prev.map(club =>
          club.id === clubId
            ? { ...club, isMember: true, memberCount: club.memberCount + 1 }
            : club
        ));
      }
    } catch (error) {
      console.error('Failed to join club:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/reading-challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setChallenges(prev => prev.map(challenge =>
          challenge.id === challengeId
            ? { ...challenge, isParticipating: true, participants: challenge.participants + 1 }
            : challenge
        ));
      }
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const filteredClubs = bookClubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredChallenges = challenges.filter(challenge =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="book-clubs">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Community
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join book clubs and reading challenges to connect with fellow readers
          </p>
        </div>


      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-8">
        <button
          onClick={() => setActiveTab('clubs')}
          className={`flex-1 py-3 px-4 rounded-md transition-colors ${
            activeTab === 'clubs'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Book Clubs
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex-1 py-3 px-4 rounded-md transition-colors ${
            activeTab === 'challenges'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5 inline mr-2" />
          Reading Challenges
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Content */}
      {activeTab === 'clubs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <div key={club.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {club.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {club.memberCount} members
                    </span>
                    {club.isPrivate && (
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        Private
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {club.description}
              </p>

              {club.currentBook && (
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img
                    src={club.currentBook.cover}
                    alt={club.currentBook.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      Currently Reading
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {club.currentBook.title}
                    </p>
                  </div>
                </div>
              )}

              {club.nextMeeting && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  Next meeting: {new Date(club.nextMeeting).toLocaleDateString()}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {club.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                {club.isMember ? (
                  <button className="flex-1 bg-green-100 text-green-800 py-2 px-4 rounded-lg text-sm font-medium">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    View Discussions
                  </button>
                ) : (
                  <button
                    onClick={() => joinClub(club.id)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Join Club
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredChallenges.map(challenge => (
            <div key={challenge.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {challenge.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {challenge.participants} participants
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Ends {new Date(challenge.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                {challenge.description}
              </p>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {challenge.currentProgress} / {challenge.targetBooks} books
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((challenge.currentProgress / challenge.targetBooks) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>

              {challenge.isParticipating ? (
                <button className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg text-sm font-medium">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  View Progress
                </button>
              ) : (
                <button
                  onClick={() => joinChallenge(challenge.id)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Join Challenge
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
