const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  question: {
    type: String,
    required: [true, 'El ejercicio debe tener una pregunta']
  },
  type: {
    type: String,
    required: true,
    enum: ['multiple-choice', 'fill-blank', 'code-completion', 'drag-drop', 'true-false', 'code-output']
  },
  // Para preguntas de opción múltiple
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  // Para ejercicios de código
  codeTemplate: {
    type: String,
    default: ''
  },
  correctAnswer: {
    type: String,
    default: ''
  },
  explanation: {
    type: String,
    default: ''
  },
  hints: [String],
  difficulty: {
    type: String,
    enum: ['Fácil', 'Medio', 'Difícil'],
    default: 'Fácil'
  },
  xpReward: {
    type: Number,
    default: 5
  },
  order: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exercise', exerciseSchema);
