const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  clinicName: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  coordinates: { // For distance calculations
    lat: Number,
    lng: Number
  },
  minSessionPerWeek: { type: Number, required: true },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  // ... keep other existing fields
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema)