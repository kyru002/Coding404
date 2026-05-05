const mongoose = require('mongoose');

const lessonEnSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseEn',
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
    lessonData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'lessons_en',
  }
);

lessonEnSchema.index({ courseId: 1, orderInCourse: 1 }, { unique: true });

module.exports = mongoose.model('LessonEn', lessonEnSchema);
