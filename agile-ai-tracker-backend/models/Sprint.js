const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    goal: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed'],
      default: 'planned',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sprint', sprintSchema);