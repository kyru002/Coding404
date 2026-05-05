const mongoose = require('mongoose');

const generateCertificateId = () => {
  const randomSuffix = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `CERT-${Date.now()}-${randomSuffix}`;
};

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      default: generateCertificateId,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Certificate', certificateSchema);
