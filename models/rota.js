const mongoose = require('mongoose');

const operatingHoursSchema = new mongoose.Schema({
  day: { type: String, required: true },
  open: { type: Boolean, required: true },
  openingTime: { type: String },
  closingTime: { type: String }
});

const rotaSchema = new mongoose.Schema({
  rotaName: { type: String, required: true },
  address: { type: String, required: true },
  minimumSessionPerWeek: { type: Number, required: true },
  operatingHours: [operatingHoursSchema],
  
  // Optional fields
  ownerName: String,
  localStation: String,
  nearestBus: String,
  tflZone: String,
  checkInInstructions: String,
 wheelchairAccessible: Boolean,
  wifiDetails: String,
  walkingMinutesToStations: Number,
  u_id: String
}, { timestamps: true });

module.exports = mongoose.model('rota', rotaSchema);
