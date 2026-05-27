const mongoose = require('mongoose');

const curriculumSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    levels: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Curriculum', curriculumSchema);
