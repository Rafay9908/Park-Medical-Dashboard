// const moment = require('moment');
// const Rota = require('../models/rota');
// const Clinic = require('../models/clinic');
// const Clinician = require('../models/clinician');
// const Slot = require('../models/slot');

// const generateWeeklyRota = async () => {
//   const startDate = moment().startOf('isoWeek'); // Monday
//   const clinicians = await Clinician.find();
//   const clinics = await Clinic.find();
//   const slots = await Slot.find(); // Assume slots are pre-created (Morning, Afternoon, Evening)

//   if (!clinicians.length || !clinics.length || !slots.length) {
//     throw new Error('Clinics, Clinicians, or Slots missing.');
//   }

//   const sessionTypes = ['Morning', 'Afternoon', 'Evening'];
//   const rotaEntries = [];

//   // Loop through each day of the week
//   for (let i = 0; i < 7; i++) {
//     const currentDate = moment(startDate).add(i, 'days').format('YYYY-MM-DD');

//     for (const clinic of clinics) {
//       for (const sessionType of sessionTypes) {
//         const slot = slots.find(s => s.sessionType === sessionType);
//         if (!slot) continue;

//         const clinician = clinicians[Math.floor(Math.random() * clinicians.length)];

//         const rotaEntry = new Rota({
//           clinic: clinic._id,
//           clinician: clinician._id,
//           slot: slot._id,
//           day: currentDate,
//           sessionType,
//         });

//         rotaEntries.push(rotaEntry.save());
//       }
//     }
//   }

//   await Promise.all(rotaEntries);
//   return { message: 'Weekly rota generated successfully', count: rotaEntries.length };
// };

// module.exports = generateWeeklyRota;




const moment = require('moment');
const Rota = require('../models/rota');
const Clinic = require('../models/clinic');
const Clinician = require('../models/clinician');
const Slot = require('../models/slot');

const generateWeeklyRota = async () => {
  const startDate = moment().startOf('isoWeek'); // Monday
  const clinicians = await Clinician.find();
  const clinics = await Clinic.find();
  const slots = await Slot.find(); // e.g. Morning, Afternoon, Evening

  if (!clinicians.length || !clinics.length || !slots.length) {
    throw new Error('Clinics, Clinicians, or Slots missing.');
  }

  console.log(`Found ${clinics.length} clinics, ${clinicians.length} clinicians, and ${slots.length} slots.`);
  const rotaEntries = [];

  // Loop through each day of the week
  for (let i = 0; i < 7; i++) {
    const currentDate = moment(startDate).add(i, 'days').format('YYYY-MM-DD');

    for (const clinic of clinics) {
      const usedClinicians = new Set(); // Track already assigned clinicians for the day per clinic

      for (const slot of slots) {
        const availableClinicians = clinicians.filter(
          c => !usedClinicians.has(c._id.toString())
        );

        console.log(`Available clinicians for clinic "${clinic.name}" on ${currentDate} (${slot.sessionType}): ${availableClinicians.length}`);

        if (!availableClinicians.length) {
          console.warn(`No available clinicians for ${clinic.name} on ${currentDate} for ${slot.sessionType}`);
          continue;
        }

        const clinician = availableClinicians[Math.floor(Math.random() * availableClinicians.length)];

        const rotaEntry = new Rota({
          clinic: clinic._id,
          clinician: clinician._id,
          slot: slot._id,
          day: currentDate,
          sessionType: slot.sessionType,
        });

        try {
          const savedEntry = await rotaEntry.save();
          rotaEntries.push(savedEntry);
          usedClinicians.add(clinician._id.toString());
          console.log(`Rota saved: Clinic ${clinic.name}, Clinician ${clinician.name}, Slot ${slot.sessionType}, Date ${currentDate}`);
        } catch (err) {
          console.error(`Error saving rota for ${clinic.name} on ${currentDate} (${slot.sessionType}):`, err.message);
        }
      }
    }
  }

  return {
    message: 'Weekly rota generated successfully',
    count: rotaEntries.length,
  };
};

module.exports = generateWeeklyRota;
