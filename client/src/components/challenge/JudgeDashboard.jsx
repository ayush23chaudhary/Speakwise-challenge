import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaChartBar, FaSignOutAlt, FaDownload, FaTimes } from 'react-icons/fa';
import { judgeAPI } from '../../services/api';

const JudgeDashboard = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [participantsRes, statsRes] = await Promise.all([
        judgeAPI.getAllParticipants(),
        judgeAPI.getStats()
      ]);

      if (participantsRes.data.success) {
        setParticipants(participantsRes.data.participants);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('judgeToken');
        navigate('/judge/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('judgeToken');
    if (!token) {
      navigate('/judge/login');
      return;
    }

    fetchData();
  }, [navigate, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('judgeToken');
    navigate('/judge/login');
  };

  const handleExport = async () => {
    try {
      const response = await judgeAPI.exportData();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'speakwise-challenge-results.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data');
    }
  };

  const getSortedAndFilteredParticipants = () => {
    let filtered = [...participants];

    // Filter
    if (filterStatus === 'evaluated') {
      filtered = filtered.filter(p => p.evaluationComplete);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(p => !p.evaluationComplete);
    }

    // Sort
    if (sortBy === 'score') {
      filtered.sort((a, b) => b.scores.overall - a.scores.overall);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredParticipants = getSortedAndFilteredParticipants();

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">Judge Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center text-white hover:text-red-400 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<FaUsers className="text-4xl text-primary" />}
              value={stats.totalParticipants}
              label="Total Participants"
              color="bg-blue-50"
            />
            <StatCard
              icon={<FaChartBar className="text-4xl text-green-600" />}
              value={stats.evaluatedCount}
              label="Evaluated"
              color="bg-green-50"
            />
            <StatCard
              icon={<FaChartBar className="text-4xl text-orange-600" />}
              value={stats.pendingEvaluation}
              label="Pending"
              color="bg-orange-50"
            />
            <StatCard
              icon={<FaChartBar className="text-4xl text-accent-teal" />}
              value={Math.round(stats.averageScores?.avgOverall || 0)}
              label="Avg Score"
              color="bg-teal-50"
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-semibold text-text-primary">Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-accent-teal focus:outline-none"
              >
                <option value="all">All</option>
                <option value="evaluated">Evaluated</option>
                <option value="pending">Pending</option>
              </select>

              <label className="text-sm font-semibold text-text-primary">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-accent-teal focus:outline-none"
              >
                <option value="score">Score</option>
                <option value="name">Name</option>
                <option value="date">Date</option>
              </select>
            </div>

            {/* Export Button */}
            <button onClick={handleExport} className="btn-primary">
              <FaDownload className="inline mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Mobile</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Date</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => (
                  <tr key={participant._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{participant.name}</td>
                    <td className="px-4 py-3">{participant.maskedMobile}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xl font-bold text-accent-teal">
                        {participant.evaluationComplete ? participant.scores.overall : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {participant.evaluationComplete ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          Evaluated
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-text-secondary">
                      {new Date(participant.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedParticipant(participant)}
                        className="btn-secondary text-sm py-2 px-4"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Participant Detail Modal */}
      {selectedParticipant && (
        <ParticipantModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label, color }) => (
  <div className={`${color} rounded-xl p-6 shadow-md`}>
    <div className="flex items-center justify-between mb-3">
      {icon}
      <div className="text-3xl font-bold text-primary">{value}</div>
    </div>
    <div className="text-sm font-semibold text-text-secondary">{label}</div>
  </div>
);

// Participant Detail Modal
const ParticipantModal = ({ participant, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-primary text-white p-6 flex items-center justify-between sticky top-0">
          <h2 className="text-2xl font-bold">Participant Details</h2>
          <button onClick={onClose} className="text-white hover:text-red-400">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-primary mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-secondary">Name</label>
                <div className="font-semibold">{participant.name}</div>
              </div>
              <div>
                <label className="text-sm text-text-secondary">Mobile</label>
                <div className="font-semibold">{participant.mobile}</div>
              </div>
              <div>
                <label className="text-sm text-text-secondary">Submitted At</label>
                <div className="font-semibold">
                  {new Date(participant.submittedAt).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary">Status</label>
                <div>
                  {participant.evaluationComplete ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Evaluated
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Player */}
          {participant.audioFileUrl && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-primary mb-3">Audio Recording</h3>
              <audio controls className="w-full">
                <source src={`http://localhost:5000${participant.audioFileUrl}`} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Scores */}
          {participant.evaluationComplete && (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-primary mb-3">Scores</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ScoreDisplay label="Overall" score={participant.scores.overall} />
                  <ScoreDisplay label="Fluency" score={participant.scores.fluency} />
                  <ScoreDisplay label="Pronunciation" score={participant.scores.pronunciation} />
                  <ScoreDisplay label="Grammar" score={participant.scores.grammar} />
                  <ScoreDisplay label="Vocabulary" score={participant.scores.vocabulary} />
                  <ScoreDisplay label="Confidence" score={participant.scores.confidence} />
                  <ScoreDisplay label="Structure" score={participant.scores.structure} />
                  <ScoreDisplay label="Filler Words" score={participant.scores.fillerWords} />
                </div>
              </div>

              {/* Transcript */}
              {participant.transcript && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-primary mb-3">Transcript</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-text-secondary">{participant.transcript}</p>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {participant.feedback && (
                <div>
                  <h3 className="text-xl font-bold text-primary mb-3">AI Feedback</h3>
                  <div className="space-y-4">
                    {participant.feedback.detailed && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Overall</h4>
                        <p className="text-blue-800">{participant.feedback.detailed}</p>
                      </div>
                    )}
                    
                    {participant.feedback.strengths && participant.feedback.strengths.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Strengths</h4>
                        <ul className="list-disc list-inside text-green-800 space-y-1">
                          {participant.feedback.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {participant.feedback.areasToImprove && participant.feedback.areasToImprove.length > 0 && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Areas to Improve</h4>
                        <ul className="list-disc list-inside text-orange-800 space-y-1">
                          {participant.feedback.areasToImprove.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ScoreDisplay = ({ label, score }) => (
  <div className="bg-gray-50 p-4 rounded-lg text-center">
    <div className="text-2xl font-bold text-accent-teal">{score}</div>
    <div className="text-sm text-text-secondary">{label}</div>
  </div>
);

export default JudgeDashboard;
