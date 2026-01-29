const mongoose = require('mongoose');

const challengeParticipantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v); // Indian mobile number format
      },
      message: 'Please enter a valid 10-digit mobile number'
    }
  },
  audioFileUrl: {
    type: String,
    default: null
  },
  transcript: {
    type: String,
    default: null
  },
  scores: {
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    fluency: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    pronunciation: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    grammar: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    vocabulary: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    structure: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    fillerWords: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  feedback: {
    detailed: {
      type: String,
      default: ''
    },
    improvementTips: {
      type: [String],
      default: []
    },
    strengths: {
      type: [String],
      default: []
    },
    areasToImprove: {
      type: [String],
      default: []
    }
  },
  evaluationComplete: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  evaluatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
challengeParticipantSchema.index({ mobile: 1 });
challengeParticipantSchema.index({ 'scores.overall': -1, submittedAt: 1 });

// Virtual for display mobile (masked)
challengeParticipantSchema.virtual('maskedMobile').get(function() {
  if (this.mobile && this.mobile.length === 10) {
    return `+91******${this.mobile.slice(-4)}`;
  }
  return this.mobile;
});

// Enable virtuals in JSON
challengeParticipantSchema.set('toJSON', { virtuals: true });
challengeParticipantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ChallengeParticipant', challengeParticipantSchema);
