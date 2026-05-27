const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const battleMatchSchema = new mongoose.Schema(
  {
    battleRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BattleRequest',
      required: true,
      unique: true,
      index: true,
    },
    challengerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    challengedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
      enum: ['Python', 'Java', 'SQL', 'HTML/CSS'],
    },
    status: {
      type: String,
      enum: ['active', 'finished', 'cancelled'],
      default: 'active',
      index: true,
    },
    targetScore: {
      type: Number,
      default: 90,
    },
    challengerSubmission: {
      type: submissionSchema,
      default: null,
    },
    challengedSubmission: {
      type: submissionSchema,
      default: null,
    },
    winnerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

battleMatchSchema.index({ challengerUserId: 1, status: 1 });
battleMatchSchema.index({ challengedUserId: 1, status: 1 });

module.exports = mongoose.model('BattleMatch', battleMatchSchema);
