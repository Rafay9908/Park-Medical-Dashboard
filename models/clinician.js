const mongoose = require('mongoose');


const clinicianSchema = new mongoose.Schema({
  clinicianName: { type: String, required: true },
  preferredClinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
  preferredTimeSlots: [String],
  minHoursPerWeek: { type: Number, required: true },
  maxHoursPerWeek: { type: Number, required: true },
  shiftsPerDay: { type: Number, required: true },
  workingDays: { 
    type: [String], 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true 
  },
  availableSlots: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Slot' 
  }],
  homePostcode: String,
  nearestStation: String,
  maxTravelTime: Number,
  startDate: Date,
  endDate: Date,
  contactEmail: String,
  contactPhone: String,
  qualifications: [String],
  unavailableTimes: [{
    start: Date,
    end: Date,
    reason: String
  }],
  travelMatrix: Map,
  status: { type: String, enum: ['active', 'on_leave', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.Clinician || mongoose.model('Clinician', clinicianSchema);
