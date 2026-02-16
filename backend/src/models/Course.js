const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El curso debe tener un título'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'El curso debe tener una descripción']
  },
  language: {
    type: String,
    required: true,
    enum: ['JavaScript', 'Python', 'Java', 'C++', 'HTML/CSS', 'React', 'Vue', 'Node.js', 'SQL', 'Git']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Principiante', 'Intermedio', 'Avanzado'],
    default: 'Principiante'
  },
  icon: {
    type: String,
    default: 'code.png'
  },
  color: {
    type: String,
    default: '#4CAF50'
  },
  order: {
    type: Number,
    default: 0
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  totalLessons: {
    type: Number,
    default: 0
  },
  estimatedTime: {
    type: String,
    default: '10 horas'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
