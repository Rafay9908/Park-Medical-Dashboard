const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotName: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);
