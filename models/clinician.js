const mongoose = require('mongoose');

const clinicianSchema = new mongoose.Schema({
  clinicianName: { type: String, required: true },
  qualifications: [String],
  preferredClinics: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Clinic' 
  }],
  unavailableTimes: [{
    day: String,
    startTime: String,
    endTime: String,
    recurring: Boolean
  }],
  minHoursPerWeek: { type: Number, required: true },
  maxHoursPerWeek: { type: Number, required: true },
  maxTravelTime: Number, // in minutes
  // ... keep other existing fields
}, { timestamps: true });

module.exports = mongoose.model('Clinician', clinicianSchema);