

// const moment = require('moment');
// const Rota = require('../models/rota');
// const Clinic = require('../models/clinic');
// const Clinician = require('../models/clinician');
// const Slot = require('../models/slot');

// const generateWeeklyRota = async () => {
//   const startDate = moment().startOf('isoWeek'); // Monday
//   const clinicians = await Clinician.find();
//   const clinics = await Clinic.find();
//   const slots = await Slot.find(); // e.g. Morning, Afternoon, Evening

//   if (!clinicians.length || !clinics.length || !slots.length) {
//     throw new Error('Clinics, Clinicians, or Slots missing.');
//   }

//   console.log(`Found ${clinics.length} clinics, ${clinicians.length} clinicians, and ${slots.length} slots.`);
//   const rotaEntries = [];

//   // Loop through each day of the week
//   for (let i = 0; i < 7; i++) {
//     const currentDate = moment(startDate).add(i, 'days').format('YYYY-MM-DD');

//     for (const clinic of clinics) {
//       const usedClinicians = new Set(); // Track already assigned clinicians for the day per clinic

//       for (const slot of slots) {
//         const availableClinicians = clinicians.filter(
//           c => !usedClinicians.has(c._id.toString())
//         );

//         console.log(`Available clinicians for clinic "${clinic.name}" on ${currentDate} (${slot.sessionType}): ${availableClinicians.length}`);

//         if (!availableClinicians.length) {
//           console.warn(`No available clinicians for ${clinic.name} on ${currentDate} for ${slot.sessionType}`);
//           continue;
//         }

//         const clinician = availableClinicians[Math.floor(Math.random() * availableClinicians.length)];

//         const rotaEntry = new Rota({
//           clinic: clinic._id,
//           clinician: clinician._id,
//           slot: slot._id,
//           day: currentDate,
//           sessionType: slot.sessionType,
//         });

//         try {
//           const savedEntry = await rotaEntry.save();
//           rotaEntries.push(savedEntry);
//           usedClinicians.add(clinician._id.toString());
//           console.log(`Rota saved: Clinic ${clinic.name}, Clinician ${clinician.name}, Slot ${slot.sessionType}, Date ${currentDate}`);
//         } catch (err) {
//           console.error(`Error saving rota for ${clinic.name} on ${currentDate} (${slot.sessionType}):`, err.message);
//         }
//       }
//     }
//   }

//   return {
//     message: 'Weekly rota generated successfully',
//     count: rotaEntries.length,
//   };
// };

// module.exports = generateWeeklyRota;



//Multiple Slot 

// const moment = require('moment');
// const Rota = require('../models/rota');
// const Clinic = require('../models/clinic');
// const Clinician = require('../models/clinician');
// const Slot = require('../models/slot');

// const generateWeeklyRota = async () => {
//   const startDate = moment().startOf('isoWeek');
//   const clinicians = await Clinician.find();
//   const clinics = await Clinic.find();
//   const slots = await Slot.find().sort({ startTime: 1 }); // Ensure slots are sorted

//   for (let i = 0; i < 7; i++) {
//     const day = moment(startDate).add(i, 'days').format('YYYY-MM-DD');

//     for (const clinic of clinics) {
//       for (const slot of slots) {
//         const existingRota = await Rota.findOne({
//           clinic: clinic._id,
//           slot: slot._id,
//           day: day,
//         });

//         if (existingRota) {
//           console.log(`Skipping existing rota for ${clinic.name} on ${day} for slot ${slot._id}`);
//           continue;
//         }

//         for (const clinician of clinicians) {
//           // Check if this clinician is already assigned to this slot on this day
//           const duplicate = await Rota.findOne({
//             clinician: clinician._id,
//             slot: slot._id,
//             day: day,
//           });

//           if (duplicate) continue;

//           // Check if clinician is assigned to any adjacent slot on same day
//           const clinicianRotasToday = await Rota.find({
//             clinician: clinician._id,
//             day: day,
//           }).populate('slot');

//           const slotStart = moment(slot.startTime, 'HH:mm');
//           const slotEnd = moment(slot.endTime, 'HH:mm');

//           const hasConflict = clinicianRotasToday.some((r) => {
//             const rStart = moment(r.slot.startTime, 'HH:mm');
//             const rEnd = moment(r.slot.endTime, 'HH:mm');
//             return (
//               slotStart.isBetween(rStart, rEnd, undefined, '[)') ||  // overlaps
//               slotEnd.isBetween(rStart, rEnd, undefined, '(]') ||   // overlaps
//               rStart.isBetween(slotStart, slotEnd)                  // contained
//             );
//           });

//           if (hasConflict) continue;

//           // Create rota entry
//           const rota = new Rota({
//             clinic: clinic._id,
//             clinician: clinician._id,
//             slot: slot._id,
//             day,
//             sessionType: slot.sessionType,
//           });

//           await rota.save();
//           console.log(`Assigned ${clinician.name} to ${clinic.name} on ${day} at slot ${slot.sessionType}`);
//           break; // Move to next slot
//         }
//       }
//     }
//   }

//   return { message: 'Weekly rota generated successfully' };
// };

// module.exports = generateWeeklyRota;





const moment = require('moment');
const Rota = require('../models/rota');
const Clinic = require('../models/clinic');
const Clinician = require('../models/clinician');
const Slot = require('../models/slot');

const generateWeeklyRota = async () => {
  const startDate = moment().startOf('isoWeek');
  const clinicians = await Clinician.find();
  const clinics = await Clinic.find();
  const slots = await Slot.find().sort({ startTime: 1 }); // Optional: implement sorting

  for (let i = 0; i < 7; i++) {
    const day = moment(startDate).add(i, 'days');
    const dayName = day.format('dddd'); // e.g., "Monday"
    const dayStr = day.format('YYYY-MM-DD');

    for (const clinic of clinics) {
      for (const slot of slots) {
        const existingRota = await Rota.findOne({
          clinic: clinic._id,
          slot: slot._id,
          day: dayStr,
        });

        if (existingRota) {
          console.log(`Skipping existing rota for ${clinic.clinicName} on ${dayStr} for slot ${slot.slotName}`);
          continue;
        }

        for (const clinician of clinicians) {
          // 1. Check working day
          if (!clinician.workingDays.includes(dayName)) continue;

          // 2. Check if clinician is unavailable
          const isUnavailable = clinician.unavailableTimes.some(unavailable => {
            const start = moment(unavailable.start);
            const end = moment(unavailable.end);
            return day.isBetween(start, end, 'day', '[]'); // inclusive
          });
          if (isUnavailable) continue;

          // 3. Check shifts per day
          const todayShifts = await Rota.countDocuments({
            clinician: clinician._id,
            day: dayStr,
          });
          if (todayShifts >= clinician.shiftsPerDay) continue;

          // 4. Check if already assigned to overlapping slot
          const clinicianRotasToday = await Rota.find({
            clinician: clinician._id,
            day: dayStr,
          }).populate('slot');

          const hasConflict = clinicianRotasToday.some(r => r.slot && r.slot._id.equals(slot._id));
          if (hasConflict) continue;

          // 5. Check if max weekly hours is not exceeded
          const thisWeekStart = moment(startDate).startOf('day');
          const thisWeekEnd = moment(startDate).add(6, 'days').endOf('day');

          const weeklyAssignments = await Rota.find({
            clinician: clinician._id,
            day: { $gte: thisWeekStart.format('YYYY-MM-DD'), $lte: thisWeekEnd.format('YYYY-MM-DD') },
          }).populate('slot');

          const estimatedHours = weeklyAssignments.length * 4; // Assuming 1 slot = 4 hours
          if (estimatedHours >= clinician.maxHoursPerWeek) continue;

          // 6. Create Rota entry
          const rota = new Rota({
            clinic: clinic._id,
            clinician: clinician._id,
            slot: slot._id,
            day: dayStr,
            sessionType: slot.slotName, // slot.slotName is being used here
          });

          await rota.save();
          console.log(`✅ Assigned ${clinician.clinicianName} to ${clinic.clinicName} on ${dayStr} at slot ${slot.slotName}`);
          break; // Go to next slot
        }
      }
    }
  }

  return { message: '✅ Weekly rota generated successfully' };
};

module.exports = generateWeeklyRota;
