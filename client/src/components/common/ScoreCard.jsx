import React from 'react';

const ScoreCard = ({ label, score, icon }) => {
  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 75) return 'from-blue-500 to-blue-600';
    if (score >= 60) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-100 hover:border-accent-teal transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{icon}</span>
          <h3 className="font-bold text-primary text-lg">{label}</h3>
        </div>
        <div className={`text-4xl font-extrabold ${getScoreColor()}`}>
          {score}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Score Description */}
      <div className="mt-2 text-right text-sm text-text-secondary">
        {score >= 90 && 'Excellent'}
        {score >= 75 && score < 90 && 'Good'}
        {score >= 60 && score < 75 && 'Average'}
        {score < 60 && 'Needs Improvement'}
      </div>
    </div>
  );
};

export default ScoreCard;
