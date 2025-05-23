// const Clinician = require('../models/clinician');
// const Clinic = require('../models/clinic');
// const Slot = require('../models/slot');


// function isSlotDuringLunch(slot) {
//   const start = new Date(slot.startDate);
//   const end = new Date(slot.endDate);
//   const lunchStart = new Date(start);
//   lunchStart.setUTCHours(12, 30, 0, 0);
//   const lunchEnd = new Date(start);
//   lunchEnd.setUTCHours(13, 30, 0, 0);
//   return start < lunchEnd && end > lunchStart;
// }

// function hasConflict(newSlot, assignedSlots) {
//   const newStart = new Date(newSlot.startDate);
//   const newEnd = new Date(newSlot.endDate);
//   for (const slot of assignedSlots) {
//     const existingStart = new Date(slot.startDate);
//     const existingEnd = new Date(slot.endDate);
//     const bufferBefore = new Date(existingStart.getTime() - 60 * 60 * 1000);
//     const bufferAfter = new Date(existingEnd.getTime() + 60 * 60 * 1000);
//     if (newStart < bufferAfter && newEnd > bufferBefore) {
//       return true;
//     }
//   }
//   return false;
// }

// exports.generateWeeklyRota = async (req, res) => {
//   try {
//     const clinicians = await Clinician.find({ status: 'active' }).lean();
//     const clinics = await Clinic.find({ isActive: true }).populate({
//       path: 'slotIds',
//       model: 'Slot'
//     }).lean();

//     const allSlots = [];
//     clinics.forEach(clinic => {
//       clinic.slotIds.forEach(slot => {
//         if (!isSlotDuringLunch(slot)) {
//           allSlots.push({ ...slot, clinicId: clinic._id });
//         }
//       });
//     });

//     const assignments = [];
//     let skipped = [];

//     for (const slot of allSlots) {
//       let assigned = false;

//       for (const clinician of clinicians) {
//         const slotStart = new Date(slot.startDate);
//         const slotEnd = new Date(slot.endDate);
//         const day = slotStart.toLocaleDateString('en-US', { weekday: 'long' });

//         const dateValid = slotStart >= new Date(clinician.startDate) &&
//                           slotEnd <= new Date(clinician.endDate);

//         const isAvailable = clinician.workingDays.includes(day);

//         if (isAvailable && dateValid) {
//           const currentAssignments = assignments.filter(a => a.clinicianId === String(clinician._id));
//           const assignedSlots = currentAssignments.map(a => a.slot);

//           if (!hasConflict(slot, assignedSlots)) {
//             assignments.push({
//               slotId: slot._id,
//               clinicianId: clinician._id,
//               clinicId: slot.clinicId,
//               slot
//             });
//             assigned = true;
//             break;
//           }
//         }
//       }

//       if (!assigned) {
//         skipped.push(slot._id);
//       }
//     }

//     for (const assignment of assignments) {
//       // Update the Slot
//       await Slot.findByIdAndUpdate(assignment.slotId, {
//         assignedClinician: assignment.clinicianId,
//         status: 'assigned',
//         clinic: assignment.clinicId
//       });

//       // Create/Upsert Rota
//       const day = new Date(assignment.slot.startDate).toLocaleDateString('en-US', { weekday: 'long' });

//       await Rota.updateOne(
//         {
//           clinician: assignment.clinicianId,
//           slot: assignment.slotId,
//           clinic: assignment.clinicId,
//           day: day
//         },
//         {
//           $set: {
//             sessionType: 'Morning' // optional: customize based on time
//           }
//         },
//         { upsert: true }
//       );
//     }

//     res.json({
//       message: 'Weekly rota generated successfully.',
//       totalAssigned: assignments.length,
//       assignments: assignments.map(a => ({
//         slotId: a.slotId,
//         clinicianId: a.clinicianId,
//         clinicId: a.clinicId
//       }))
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getAllRota = async (req, res) => {
//   try {
//     // Option 1: Get from Rota collection (which is what you're creating)
//     const rotaEntries = await Rota.find()
//       .populate('clinician', 'clinicianName contactEmail')
//       .populate('clinic', 'clinicName address')
//       .populate('slot', 'slotName startDate endDate')
//       .lean();
    
//     // Option 2: Or combine both collections
//     const slots = await Slot.find({ assignedClinician: { $ne: null } })
//       .populate('clinic', 'clinicName address')
//       .populate('assignedClinician', 'clinicianName contactEmail')
//       .lean();
    
//     const rotaDocs = await Rota.find().lean();
    
//     const combined = slots.map(slot => {
//       const rotaEntry = rotaDocs.find(r => r.slot.equals(slot._id));
//       return {
//         ...slot,
//         rotaDetails: rotaEntry
//       };
//     });
    
//     res.status(200).json({ total: combined.length, rota: combined });
//   } catch (error) {
//     console.error('Error fetching rota:', error);
//     res.status(500).json({ message: error.message });
//   }
// };





// const express = require('express');
// const router = express.Router();
// const rotaController = require('../controllers/rotaController');

// // POST /rota/generate-weekly
// router.post('/generate-weekly', rotaController.generateWeeklyRota);
// router.get('/', rotaController.getAllRota);

// module.exports = router;


const Rota = require('../models/Rota');
const Slot = require('../models/Slot');
const Clinic = require('../models/Clinic');
const Clinician = require('../models/Clinician');

exports.generateWeeklyRota = async (req, res) => {
  try {
    const slots = await Slot.find();
    const clinics = await Clinic.find();
    const clinicians = await Clinician.find();

    const assignments = [];
    const skippedSlots = [];

    for (const slot of slots) {
      for (const clinic of clinics) {
        // Example logic for clinician availability - you can customize this
        const availableClinician = clinicians.find(() => true); 

        if (availableClinician) {
          const assignment = new Rota({
            slot: slot._id,
            clinician: availableClinician._id,
            clinic: clinic._id,
            day: slot.day || 'Monday',        // Adjust this as per your slot or your logic
            sessionType: slot.sessionType || 'Morning',  // Adjust as needed
          });

          await assignment.save();

          assignments.push({
            slot: slot._id,
            clinician: availableClinician._id,
            clinic: clinic._id,
            day: slot.day || 'Monday',
            sessionType: slot.sessionType || 'Morning',
          });
        } else {
          skippedSlots.push({
            slot: slot._id,
            clinic: clinic._id,
          });
        }
      }
    }

    res.status(200).json({
      message: 'Weekly rota generated successfully.',
      totalAssigned: assignments.length,
      assignments,
      skippedSlots,
    });
  } catch (error) {
    console.error('Error generating weekly rota:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllRota = async (req, res) => {
  try {
    const rotas = await Rota.find()
      .populate('slot')
      .populate('clinic')
      .populate('clinician');
    res.status(200).json(rotas);
  } catch (error) {
    console.error('Error fetching rota:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
