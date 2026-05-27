const mongoose = require('mongoose');

const courseEnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
    },
    createdAtCourse: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'courses_en',
  }
);

module.exports = mongoose.model('CourseEn', courseEnSchema);
