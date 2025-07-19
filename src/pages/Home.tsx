 
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Headphones, PenTool, Sparkles, TrendingUp, Users } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "AI Story Generator",
      description: "Create interactive stories with AI assistance and choose your own adventure",
      link: "/story-generator"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Personal Library",
      description: "Upload PDFs, organize your collection, and read with advanced features",
      link: "/library"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Text-to-Speech",
      description: "Convert any text to natural-sounding audio with male and female voices",
      link: "/library"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Smart Recommendations",
      description: "Get personalized book suggestions based on your reading preferences",
      link: "/discover"
    }
  ];

  const stats = [
    { icon: <BookOpen className="w-6 h-6" />, label: "Books Available", value: "50K+" },
    { icon: <Users className="w-6 h-6" />, label: "Active Readers", value: "12K+" },
    { icon: <TrendingUp className="w-6 h-6" />, label: "Stories Generated", value: "25K+" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to <span className="text-amber-600 dark:text-amber-400">StoryVerse</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Your ultimate destination for reading, listening, and creating stories. 
          Discover new worlds, generate interactive tales, and build your perfect reading experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/story-generator"
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Start Creating
          </Link>
          <Link
            to="/discover"
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Explore Books
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-amber-600 dark:text-amber-400 flex justify-center mb-3">
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Everything You Need for the Perfect Reading Experience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="text-amber-600 dark:text-amber-400 flex justify-center mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="mb-6 opacity-90">
          Join thousands of readers and writers who are already creating amazing stories
        </p>
        <Link
          to="/profile"
          className="bg-white text-amber-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
        >
          Create Your Profile
        </Link>
      </div>
    </div>
  );
};

export default Home;