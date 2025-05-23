const mongoose = require('mongoose');

const rotaSchema = new mongoose.Schema({
  sessionType: { type: String, required: true },
  day: { type: String, required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinician', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  // any other fields...
});

module.exports = mongoose.model('Rota', rotaSchema);
