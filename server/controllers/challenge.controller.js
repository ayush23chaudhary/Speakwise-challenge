const ChallengeParticipant = require('../models/ChallengeParticipant.model');
const { transcribeAudio } = require('../services/transcription.service');
const { evaluateSpeech } = require('../services/evaluation.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Registration
exports.register = async (req, res) => {
  try {
    const { name, mobile } = req.body;

    // Validation
    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Name and mobile number are required'
      });
    }

    // Check if mobile already exists
    const existingParticipant = await ChallengeParticipant.findOne({ mobile });
    if (existingParticipant) {
      return res.status(409).json({
        success: false,
        message: '❌ You have already submitted your response.'
      });
    }

    // Create new participant
    const participant = await ChallengeParticipant.create({ name, mobile });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      participantId: participant._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// Check if mobile exists
exports.checkMobile = async (req, res) => {
  try {
    const { mobile } = req.params;
    const exists = await ChallengeParticipant.exists({ mobile });
    
    res.json({
      exists: !!exists
    });
  } catch (error) {
    console.error('Check mobile error:', error);
    res.status(500).json({ error: 'Failed to check mobile number' });
  }
};

// Submit audio
exports.submitAudio = async (req, res) => {
  try {
    const { participantId } = req.body;
    const audioFile = req.file;

    if (!participantId || !audioFile) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID and audio file are required'
      });
    }

    // Find participant
    const participant = await ChallengeParticipant.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Save audio file path
    participant.audioFileUrl = `/uploads/${audioFile.filename}`;
    await participant.save();

    // Process audio in background (non-blocking)
    processAudioEvaluation(participantId, audioFile.path);

    res.json({
      success: true,
      message: 'Audio submitted successfully. Evaluation in progress...'
    });
  } catch (error) {
    console.error('Submit audio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit audio'
    });
  }
};

// Optimized background processing with parallel operations
async function processAudioEvaluation(participantId, audioFilePath) {
  try {
    const startTime = Date.now();
    console.log(`🎤 Starting evaluation for participant ${participantId}`);
    
    // Step 1: Transcribe audio (3-5 seconds)
    const transcribeStart = Date.now();
    const transcript = await transcribeAudio(audioFilePath);
    console.log(`✅ Transcription done in ${Date.now() - transcribeStart}ms`);
    
    // Step 2: Parallel - Evaluate speech + Save transcript
    const evalStart = Date.now();
    const [evaluation] = await Promise.all([
      evaluateSpeech(transcript),
      // Save transcript immediately while AI processes
      ChallengeParticipant.findByIdAndUpdate(participantId, {
        transcript,
        evaluationComplete: false
      })
    ]);
    console.log(`✅ AI Evaluation done in ${Date.now() - evalStart}ms`);
    
    // Step 3: Final update with scores
    await ChallengeParticipant.findByIdAndUpdate(participantId, {
      scores: evaluation.scores,
      feedback: evaluation.feedback,
      evaluationComplete: true,
      evaluatedAt: new Date()
    });

    console.log(`✅ Total processing time: ${(Date.now() - startTime) / 1000}s for participant ${participantId}`);
  } catch (error) {
    console.error(`❌ Evaluation failed for participant ${participantId}:`, error);
    
    // Mark as failed but save what we have
    await ChallengeParticipant.findByIdAndUpdate(participantId, {
      evaluationComplete: false,
      feedback: {
        detailed: 'Evaluation failed. Please contact support.',
        improvementTips: ['Try recording again with clearer audio'],
        strengths: [],
        areasToImprove: []
      }
    });
  }
}

// Get evaluation
exports.getEvaluation = async (req, res) => {
  try {
    const { participantId } = req.params;
    
    const participant = await ChallengeParticipant.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    res.json({
      success: true,
      evaluationComplete: participant.evaluationComplete,
      scores: participant.scores,
      feedback: participant.feedback,
      transcript: participant.transcript
    });
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation'
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const participants = await ChallengeParticipant.find({ 
      evaluationComplete: true 
    })
      .select('name scores.overall scores.fluency scores.confidence submittedAt')
      .sort({ 'scores.overall': -1, submittedAt: 1 })
      .skip(offset)
      .limit(limit);

    const total = await ChallengeParticipant.countDocuments({ 
      evaluationComplete: true 
    });

    res.json({
      success: true,
      participants,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

// Judge login
exports.judgeLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple authentication (can be enhanced with DB storage)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username, role: 'judge' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Judge login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Get all participants (Judge)
exports.getAllParticipants = async (req, res) => {
  try {
    const participants = await ChallengeParticipant.find()
      .sort({ 'scores.overall': -1, submittedAt: 1 });

    res.json({
      success: true,
      participants
    });
  } catch (error) {
    console.error('Get all participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participants'
    });
  }
};

// Get participant details (Judge)
exports.getParticipantDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const participant = await ChallengeParticipant.findById(id);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    res.json({
      success: true,
      participant
    });
  } catch (error) {
    console.error('Get participant details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participant details'
    });
  }
};

// Get statistics (Judge)
exports.getStats = async (req, res) => {
  try {
    const totalParticipants = await ChallengeParticipant.countDocuments();
    const evaluatedCount = await ChallengeParticipant.countDocuments({ 
      evaluationComplete: true 
    });

    const avgScoreResult = await ChallengeParticipant.aggregate([
      { $match: { evaluationComplete: true } },
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$scores.overall' },
          avgFluency: { $avg: '$scores.fluency' },
          avgPronunciation: { $avg: '$scores.pronunciation' },
          avgGrammar: { $avg: '$scores.grammar' },
          avgVocabulary: { $avg: '$scores.vocabulary' },
          avgConfidence: { $avg: '$scores.confidence' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalParticipants,
        evaluatedCount,
        pendingEvaluation: totalParticipants - evaluatedCount,
        averageScores: avgScoreResult[0] || {}
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Export data (Judge)
exports.exportData = async (req, res) => {
  try {
    const participants = await ChallengeParticipant.find()
      .sort({ 'scores.overall': -1 });

    // Convert to CSV format
    const csvHeader = 'Rank,Name,Mobile,Overall Score,Fluency,Pronunciation,Grammar,Vocabulary,Confidence,Submitted At\n';
    const csvRows = participants.map((p, index) => {
      return `${index + 1},"${p.name}","${p.mobile}",${p.scores.overall},${p.scores.fluency},${p.scores.pronunciation},${p.scores.grammar},${p.scores.vocabulary},${p.scores.confidence},"${p.submittedAt}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="speakwise-challenge-results.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
};
