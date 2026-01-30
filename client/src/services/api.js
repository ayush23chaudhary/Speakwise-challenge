import axios from 'axios';

// Determine API base URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/api'
  : 'https://speakwise-challenge-backend.onrender.com/api';

console.log('🔗 API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('judgeToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Challenge API endpoints
export const challengeAPI = {
  // Register participant
  register: (data) => api.post('/challenge/register', data),
  
  // Check if mobile exists
  checkMobile: (mobile) => api.get(`/challenge/check-mobile/${mobile}`),
  
  // Submit audio recording
  submitAudio: (participantId, audioBlob) => {
    const formData = new FormData();
    formData.append('participantId', participantId);
    formData.append('audio', audioBlob, 'recording.webm');
    
    return api.post('/challenge/submit-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get evaluation results
  getEvaluation: (participantId) => api.get(`/challenge/evaluation/${participantId}`),
  
  // Get leaderboard
  getLeaderboard: (limit = 50, offset = 0) => 
    api.get(`/challenge/leaderboard?limit=${limit}&offset=${offset}`),
};

// Judge API endpoints
export const judgeAPI = {
  // Login
  login: (credentials) => api.post('/challenge/admin/login', credentials),
  
  // Get all participants
  getAllParticipants: () => api.get('/challenge/admin/participants'),
  
  // Get participant details
  getParticipantDetails: (id) => api.get(`/challenge/admin/participant/${id}`),
  
  // Get statistics
  getStats: () => api.get('/challenge/admin/stats'),
  
  // Export data
  exportData: () => api.get('/challenge/admin/export', {
    responseType: 'blob',
  }),
};

export default api;
