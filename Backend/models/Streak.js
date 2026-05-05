const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    consecutiveActiveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    maxStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    activityDates: {
      type: [String],
      default: [],
    },
    recoverableStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRestoreAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Streak', streakSchema);
