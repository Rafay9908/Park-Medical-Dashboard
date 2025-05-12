const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clinic: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Clinic', 
    required: true 
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  requiredQualifications: [String],
  status: { 
    type: String, 
    enum: ['open', 'assigned', 'completed', 'cancelled'], 
    default: 'open' 
  },
  assignedClinician: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Clinician' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);