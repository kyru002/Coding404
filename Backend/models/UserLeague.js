const mongoose = require('mongoose');

const userLeagueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    updatedAtLeague: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserLeague', userLeagueSchema);
