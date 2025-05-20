const moment = require('moment');
const Rota = require('../models/rota');
const Clinic = require('../models/clinic');
const Clinician = require('../models/clinician');
const Slot = require('../models/slot');

const generateWeeklyRota = async () => {
  const startDate = moment().startOf('isoWeek'); // Monday
  const clinicians = await Clinician.find();
  const clinics = await Clinic.find().populate('slotIds');
  const allSlots = await Slot.find().sort({ startTime: 1 });

  for (let i = 0; i < 7; i++) {
    const dayStr = moment(startDate).add(i, 'days').format('YYYY-MM-DD');
    const weekday = moment(dayStr).format('dddd');

    for (const clinic of clinics) {
      // Get only the slots assigned to this clinic
      const clinicSlots = clinic.slotIds && clinic.slotIds.length > 0 
        ? clinic.slotIds 
        : allSlots; // Fallback to all slots if none specifically assigned

      // Check if clinic is open on this day
      const operatingDay = clinic.operatingHours.find(oh => oh.day === weekday);
      if (operatingDay && !operatingDay.isOpen) continue;

      for (const slot of clinicSlots) {
        const existingRota = await Rota.findOne({
          clinic: clinic._id,
          slot: slot._id,
          day: dayStr,
        });

        if (existingRota) continue;

        for (const clinician of clinicians) {
          if (!clinician.workingDays.includes(weekday)) continue;

          const duplicate = await Rota.findOne({
            clinician: clinician._id,
            slot: slot._id,
            day: dayStr,
          });
          if (duplicate) continue;

          const mapSessionType = (slotName) => {
            const name = slotName.toLowerCase();
            if (name.includes('morning')) return 'Morning';
            if (name.includes('afternoon') || name.includes('afternon')) return 'Afternoon';
            if (name.includes('evening')) return 'Evening';
            if (name.includes('night')) return 'Night';
            return null;
          };

          const sessionType = mapSessionType(slot.slotName);

          if (!sessionType) {
            console.log(`Invalid sessionType for slotName: ${slot.slotName}`);
            continue;
          }

          const rota = new Rota({
            clinic: clinic._id,
            clinician: clinician._id,
            slot: slot._id,
            day: dayStr,
            sessionType: sessionType,
          });

          await rota.save();
          break;
        }
      }
    }
  }

  return { message: 'Weekly rota generated successfully' };
};

module.exports = generateWeeklyRota;