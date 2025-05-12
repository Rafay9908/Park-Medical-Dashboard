const mongoose = require('mongoose');

// const clinicianSchema = new mongoose.Schema({
//   clinicianName: { type: String, required: true },
//   qualifications: [String],
//   preferredClinics: [{ 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Clinic' 
//   }],
//   unavailableTimes: [{
//     day: String,
//     startTime: String,
//     endTime: String,
//     recurring: Boolean
//   }],
//   minHoursPerWeek: { type: Number, required: true },
//   maxHoursPerWeek: { type: Number, required: true },
//   maxTravelTime: Number, // in minutes
//   // ... keep other existing fields
// }, { timestamps: true });

const clinicianSchema = new mongoose.Schema({
  clinicianName: { type: String, required: true },
  preferredClinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
  preferredTimeSlots: [String], // ["Morning", "Afternoon", "Evening"]
  minHoursPerWeek: { type: Number, required: true },
  maxHoursPerWeek: { type: Number, required: true },
  shiftsPerDay: { type: Number, required: true },
  workingDays: { 
    type: [String], 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true 
  },
  homePostcode: String,
  nearestStation: String,
  maxTravelTime: Number, // in minutes
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
  travelMatrix: Map, // Cache of travel times to different clinics
  status: { type: String, enum: ['active', 'on_leave', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Clinician', clinicianSchema);