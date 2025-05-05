const Clinician = require('../models/clinician');

// Create
exports.createClinician = async (req, res) => {
  try {
    const clinician = new Clinician(req.body);
    await clinician.save();
    res.status(201).json(clinician);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read All
exports.getAllClinicians = async (req, res) => {
  try {
    const clinicians = await Clinician.find();
    res.status(200).json(clinicians);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read by ID
exports.getClinicianById = async (req, res) => {
  try {
    const clinician = await Clinician.findById(req.params.id);
    if (!clinician) return res.status(404).json({ message: 'Clinician not found' });
    res.status(200).json(clinician);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
exports.updateClinician = async (req, res) => {
  try {
    const clinician = await Clinician.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!clinician) return res.status(404).json({ message: 'Clinician not found' });
    res.status(200).json(clinician);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete
exports.deleteClinician = async (req, res) => {
  try {
    const clinician = await Clinician.findByIdAndDelete(req.params.id);
    if (!clinician) return res.status(404).json({ message: 'Clinician not found' });
    res.status(200).json({ message: 'Clinician deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
