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





const Clinician = require('../models/clinician');
const Clinic = require('../models/clinic');
const Slot = require('../models/slot');
const Rota = require('../models/rota');


function isSlotDuringLunch(slot) {
  const start = new Date(slot.startDate);
  const end = new Date(slot.endDate);
  const lunchStart = new Date(start);
  lunchStart.setUTCHours(12, 30, 0, 0);
  const lunchEnd = new Date(start);
  lunchEnd.setUTCHours(13, 30, 0, 0);
  return start < lunchEnd && end > lunchStart;
}

function hasConflict(newSlot, assignedSlots) {
  const newStart = new Date(newSlot.startDate);
  const newEnd = new Date(newSlot.endDate);
  for (const slot of assignedSlots) {
    const existingStart = new Date(slot.startDate);
    const existingEnd = new Date(slot.endDate);
    const bufferBefore = new Date(existingStart.getTime() - 60 * 60 * 1000);
    const bufferAfter = new Date(existingEnd.getTime() + 60 * 60 * 1000);
    if (newStart < bufferAfter && newEnd > bufferBefore) {
      return true;
    }
  }
  return false;
}

exports.generateWeeklyRota = async (req, res) => {
  try {
    const clinicians = await Clinician.find({ status: 'active' }).lean();
    const clinics = await Clinic.find({ isActive: true }).populate({
  path: 'slotIds',
  model: 'Slot'
}).lean();

clinics.forEach(clinic => {
  console.log({
    clinicName: clinic.clinicName,
    slotCount: clinic.slotIds.length
  });
});


    const allSlots = [];
    clinics.forEach(clinic => {
      clinic.slotIds.forEach(slot => {
        if (!isSlotDuringLunch(slot)) {
          allSlots.push({ ...slot, clinicId: clinic._id });
        }
      });
    });

    console.log('Total Valid Slots:', allSlots.length);

    const assignments = [];
    let skipped = [];

    for (const slot of allSlots) {
      let assigned = false;

      for (const clinician of clinicians) {
        const slotStart = new Date(slot.startDate);
        const slotEnd = new Date(slot.endDate);
        const day = slotStart.toLocaleDateString('en-US', { weekday: 'long' });

        const dateValid = slotStart >= new Date(clinician.startDate) &&
                          slotEnd <= new Date(clinician.endDate);

        const isAvailable = clinician.workingDays.includes(day);

        console.log({
          clinician: clinician.clinicianName,
          workingDay: clinician.workingDays,
          slotDay: day,
          dateValid,
          isAvailable,
          slotStart,
          slotEnd,
        });

        if (isAvailable && dateValid) {
          const currentAssignments = assignments.filter(a => a.clinicianId === String(clinician._id));
          const assignedSlots = currentAssignments.map(a => a.slot);

          if (!hasConflict(slot, assignedSlots)) {
            assignments.push({
              slotId: slot._id,
              clinicianId: clinician._id,
              clinicId: slot.clinicId,
              slot
            });
            assigned = true;
            break;
          } else {
            console.log(`Conflict for clinician ${clinician.clinicianName} on slot ${slot.slotName}`);
          }
        }
      }

      if (!assigned) {
        skipped.push(slot._id);
      }
    }

    console.log('Skipped Slots (not assigned):', skipped);

    for (const assignment of assignments) {
      await Slot.findByIdAndUpdate(assignment.slotId, {
        assignedClinician: assignment.clinicianId,
        status: 'assigned',
        clinic: assignment.clinicId
      });
    }

    res.json({
      message: 'Weekly rota generated successfully.',
      totalAssigned: assignments.length,
      assignments: assignments.map(a => ({
        slotId: a.slotId,
        clinicianId: a.clinicianId,
        clinicId: a.clinicId
      }))
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRota = async (req, res) => {
  try {
    const slots = await Slot.find({ assignedClinician: { $ne: null } })
      .populate('clinic', 'clinicName address') // ✅ this line populates clinic name
      .populate('assignedClinician', 'clinicianName contactEmail')
      .lean();

    const rota = slots.map(slot => ({
      slotId: slot._id,
      slotName: slot.slotName,
      startDate: slot.startDate,
      endDate: slot.endDate,
      clinic: slot.clinic ? {
        clinicId: slot.clinic._id,
        clinicName: slot.clinic.clinicName,
        address: slot.clinic.address
      } : {},
      clinician: slot.assignedClinician ? {
        clinicianId: slot.assignedClinician._id,
        clinicianName: slot.assignedClinician.clinicianName,
        contactEmail: slot.assignedClinician.contactEmail
      } : {}
    }),);

    res.status(200).json({ total: rota.length, rota });
  } catch (error) {
    console.error('Error fetching rota:', error);
    res.status(500).json({ message: error.message });
  }
};