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
  // sessionType: {
  //   type: String,
  //   enum: ['Morning', 'Afternoon', 'Evening'],
  //   default: 'Morning',
  // }
  sessionType: {
  type: String,
  enum: [
    'Morning', 'Afternoon', 'Evening', 'Night',
    'Full Morning', 'Morning Shift', 'Evening Shift',
    'Night Shift', 'Morning Slot2', 'Afternon Slot2',
  ],
}
}, {
  timestamps: true,
});

rotaSchema.index({ clinician: 1, slot: 1, day: 1, clinic: 1 }, { unique: true });


module.exports = mongoose.model('Rota', rotaSchema);
                                                          