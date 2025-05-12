const mongoose = require('mongoose');

const rotaSchema = new mongoose.Schema({
  clinician: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Clinician', 
    required: true 
  },
  slot: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Slot', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'confirmed' 
  },
  travelTime: Number, // in minutes
  notes: String,
  metadata: mongoose.Schema.Types.Mixed
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Prevent double bookings
rotaSchema.index({ 
  clinician: 1, 
  slot: 1 
}, { unique: true });

// Add virtual population
rotaSchema.virtual('clinicianDetails', {
  ref: 'Clinician',
  localField: 'clinician',
  foreignField: '_id',
  justOne: true
});

rotaSchema.virtual('slotDetails', {
  ref: 'Slot',
  localField: 'slot',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Rota', rotaSchema);