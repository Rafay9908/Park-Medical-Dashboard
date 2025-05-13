const mongoose = require('mongoose');

const rotaSchema = new mongoose.Schema({
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    // required: true,
  },
  clinician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinician',
    // required: true,
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    // required: true,
  },
  day: {
    type: String, // e.g. 'Monday' or specific date like '2025-05-12'
    // required: true,
  },
  sessionType: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening'],
    default: 'Morning',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Rota', rotaSchema);
