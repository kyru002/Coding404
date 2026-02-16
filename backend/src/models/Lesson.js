const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'La lección debe tener un título'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['lesson', 'practice', 'quiz', 'challenge'],
    default: 'lesson'
  },
  content: {
    theory: {
      type: String,
      default: ''
    },
    examples: [{
      code: String,
      explanation: String,
      language: String
    }],
    keyPoints: [String]
  },
  exercises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  }],
  xpReward: {
    type: Number,
    default: 10
  },
  difficulty: {
    type: String,
    enum: ['Fácil', 'Medio', 'Difícil'],
    default: 'Fácil'
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
