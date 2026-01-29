import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTrophy, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { challengeAPI } from '../../services/api';
import ProgressIndicator from '../common/ProgressIndicator';
import ScoreCard from '../common/ScoreCard';

const EvaluationSummary = () => {
  const { participantId } = useParams();
  const navigate = useNavigate();
  
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvaluation();
    
    // Poll for evaluation if not complete
    const interval = setInterval(() => {
      if (!evaluation?.evaluationComplete) {
        fetchEvaluation();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [participantId, evaluation?.evaluationComplete, fetchEvaluation]);

  const fetchEvaluation = async () => {
    try {
      const response = await challengeAPI.getEvaluation(participantId);
      
      if (response.data.success) {
        setEvaluation(response.data);
        
        if (response.data.evaluationComplete) {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Fetch evaluation error:', err);
      setError('Failed to fetch evaluation results.');
      setLoading(false);
    }
  };

  if (loading || !evaluation?.evaluationComplete) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-2xl shadow-lg p-10 text-center animate-fadeIn">
          <div className="spinner mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-primary mb-3">Analyzing Your Speech...</h2>
          <p className="text-text-secondary mb-6">
            Our AI is evaluating your performance. This may take 10-15 seconds.
          </p>
          <div className="space-y-2 text-left text-sm text-text-secondary">
            <p>✓ Transcribing audio... (3-5s)</p>
            <p>✓ Analyzing fluency & pronunciation...</p>
            <p>✓ Evaluating grammar & vocabulary...</p>
            <p className="animate-pulse">⏳ Calculating final scores... (6-8s total)</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-primary mb-4">{error}</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const { scores, feedback } = evaluation;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:text-accent-teal transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
        <ProgressIndicator currentStep={3} />
      </div>

      {/* Evaluation Summary */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-accent-teal text-white rounded-2xl p-8 mb-8 text-center animate-fadeIn shadow-xl">
          <FaCheckCircle className="text-6xl mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Evaluation Complete! 🎉
          </h1>
          <p className="text-xl">
            Thank you for participating in the SpeakWise Challenge
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center animate-fadeIn">
          <h2 className="text-2xl font-bold text-primary mb-4">Your Overall Score</h2>
          <div className="text-7xl font-extrabold bg-gradient-to-r from-feature-violet to-accent-teal bg-clip-text text-transparent mb-2">
            {scores.overall}
          </div>
          <p className="text-text-secondary text-lg">out of 100</p>
        </div>

        {/* Detailed Scores */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-8 animate-fadeIn">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">Detailed Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard label="Fluency" score={scores.fluency} icon="🗣️" />
            <ScoreCard label="Pronunciation" score={scores.pronunciation} icon="📢" />
            <ScoreCard label="Grammar" score={scores.grammar} icon="📝" />
            <ScoreCard label="Vocabulary" score={scores.vocabulary} icon="📚" />
            <ScoreCard label="Confidence" score={scores.confidence} icon="💪" />
            <ScoreCard label="Structure" score={scores.structure} icon="🏗️" />
            <ScoreCard label="Filler Words" score={scores.fillerWords} icon="🤐" />
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-8 animate-fadeIn">
          <h2 className="text-2xl font-bold text-primary mb-6">AI Feedback</h2>
          
          {/* Detailed Feedback */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-3">Overall Assessment</h3>
            <p className="text-text-secondary leading-relaxed">
              {feedback.detailed}
            </p>
          </div>

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-600 mb-3">✨ Your Strengths</h3>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-text-secondary">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas to Improve */}
          {feedback.areasToImprove && feedback.areasToImprove.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-orange-600 mb-3">📈 Areas to Improve</h3>
              <ul className="space-y-2">
                {feedback.areasToImprove.map((area, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">→</span>
                    <span className="text-text-secondary">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvement Tips */}
          {feedback.improvementTips && feedback.improvementTips.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-3">💡 Tips for Improvement</h3>
              <ul className="space-y-2">
                {feedback.improvementTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-text-secondary">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/leaderboard')}
            className="btn-primary text-lg inline-flex items-center"
          >
            <FaTrophy className="mr-2" />
            View Leaderboard
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default EvaluationSummary;
