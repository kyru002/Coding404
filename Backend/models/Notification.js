const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'share'],
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 1,
      min: 1,
    },
    text: {
      type: String,
      default: '',
      trim: true,
      maxlength: 240,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastTriggeredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, type: 1, postId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
