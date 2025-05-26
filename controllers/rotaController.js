
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
