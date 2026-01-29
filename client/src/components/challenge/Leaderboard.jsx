import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaSync, FaHome } from 'react-icons/fa';
import { challengeAPI } from '../../services/api';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await challengeAPI.getLeaderboard(50, 0);
      
      if (response.data.success) {
        setParticipants(response.data.participants);
      }
    } catch (err) {
      console.error('Fetch leaderboard error:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getRankDisplay = (index) => {
    if (index === 0) return <span className="text-3xl">🥇</span>;
    if (index === 1) return <span className="text-3xl">🥈</span>;
    if (index === 2) return <span className="text-3xl">🥉</span>;
    return <span className="font-bold text-text-secondary">{index + 1}</span>;
  };

  const getRankClass = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400';
    if (index === 1) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-400';
    if (index === 2) return 'bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-400';
    return 'bg-white border-l-4 border-transparent';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-dark to-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-white hover:text-accent-teal transition-colors"
            >
              <FaHome className="mr-2" />
              <span className="hidden md:inline">Home</span>
            </button>
            
            <div className="text-center flex-1">
              <h1 className="text-2xl md:text-4xl font-bold flex items-center justify-center">
                <FaTrophy className="mr-3 text-yellow-400" />
                Leaderboard
              </h1>
            </div>

            <button
              onClick={() => fetchLeaderboard(true)}
              disabled={refreshing}
              className="flex items-center text-white hover:text-accent-teal transition-colors"
            >
              <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Banner */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center animate-fadeIn">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-primary">{participants.length}</div>
              <div className="text-sm text-text-secondary">Participants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-teal">
                {participants.length > 0 ? Math.round(participants.reduce((acc, p) => acc + p.scores.overall, 0) / participants.length) : 0}
              </div>
              <div className="text-sm text-text-secondary">Avg Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-feature-violet">
                {participants.length > 0 ? participants[0].scores.overall : 0}
              </div>
              <div className="text-sm text-text-secondary">Top Score</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Leaderboard Table */}
        {participants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-text-secondary mb-2">No Participants Yet</h3>
            <p className="text-text-secondary mb-6">Be the first to participate in the challenge!</p>
            <button onClick={() => navigate('/register')} className="btn-primary">
              Join Challenge
            </button>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Rank</th>
                      <th className="px-6 py-4 text-left font-semibold">Name</th>
                      <th className="px-6 py-4 text-center font-semibold">Overall Score</th>
                      <th className="px-6 py-4 text-center font-semibold">Fluency</th>
                      <th className="px-6 py-4 text-center font-semibold">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr 
                        key={participant._id}
                        className={`${getRankClass(index)} hover:shadow-md transition-all duration-200`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-12">
                            {getRankDisplay(index)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-primary">{participant.name}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(participant.scores.overall)}`}>
                            {participant.scores.overall}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-lg font-semibold text-text-secondary">
                            {participant.scores.fluency}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-lg font-semibold text-text-secondary">
                            {participant.scores.confidence}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4 animate-fadeIn">
              {participants.map((participant, index) => (
                <div 
                  key={participant._id}
                  className={`${getRankClass(index)} rounded-xl shadow-md p-4`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 flex items-center justify-center">
                        {getRankDisplay(index)}
                      </div>
                      <div>
                        <div className="font-bold text-primary">{participant.name}</div>
                        <div className="text-xs text-text-secondary">Participant</div>
                      </div>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(participant.scores.overall)}`}>
                      {participant.scores.overall}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white/50 rounded p-2">
                      <div className="text-xs text-text-secondary">Fluency</div>
                      <div className="font-semibold text-primary">{participant.scores.fluency}</div>
                    </div>
                    <div className="bg-white/50 rounded p-2">
                      <div className="text-xs text-text-secondary">Confidence</div>
                      <div className="font-semibold text-primary">{participant.scores.confidence}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-text-secondary mb-4">Want to see your name on the leaderboard?</p>
          <button onClick={() => navigate('/register')} className="btn-primary">
            Join Challenge Now
          </button>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
