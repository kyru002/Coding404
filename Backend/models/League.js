const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    minPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    maxPoints: {
      type: Number,
      default: null,
    },
    order: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('League', leagueSchema);
