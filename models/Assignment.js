const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinician', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'], 
    default: 'scheduled' 
  },
  travelTime: Number, // in minutes
  notes: String
}, { timestamps: true });