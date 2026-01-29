import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaTrophy, FaUsers, FaChartLine } from 'react-icons/fa';

const ChallengeLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-feature-violet">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            SpeakWise <span className="text-accent-teal">Challenge</span>
          </h1>
          <button
            onClick={() => navigate('/judge/login')}
            className="text-white hover:text-accent-teal transition-colors text-sm md:text-base"
          >
            Judge Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center animate-fadeIn">
          {/* Main Title */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Test Your Speaking Skills
            </h2>
            <p className="text-xl md:text-2xl text-gray-200 mb-2">
              AI-Powered Speech Evaluation
            </p>
            <p className="text-lg md:text-xl text-gray-300">
              Record your introduction (30s - 2min) and compete!
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/register')}
            className="bg-accent-teal hover:bg-accent-teal-dark text-white text-lg md:text-xl font-bold py-4 px-12 rounded-full shadow-2xl hover:shadow-accent-teal/50 transition-all duration-300 transform hover:scale-105 mb-12"
          >
            <FaMicrophone className="inline-block mr-3 text-2xl" />
            Enter Challenge
          </button>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <FeatureCard
              icon={<FaMicrophone className="text-4xl text-accent-teal" />}
              title="Flexible Recording"
              description="Record your introduction (30 seconds to 2 minutes)"
            />
            <FeatureCard
              icon={<FaChartLine className="text-4xl text-feature-violet" />}
              title="AI Evaluation"
              description="Get instant feedback on 7 key metrics"
            />
            <FeatureCard
              icon={<FaTrophy className="text-4xl text-yellow-400" />}
              title="Live Leaderboard"
              description="Compete and see your ranking"
            />
          </div>

          {/* Stats Section */}
          <div className="mt-16 bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <StatCard number="7" label="Metrics" />
              <StatCard number="2" label="Minutes Max" />
              <StatCard number="6-8s" label="Processing" />
            </div>
          </div>

          {/* View Leaderboard Link */}
          <button
            onClick={() => navigate('/leaderboard')}
            className="mt-8 text-white hover:text-accent-teal transition-colors flex items-center justify-center mx-auto text-lg"
          >
            <FaUsers className="mr-2" />
            View Current Leaderboard
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-300 text-sm">
        <p>&copy; 2026 SpeakWise Challenge. Powered by AI.</p>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
    <div className="mb-4 flex justify-center">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-200">{description}</p>
  </div>
);

// Stat Card Component
const StatCard = ({ number, label }) => (
  <div>
    <div className="text-3xl md:text-5xl font-bold text-accent-teal mb-2">{number}</div>
    <div className="text-sm md:text-base text-gray-200">{label}</div>
  </div>
);

export default ChallengeLanding;
