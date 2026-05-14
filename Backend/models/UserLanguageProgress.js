const mongoose = require('mongoose');

const userLanguageProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    completedLevels: {
      type: [Number],
      default: [],
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userLanguageProgressSchema.index({ userId: 1, language: 1 }, { unique: true });
// Índices adicionales para optimizar leaderboard y búsquedas
userLanguageProgressSchema.index({ totalPoints: -1, lastActivityAt: -1 }); // Leaderboard
userLanguageProgressSchema.index({ userId: 1, completionPercentage: -1 }); // Progreso por usuario
userLanguageProgressSchema.index({ lastActivityAt: -1 }); // Actividad reciente

module.exports = mongoose.model('UserLanguageProgress', userLanguageProgressSchema);
