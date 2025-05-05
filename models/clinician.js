// models/Clinician.js

const mongoose = require('mongoose');

const ClinicianSchema = new mongoose.Schema({
  clinicianName: {
    type: String,
    required: true
  },
  preferredClinic: {
    type: String,
    required: true
  },
  preferredTimeSlot: {
    type: String,
    required: true
  },
  minHoursPerWeek: {
    type: Number,
    required: true
  },
  maxHoursPerWeek: {
    type: Number,
    required: true
  },
  shiftsPerDay: {
    type: Number,
    required: true
  },
  workingDay: {
    type: [String], // e.g. ['Monday', 'Wednesday']
    required: true
  },

  // Optional fields
  homePostcode: String,
  nearestStation: String,
  maxTravelTime: Number, // minutes
  startDate: Date,
  endDate: Date,
  contactEmail: String,
  contactPhone: String
}, { timestamps: true });

module.exports = mongoose.model('Clinician', ClinicianSchema);
