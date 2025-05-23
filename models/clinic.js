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
  walkingMinutesToStations: { type: Number },
  operatingHours: [{
    day: String,
    isOpen: Boolean,
    openingTime: String,
    closingTime: String
  }],
  isActive: { type: Boolean, default: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  slotIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Slot' }]
}, { timestamps: true });

module.exports = mongoose.models.Clinic || mongoose.model('Clinic', clinicSchema);
