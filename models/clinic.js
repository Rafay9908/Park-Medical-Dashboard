const mongoose = require('mongoose');

// const clinicSchema = new mongoose.Schema({
//   clinicName: { type: String, required: true },
//   address: { type: String, required: true },
//   minSessionPerWeek: { type: Number, required: true },
//   ownerName: { type: String },
//   localStation: { type: String },
//   nearestBus: { type: String },
//   tflZone: { type: String },
//   checkInInstructions: { type: String },
//   wheelchairAccessible: { type: Boolean, default: false },
//   wifiDetails: { type: String },
//   walkingMinutesToStations: { type: Number },
//   operatingHours: [{
//     day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
//     open: { type: Boolean, default: true },
//     openingTime: String, // "HH:MM" format
//     closingTime: String  // "HH:MM" format
//   }],
//   coordinates: {
//     lat: Number,
//     lng: Number
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Clinic', clinicSchema)


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
  // operatingHours: [{
  //   day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  //   open: { type: Boolean, default: true },
  //   openingTime: String,
  //   closingTime: String
  // }],
  operatingHours: [{
  day: String, // e.g. "Monday"
  isOpen: Boolean,
  openingTime: String,
  closingTime: String
}],
isActive: { type: Boolean, default: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  slotIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Slot' }] //  Added this line
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
