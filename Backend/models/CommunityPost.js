const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1200,
    },
    url: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      default: 'Proyectos',
      trim: true,
      maxlength: 60,
    },
    tag: {
      type: String,
      default: '',
      trim: true,
      maxlength: 60,
    },
  },
  { _id: false }
);

const communityPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      default: 'Compartio',
      trim: true,
      maxlength: 40,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },
    achievement: {
      type: String,
      default: '',
      trim: true,
      maxlength: 240,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    shareCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    savedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    project: {
      type: projectSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ userId: 1, createdAt: -1 });
communityPostSchema.index({ savedBy: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
