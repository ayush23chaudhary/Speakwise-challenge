const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challenge.controller');
const { upload } = require('../middleware/upload');
const { judgeAuth } = require('../middleware/judgeAuth');
const { rateLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', rateLimiter, challengeController.register);
router.get('/check-mobile/:mobile', challengeController.checkMobile);
router.post('/submit-audio', upload.single('audio'), challengeController.submitAudio);
router.get('/evaluation/:participantId', challengeController.getEvaluation);
router.get('/leaderboard', challengeController.getLeaderboard);

// Protected judge routes
router.post('/admin/login', challengeController.judgeLogin);
router.get('/admin/participants', judgeAuth, challengeController.getAllParticipants);
router.get('/admin/participant/:id', judgeAuth, challengeController.getParticipantDetails);
router.get('/admin/stats', judgeAuth, challengeController.getStats);
router.get('/admin/export', judgeAuth, challengeController.exportData);

module.exports = router;
