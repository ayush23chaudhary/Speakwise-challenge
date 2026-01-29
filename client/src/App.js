import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChallengeLanding from './pages/ChallengeLanding';
import ChallengeRegistration from './components/challenge/ChallengeRegistration';
import RecordingStudio from './components/challenge/RecordingStudio';
import EvaluationSummary from './components/challenge/EvaluationSummary';
import Leaderboard from './components/challenge/Leaderboard';
import JudgeLogin from './pages/JudgeLogin';
import JudgeDashboard from './components/challenge/JudgeDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background-light">
        <Routes>
          <Route path="/" element={<ChallengeLanding />} />
          <Route path="/register" element={<ChallengeRegistration />} />
          <Route path="/record/:participantId" element={<RecordingStudio />} />
          <Route path="/evaluation/:participantId" element={<EvaluationSummary />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/judge/login" element={<JudgeLogin />} />
          <Route path="/judge/dashboard" element={<JudgeDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
