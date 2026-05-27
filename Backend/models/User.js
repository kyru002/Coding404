const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  programmerType: {
    type: String,
    required: true,
    trim: true,
  },
  learningPath: {
    preferredTrack: {
      type: String,
      default: '',
      trim: true,
    },
    recommendedCourse: {
      type: String,
      default: 'frontend',
      trim: true,
    },
    activeCourse: {
      type: String,
      default: 'frontend',
      trim: true,
    },
    startedCourses: {
      type: [String],
      default: ['frontend'],
    },
    startedLessons: {
      type: [String],
      default: ['frontend-html'],
    },
    completedLessons: {
      type: [String],
      default: [],
    },
  },
  github: {
    hasAccount: {
      type: Boolean,
      default: false,
    },
    username: {
      type: String,
      trim: true,
      default: '',
    },
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  avatarUrl: {
    type: String,
    default: '',
    trim: true,
  },
  bio: {
    type: String,
    default: '',
    trim: true,
    maxlength: 180,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true,
  },
  isBanned: {
    type: Boolean,
    default: false,
    index: true,
  },
  bannedReason: {
    type: String,
    default: '',
    trim: true,
    maxlength: 280,
  },
  bannedAt: {
    type: Date,
    default: null,
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});

module.exports = mongoose.model('User', userSchema);
