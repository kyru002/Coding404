const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    orderInCourse: {
      type: Number,
      required: true,
      min: 1,
    },
    theoryContent: {
      type: String,
      default: '',
      trim: true,
    },
    titleI18n: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    theoryContentI18n: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lessonData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lessonDataI18n: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({ courseId: 1, orderInCourse: 1 }, { unique: true });
// Índice para búsqueda rápida de todas las lecciones de un curso
lessonSchema.index({ courseId: 1, orderInCourse: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
