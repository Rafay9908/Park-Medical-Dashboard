const moment = require('moment');
const Rota = require('../models/rota');
const Clinic = require('../models/clinic');
const Clinician = require('../models/clinician');
const Slot = require('../models/slot');

const generateWeeklyRota = async () => {
  try {
    // Use UTC for everything - much simpler!
    const startDate = moment.utc().startOf('isoWeek'); // Monday in UTC
    const clinicians = await Clinician.find({ status: 'active' });
    const clinics = await Clinic.find({ isActive: true }).populate('slotIds');
    
    console.log(`Found ${clinicians.length} clinicians and ${clinics.length} clinics`);

    // Track clinician assignments to ensure proper distribution
    const clinicianSchedule = {};
    
    // Initialize clinician schedule tracking
    clinicians.forEach(clinician => {
      clinicianSchedule[clinician._id.toString()] = {};
      for (let i = 0; i < 7; i++) {
        const dayStr = moment.utc(startDate).add(i, 'days').format('YYYY-MM-DD');
        clinicianSchedule[clinician._id.toString()][dayStr] = [];
      }
    });

    // Helper function to check if time conflicts with break (12:30-13:30 UTC)
    // Note: Adjust these times according to your actual break times in UTC
    const isBreakTime = (slotStartTime, slotEndTime) => {
      const slotStart = moment.utc(slotStartTime);
      const slotEnd = moment.utc(slotEndTime);
      
      // Create break times for the same date as the slot (in UTC)
      const slotDate = slotStart.format('YYYY-MM-DD');
      const breakStart = moment.utc(`${slotDate} 12:30`, 'YYYY-MM-DD HH:mm');
      const breakEnd = moment.utc(`${slotDate} 13:30`, 'YYYY-MM-DD HH:mm');
      
      // Check if slot overlaps with break time
      const hasOverlap = slotStart.isBefore(breakEnd) && slotEnd.isAfter(breakStart);
      
      // Debug logging
      console.log(`Slot: ${slotStart.format('HH:mm')}-${slotEnd.format('HH:mm')} UTC`);
      console.log(`Break: ${breakStart.format('HH:mm')}-${breakEnd.format('HH:mm')} UTC`);
      console.log(`Has overlap: ${hasOverlap}`);
      
      return hasOverlap;
    };

    // Helper function to check if clinician has enough gap between shifts (1 hour)
    const hasEnoughGap = (clinicianId, dayStr, newSlotStart, newSlotEnd) => {
      const existingSlots = clinicianSchedule[clinicianId.toString()][dayStr];
      const newStart = moment.utc(newSlotStart);
      const newEnd = moment.utc(newSlotEnd);
      
      for (const existingSlot of existingSlots) {
        const existingStart = moment.utc(existingSlot.startTime);
        const existingEnd = moment.utc(existingSlot.endTime);
        
        // Check if there's at least 1 hour gap
        const gapAfterExisting = newStart.diff(existingEnd, 'minutes');
        const gapBeforeExisting = existingStart.diff(newEnd, 'minutes');
        
        if (gapAfterExisting < 60 && gapAfterExisting >= 0) return false;
        if (gapBeforeExisting < 60 && gapBeforeExisting >= 0) return false;
        
        // Check for overlaps
        if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) return false;
      }
      return true;
    };

    // Helper function to get available clinicians for a slot, shuffled for fair distribution
    const getAvailableClinicians = (dayStr, weekday, slot, clinic) => {
      // First check if slot conflicts with break time BEFORE filtering clinicians
      if (isBreakTime(slot.startDate, slot.endDate)) {
        console.log(`Skipping ${slot.slotName} - conflicts with lunch break`);
        return []; // Return empty array to skip this slot entirely
      }

      const available = clinicians.filter(clinician => {
        // Check if clinician works on this day
        if (!clinician.workingDays.includes(weekday)) return false;
        
        // Check if clinician has enough gap between shifts
        if (!hasEnoughGap(clinician._id, dayStr, slot.startDate, slot.endDate)) return false;
        
        // Check daily shift limit
        const dailyShifts = clinicianSchedule[clinician._id.toString()][dayStr].length;
        if (dailyShifts >= clinician.shiftsPerDay) return false;
        
        return true;
      });
      
      // Shuffle array for fair distribution
      return available.sort(() => Math.random() - 0.5);
    };

    // Generate rota for each day of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = moment.utc(startDate).add(i, 'days');
      const dayStr = currentDate.format('YYYY-MM-DD');
      const weekday = currentDate.format('dddd');
      
      console.log(`Processing ${weekday} - ${dayStr}`);

      for (const clinic of clinics) {
        // Check if clinic is open on this day
        const operatingDay = clinic.operatingHours.find(oh => oh.day === weekday);
        if (!operatingDay || !operatingDay.isOpen) {
          console.log(`${clinic.clinicName} is closed on ${weekday}`);
          continue;
        }

        // Get clinic's available slots
        const clinicSlots = clinic.slotIds && clinic.slotIds.length > 0 
          ? clinic.slotIds 
          : await Slot.find(); // Fallback to all slots

        console.log(`${clinic.clinicName} has ${clinicSlots.length} slots available on ${weekday}`);

        for (const slot of clinicSlots) {
          console.log(`\nProcessing slot: ${slot.slotName}`);
          
          // Check if rota already exists for this clinic-slot-day combination
          const existingRota = await Rota.findOne({
            clinic: clinic._id,
            slot: slot._id,
            day: dayStr,
          });

          if (existingRota) {
            console.log(`Rota already exists for ${clinic.clinicName} - ${slot.slotName} on ${dayStr}`);
            continue;
          }

          // Check if slot time is within clinic operating hours (all in UTC now)
          const slotStartUTC = moment.utc(slot.startDate);
          const slotEndUTC = moment.utc(slot.endDate);
          const slotStartTime = slotStartUTC.format('HH:mm');
          const slotEndTime = slotEndUTC.format('HH:mm');

          console.log(`Slot ${slot.slotName}: ${slotStartTime}-${slotEndTime} UTC`);
          console.log(`Clinic operating hours: ${operatingDay.openingTime}-${operatingDay.closingTime}`);

          // Note: Make sure your clinic operating hours are also stored in UTC format
          // or convert them appropriately for comparison
          if (slotStartTime < operatingDay.openingTime || slotEndTime > operatingDay.closingTime) {
            console.log(`Slot ${slot.slotName} (${slotStartTime}-${slotEndTime}) is outside ${clinic.clinicName} operating hours (${operatingDay.openingTime}-${operatingDay.closingTime})`);
            continue;
          }

          // Get available clinicians for this slot
          const availableClinicians = getAvailableClinicians(dayStr, weekday, slot, clinic);
          
          if (availableClinicians.length === 0) {
            console.log(`No available clinicians for ${clinic.clinicName} - ${slot.slotName} on ${weekday}`);
            continue;
          }

          // Assign to the first available clinician
          const assignedClinician = availableClinicians[0];

          // Map session type
          const mapSessionType = (slotName) => {
            const name = slotName.toLowerCase();
            if (name.includes('morning')) return 'Morning';
            if (name.includes('afternoon') || name.includes('afternon')) return 'Afternoon';
            if (name.includes('evening')) return 'Evening';
            if (name.includes('night')) return 'Night';
            return 'General'; // Default fallback
          };

          const sessionType = mapSessionType(slot.slotName);

          // Create and save the rota
          const rota = new Rota({
            clinic: clinic._id,
            clinician: assignedClinician._id,
            slot: slot._id,
            day: dayStr,
            sessionType: sessionType,
          });

          await rota.save();

          // Update clinician schedule tracking
          clinicianSchedule[assignedClinician._id.toString()][dayStr].push({
            startTime: slot.startDate,
            endTime: slot.endDate,
            clinic: clinic._id,
            slot: slot._id
          });

          console.log(`✅ Assigned ${assignedClinician.clinicianName} to ${clinic.clinicName} - ${slot.slotName} on ${weekday}`);
        }
      }
    }

    // Log final statistics
    console.log('\n=== FINAL ROTA STATISTICS ===');
    for (const clinician of clinicians) {
      let totalShifts = 0;
      for (let i = 0; i < 7; i++) {
        const dayStr = moment.utc(startDate).add(i, 'days').format('YYYY-MM-DD');
        const dayShifts = clinicianSchedule[clinician._id.toString()][dayStr].length;
        totalShifts += dayShifts;
        if (dayShifts > 0) {
          console.log(`${clinician.clinicianName}: ${moment.utc(dayStr).format('dddd')} - ${dayShifts} shifts`);
        }
      }
      console.log(`${clinician.clinicianName}: Total shifts this week - ${totalShifts}`);
    }

    return { 
      message: 'Weekly rota generated successfully',
      statistics: {
        cliniciansProcessed: clinicians.length,
        clinicsProcessed: clinics.length,
        weekStarting: startDate.format('YYYY-MM-DD')
      }
    };

  } catch (error) {
    console.error('Error generating weekly rota:', error);
    throw error;
  }
};

module.exports = generateWeeklyRota;