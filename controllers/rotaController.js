const Rota = require('../models/rota');
const Slot = require('../models/slot');
const Clinic = require('../models/clinic');
const Clinician = require('../models/clinician');
const moment = require('moment');

// Helper function to check if slot conflicts with lunch break (12:30-13:30 UTC time)
function isSlotDuringLunch(slot) {
  const slotStart = moment.utc(slot.startDate);
  const slotEnd = moment.utc(slot.endDate);
  
  // Create lunch break times in UTC
  const slotDate = slotStart.format('YYYY-MM-DD');
  const lunchStart = moment.utc(`${slotDate} 12:30`, 'YYYY-MM-DD HH:mm');
  const lunchEnd = moment.utc(`${slotDate} 13:30`, 'YYYY-MM-DD HH:mm');
  
  // Only conflict if there's actual overlap (not just touching boundaries)
  return slotStart.isBefore(lunchEnd) && slotEnd.isAfter(lunchStart);
}

// Enhanced conflict checking with specific break rules
function hasConflict(newSlot, existingAssignments, newClinic) {
  const newStart = moment.utc(newSlot.startDate);
  const newEnd = moment.utc(newSlot.endDate);
  
  for (const assignment of existingAssignments) {
    const existingStart = moment.utc(assignment.slot.startDate);
    const existingEnd = moment.utc(assignment.slot.endDate);
    
    // Check for direct time overlaps
    if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
      return { conflict: true, reason: 'Direct time overlap' };
    }
    
    // HARD RULE 1: Check for afternoon-night consecutive shifts (NO BREAK ALLOWED)
    // Afternoon ends at 16:00, Night starts at 16:00 - this is forbidden
    const isAfternoonToNight = (
      (existingEnd.format('HH:mm') === '16:00' && newStart.format('HH:mm') === '16:00') ||
      (newEnd.format('HH:mm') === '16:00' && existingStart.format('HH:mm') === '16:00')
    );
    
    if (isAfternoonToNight) {
      return { conflict: true, reason: 'Afternoon-Night consecutive shifts forbidden (16:00-16:00)' };
    }
    
    // HARD RULE 2: Check for different clinic gap requirement (1 hour travel time)
    const existingClinicId = assignment.clinic?.toString() || assignment.clinicId?.toString();
    const newClinicId = newClinic?._id?.toString() || newClinic?.toString();
    
    const isDifferentClinic = existingClinicId !== newClinicId;
    
    if (isDifferentClinic) {
      // Calculate gaps between shifts at different clinics
      const gapAfterExisting = newStart.diff(existingEnd, 'minutes');
      const gapBeforeExisting = existingStart.diff(newEnd, 'minutes');
      
      // Must have at least 60 minutes between shifts at different clinics
      if (gapAfterExisting >= 0 && gapAfterExisting < 60) {
        return { 
          conflict: true, 
          reason: `Insufficient travel time: ${gapAfterExisting} minutes (needs 60+ for different clinics)` 
        };
      }
      if (gapBeforeExisting >= 0 && gapBeforeExisting < 60) {
        return { 
          conflict: true, 
          reason: `Insufficient travel time: ${gapBeforeExisting} minutes (needs 60+ for different clinics)` 
        };
      }
    }
    
    // SPECIAL ALLOWANCE: Morning-Afternoon at same clinic (12:30-13:30 break is exactly 1 hour)
    const isMorningToAfternoon = (
      existingEnd.format('HH:mm') === '12:30' && newStart.format('HH:mm') === '13:30'
    ) || (
      newEnd.format('HH:mm') === '12:30' && existingStart.format('HH:mm') === '13:30'
    );
    
    if (isMorningToAfternoon && !isDifferentClinic) {
      // This is allowed - exactly 1 hour lunch break
      continue;
    }
  }
  
  return { conflict: false };
}

// Helper function to determine session type from slot name
function getSessionType(slotName) {
  const name = slotName.toLowerCase();
  if (name.includes('morning')) return 'Morning';
  if (name.includes('afternoon') || name.includes('afternon')) return 'Afternoon';
  if (name.includes('evening')) return 'Evening';
  if (name.includes('night')) return 'Night';
  return 'Morning'; // Default fallback
}

// Calculate priority for assignment to maximize coverage
function calculateAssignmentPriority(clinician, clinic, slot, dayKey, clinicianDailyAssignments, allAssignments) {
  let priority = 0;
  
  // Higher priority for clinics with fewer assignments
  const clinicAssignmentCount = allAssignments.filter(a => 
    a.clinic.toString() === clinic._id.toString() && a.day === dayKey
  ).length;
  priority += (10 - clinicAssignmentCount); // Fewer assignments = higher priority
  
  // Higher priority for clinicians with fewer daily assignments
  const clinicianDailyCount = clinicianDailyAssignments[clinician._id.toString()][dayKey].length;
  priority += (5 - clinicianDailyCount); // Fewer daily assignments = higher priority
  
  // Slight preference for preferred clinics
  if (clinician.preferredClinics && clinician.preferredClinics.includes(clinic._id.toString())) {
    priority += 2;
  }
  
  // Priority for filling critical time slots (night shifts often understaffed)
  const sessionType = getSessionType(slot.slotName);
  if (sessionType === 'Night') priority += 3;
  if (sessionType === 'Morning') priority += 1;
  
  return priority;
}

// Enhanced clinician assignment with multiple attempts and optimization
function findBestClinicianAssignment(clinicians, clinic, slot, dayKey, clinicianDailyAssignments, allAssignments, dayName) {
  const candidates = [];
  
  for (const clinician of clinicians) {
    // Check if clinician works on this day
    if (!clinician.workingDays.includes(dayName)) {
      continue;
    }
    
    // Get daily assignments for conflict checking
    const dailyAssignments = clinicianDailyAssignments[clinician._id.toString()][dayKey];
    
    // Check for conflicts with enhanced rules
    const conflictCheck = hasConflict(slot, dailyAssignments, clinic);
    if (conflictCheck.conflict) {
      continue;
    }
    
    // Calculate priority for this assignment
    const priority = calculateAssignmentPriority(
      clinician, clinic, slot, dayKey, clinicianDailyAssignments, allAssignments
    );
    
    candidates.push({
      clinician,
      priority,
      currentDailyShifts: dailyAssignments.length
    });
  }
  
  // Sort by priority (highest first), then by current daily shifts (fewer first)
  candidates.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.currentDailyShifts - b.currentDailyShifts;
  });
  
  return candidates.length > 0 ? candidates[0].clinician : null;
}

exports.generateWeeklyRota = async (req, res) => {
  try {
    // Use UTC for week calculation
    const startOfWeek = moment.utc().startOf('isoWeek');
    const endOfWeek = moment.utc().endOf('isoWeek');
    
    console.log('\n🧹 CLEARING EXISTING ROTAS');
    console.log(`📅 Week range: ${startOfWeek.format('YYYY-MM-DD')} to ${endOfWeek.format('YYYY-MM-DD')}`);
    
    // Delete existing rotas for this week
    const deleteResult = await Rota.deleteMany({
      day: {
        $gte: startOfWeek.format('YYYY-MM-DD'),
        $lte: endOfWeek.format('YYYY-MM-DD')
      }
    });
    
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing rota entries for this week`);
    
    // Get all data
    const slots = await Slot.find({ status: 'open' });
    const clinics = await Clinic.find({ isActive: true }).populate('slotIds');
    const clinicians = await Clinician.find({ status: 'active' });

    console.log(`\n📊 Processing ${slots.length} slots, ${clinics.length} clinics, ${clinicians.length} clinicians`);

    const assignments = [];
    const skippedSlots = [];
    
    // Track clinician assignments for each day
    const clinicianDailyAssignments = {};

    // Initialize tracking for each clinician
    clinicians.forEach(clinician => {
      clinicianDailyAssignments[clinician._id.toString()] = {};
      for (let i = 0; i < 7; i++) {
        const dayKey = moment.utc(startOfWeek).add(i, 'days').format('YYYY-MM-DD');
        clinicianDailyAssignments[clinician._id.toString()][dayKey] = [];
      }
    });

    // OPTIMIZATION: Process multiple rounds to maximize coverage
    const MAX_ROUNDS = 3; // Multiple passes to catch missed opportunities
    
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      console.log(`\n🔄 ROUND ${round} - ${round === 1 ? 'Initial assignment' : round === 2 ? 'Coverage optimization' : 'Final gap filling'}`);
      
      // Process each day of the week
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = moment.utc(startOfWeek).add(dayIndex, 'days');
        const dayName = currentDate.format('dddd');
        const dayKey = currentDate.format('YYYY-MM-DD');
        
        if (round === 1) console.log(`\n📅 Processing ${dayName} (${dayKey})`);

        // Create all possible clinic-slot combinations
        const clinicSlotCombinations = [];
        
        for (const clinic of clinics) {
          // Check if clinic is open on this day
          const operatingDay = clinic.operatingHours.find(oh => oh.day === dayName);
          if (!operatingDay || !operatingDay.isOpen) {
            continue;
          }

          // Get clinic's available slots
          const clinicSlots = clinic.slotIds && clinic.slotIds.length > 0 
            ? clinic.slotIds 
            : slots;

          for (const slot of clinicSlots) {
            // Skip if already assigned in previous rounds
            const alreadyAssigned = assignments.some(a => 
              a.slot.toString() === slot._id.toString() && 
              a.clinic.toString() === clinic._id.toString() && 
              a.day === dayKey
            );
            
            if (alreadyAssigned) continue;
            
            // Skip if slot is during lunch break
            if (isSlotDuringLunch(slot)) {
              if (round === 1) {
                skippedSlots.push({
                  slot: slot._id,
                  clinic: clinic._id,
                  reason: 'Lunch break conflict',
                  day: dayName,
                  details: `${slot.slotName} conflicts with mandatory lunch break (12:30-13:30 UTC)`
                });
              }
              continue;
            }

            // Check if slot time is within clinic operating hours
            const slotStartTime = moment.utc(slot.startDate).format('HH:mm');
            const slotEndTime = moment.utc(slot.endDate).format('HH:mm');
            
            if (slotStartTime < operatingDay.openingTime || slotEndTime > operatingDay.closingTime) {
              if (round === 1) {
                skippedSlots.push({
                  slot: slot._id,
                  clinic: clinic._id,
                  reason: 'Outside operating hours',
                  day: dayName,
                  slotTime: `${slotStartTime}-${slotEndTime}`,
                  operatingHours: `${operatingDay.openingTime}-${operatingDay.closingTime}`
                });
              }
              continue;
            }

            clinicSlotCombinations.push({ clinic, slot, dayName, dayKey });
          }
        }

        // Sort combinations by priority (prioritize understaffed clinics)
        clinicSlotCombinations.sort((a, b) => {
          const aCount = assignments.filter(assignment => 
            assignment.clinic.toString() === a.clinic._id.toString() && assignment.day === dayKey
          ).length;
          const bCount = assignments.filter(assignment => 
            assignment.clinic.toString() === b.clinic._id.toString() && assignment.day === dayKey
          ).length;
          
          // Prioritize clinics with fewer assignments
          return aCount - bCount;
        });

        // Process combinations with enhanced assignment logic
        for (const { clinic, slot, dayName, dayKey } of clinicSlotCombinations) {
          // Find best clinician for this assignment
          const assignedClinician = findBestClinicianAssignment(
            clinicians, clinic, slot, dayKey, clinicianDailyAssignments, assignments, dayName
          );

          if (assignedClinician) {
            // Create the assignment
            const sessionType = getSessionType(slot.slotName);
            
            const assignment = new Rota({
              slot: slot._id,
              clinician: assignedClinician._id,
              clinic: clinic._id,
              day: dayKey,
              sessionType: sessionType,
            });

            await assignment.save();

            // Track the assignment
            clinicianDailyAssignments[assignedClinician._id.toString()][dayKey].push({
              slot: slot,
              clinic: clinic._id,
              clinicId: clinic._id.toString(),
              assignment: assignment
            });

            assignments.push({
              slot: slot._id,
              clinician: assignedClinician._id,
              clinic: clinic._id,
              day: dayKey,
              dayName: dayName,
              sessionType: sessionType,
            });

            if (round === 1) {
              console.log(`   ✅ ${assignedClinician.clinicianName} → ${clinic.clinicName} - ${slot.slotName} (${sessionType})`);
            }
          } else {
            if (round === MAX_ROUNDS) { // Only log on final round
              skippedSlots.push({
                slot: slot._id,
                clinic: clinic._id,
                reason: 'No available clinician after optimization',
                day: dayName,
                details: `No clinician available for ${slot.slotName} at ${clinic.clinicName} on ${dayName} after ${MAX_ROUNDS} rounds`
              });
            }
          }
        }
      }
      
      console.log(`   Round ${round} completed: ${assignments.length} total assignments`);
    }

    // Enhanced statistics
    console.log('\n=== GENERATION STATISTICS ===');
    console.log(`✅ Total assignments created: ${assignments.length}`);
    console.log(`❌ Total slots skipped: ${skippedSlots.length}`);
    console.log(`🗑️  Previous entries deleted: ${deleteResult.deletedCount}`);
    
    // Coverage analysis by clinic and day
    const coverageByClinicAndDay = {};
    const totalPossibleSlots = {};
    
    assignments.forEach(assignment => {
      const key = `${assignment.dayName}`;
      if (!coverageByClinicAndDay[key]) coverageByClinicAndDay[key] = {};
      if (!coverageByClinicAndDay[key][assignment.clinic]) {
        coverageByClinicAndDay[key][assignment.clinic] = 0;
      }
      coverageByClinicAndDay[key][assignment.clinic]++;
    });

    // Calculate coverage percentage
    clinics.forEach(clinic => {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = moment.utc(startOfWeek).add(dayIndex, 'days');
        const dayName = currentDate.format('dddd');
        
        const operatingDay = clinic.operatingHours.find(oh => oh.day === dayName);
        if (operatingDay && operatingDay.isOpen) {
          const clinicSlots = clinic.slotIds && clinic.slotIds.length > 0 ? clinic.slotIds : slots;
          const availableSlots = clinicSlots.filter(slot => {
            return !isSlotDuringLunch(slot) && 
                   moment.utc(slot.startDate).format('HH:mm') >= operatingDay.openingTime &&
                   moment.utc(slot.endDate).format('HH:mm') <= operatingDay.closingTime;
          }).length;
          
          const assignedSlots = assignments.filter(a => 
            a.clinic.toString() === clinic._id.toString() && a.dayName === dayName
          ).length;
          
          console.log(`📊 ${clinic.clinicName} ${dayName}: ${assignedSlots}/${availableSlots} slots filled (${Math.round(assignedSlots/availableSlots*100)}%)`);
        }
      }
    });

    console.log('\n🎉 OPTIMIZED ROTA GENERATION COMPLETED\n');

    res.status(200).json({
      message: 'Weekly rota generated successfully with maximum coverage optimization.',
      totalAssigned: assignments.length,
      assignments,
      skippedSlots,
      weekStarting: startOfWeek.format('YYYY-MM-DD'),
      weekEnding: endOfWeek.format('YYYY-MM-DD'),
      deletedPreviousEntries: deleteResult.deletedCount,
      optimizationRounds: MAX_ROUNDS,
      hardRulesEnforced: [
        '12:30-13:30 lunch break respected',
        '1-hour travel time between different clinics',
        'No afternoon-night consecutive shifts (16:00-16:00)'
      ]
    });

  } catch (error) {
    console.error('💥 Error generating weekly rota:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
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