const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
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
    titleI18n: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    descriptionI18n: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    createdAtCourse: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ language: 1, createdAtCourse: -1 }); // Búsqueda por lenguaje ordenada por fecha

module.exports = mongoose.model('Course', courseSchema);
