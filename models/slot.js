const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotName: { type: String, required: true },
  clinic: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Clinic', 
    // required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
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