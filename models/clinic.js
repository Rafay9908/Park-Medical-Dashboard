const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  clinicName: { type: String, required: true },
  address: { type: String, required: true },
  minSessionPerWeek: { type: Number, required: true },
  ownerName: { type: String },
  localStation: { type: String },
  nearestBus: { type: String },
  tflZone: { type: String },
  checkInInstructions: { type: String },
  wheelchairAccessible: { type: Boolean, default: false },
  wifiDetails: { type: String },
  walkingMinutesToStations: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
