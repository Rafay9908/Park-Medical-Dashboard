const { clinic, clinician, slot, assignment } = require('../models/index.js');
const { calculateTravelTime } = require('../utils/geoUtils');
const moment = require('moment');

// Helper Functions
const sortSlots = (slots, strategy) => {
  return slots.sort((a, b) => {
    if (strategy === 'priority') {
      return b.clinic.minSessionPerWeek - a.clinic.minSessionPerWeek;
    }
    return new Date(a.startTime) - new Date(b.startTime);
  });
};

const findSuitableClinicians = (slot, clinicianMap, strategy) => {
  return Array.from(clinicianMap.values()).filter(clinician => {
    // Check availability
    const isAvailable = !clinician.unavailableTimes?.some(unavailable => 
      moment(slot.startTime).isBetween(unavailable.start, unavailable.end)
    );
    
    // Check if clinician prefers this clinic
    const prefersClinic = clinician.preferredClinicIds?.includes(slot.clinic._id.toString());
    
    return isAvailable && (strategy !== 'preference' || prefersClinic);
  });
};

const selectClinician = (clinicians, slot, strategy) => {
  if (strategy === 'fairness') {
    return clinicians.sort((a, b) => a.assignedHours - b.assignedHours)[0];
  } else if (strategy === 'proximity' && clinicians.length > 1) {
    return clinicians.sort((a, b) => a.travelTime - b.travelTime)[0];
  }
  return clinicians[0];
};

const calculateTravelReduction = (clinicianMap) => {
  const totalReduction = Array.from(clinicianMap.values()).reduce((sum, clinician) => {
    return sum + (clinician.travelTimeReduction || 0);
  }, 0);
  return clinicianMap.size > 0 ? Math.round((totalReduction / clinicianMap.size) * 100) / 100 : 0;
};

// Main Controller Functions
const generateRota = async (req, res) => {
  try {
    const { startDate, endDate, optimizeFor = 'fairness' } = req.body;
    
    // Validate dates
    if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Verify clinics exist
    const allClinics = await clinic.find({});
    if (allClinics.length === 0) {
      return res.status(400).json({ error: 'No clinics available for scheduling' });
    }

    // Get open slots
    const openSlots = await slot.find({
      startTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: 'open'
    }).populate('clinic');

    const validSlots = openSlots.filter(s => s.clinic !== null);
    if (validSlots.length !== openSlots.length) {
      console.warn(`Filtered out ${openSlots.length - validSlots.length} slots with invalid clinic references`);
    }

    // Get available clinicians
    const clinicians = await clinician.find()
      .populate('preferredClinics')
      .populate('unavailableTimes');

    if (clinicians.length === 0) {
      return res.status(400).json({ error: 'No clinicians available for scheduling' });
    }

    // Generate assignments
    const results = await optimizeAssignments(validSlots, clinicians, optimizeFor);

    res.json({
      success: true,
      stats: {
        totalSlots: validSlots.length,
        assigned: results.assignments.length,
        unassigned: validSlots.length - results.assignments.length,
        travelTimeReduction: results.travelTimeReduction + '%',
        clinicsInvolved: [...new Set(results.assignments.map(a => a.clinic?.toString()))].length
      },
      assignments: results.assignments
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Rota generation failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const optimizeAssignments = async (slots, clinicians, strategy) => {
  const assignments = [];
  const clinicianMap = new Map();
  
  clinicians.forEach(c => {
    clinicianMap.set(c._id.toString(), {
      ...c.toObject(),
      preferredClinicIds: c.preferredClinics?.map(clinic => clinic._id.toString()) || [],
      assignedHours: 0,
      currentLocation: null,
      lastAssignmentEnd: null,
      travelTimeReduction: 0
    });
  });

  const sortedSlots = sortSlots(slots, strategy);

  for (const slot of sortedSlots) {
    const suitableClinicians = findSuitableClinicians(slot, clinicianMap, strategy);
    
    if (suitableClinicians.length > 0) {
      const selectedClinician = selectClinician(suitableClinicians, slot, strategy);
      
      let travelTime = 0;
      if (selectedClinician.currentLocation && slot.clinic.coordinates) {
        travelTime = calculateTravelTime(
          selectedClinician.currentLocation,
          slot.clinic.coordinates
        );
      }

      const newAssignment = new assignment({
        clinician: selectedClinician._id,
        slot: slot._id,
        clinic: slot.clinic._id,
        travelTime,
        status: 'confirmed'
      });

      await newAssignment.save();
      
      slot.status = 'assigned';
      slot.assignedClinician = selectedClinician._id;
      await slot.save();

      const clinician = clinicianMap.get(selectedClinician._id.toString());
      clinician.assignedHours += moment(slot.endTime).diff(slot.startTime, 'hours');
      clinician.currentLocation = slot.clinic.coordinates;
      clinician.lastAssignmentEnd = slot.endTime;
      clinician.travelTimeReduction = travelTime > 0 ? (travelTime / 60) : 0; // In minutes

      assignments.push(newAssignment);
    }
  }

  return {
    assignments,
    travelTimeReduction: calculateTravelReduction(clinicianMap)
  };
};

const getRotaView = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const rotas = await assignment.find({
      createdAt: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    })
    .populate('clinician')
    .populate('slot')
    .populate('clinic');

    res.json({
      success: true,
      data: rotas
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch rota view',
      details: error.message
    });
  }
};

const getClinicianSchedule = async (req, res) => {
  try {
    const { clinicianId, startDate, endDate } = req.query;
    
    const schedule = await assignment.find({
      clinician: clinicianId,
      createdAt: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    })
    .populate('slot')
    .populate('clinic');

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch clinician schedule',
      details: error.message
    });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedAssignment = await assignment.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    )
    .populate('clinician')
    .populate('slot')
    .populate('clinic');

    if (!updatedAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({
      success: true,
      data: updatedAssignment
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update assignment',
      details: error.message
    });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedAssignment = await assignment.findByIdAndDelete(id);

    if (!deletedAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await slot.findByIdAndUpdate(
      deletedAssignment.slot, 
      { status: 'open', assignedClinician: null }
    );

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete assignment',
      details: error.message
    });
  }
};

module.exports = {
  generateRota,
  getRotaView,
  getClinicianSchedule,
  updateAssignment,
  deleteAssignment
};