const Rota = require('../models/rota');

// Create rota
exports.createRota = async (req, res) => {
  try {
    const rota = await Rota.create(req.body);
    res.status(201).json(rota);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all rota entries
exports.getAllRota = async (req, res) => {
  try {
    const rota = await Rota.find()
      .populate('clinic')
      .populate('clinician')
      .populate('slot');
    res.status(200).json(rota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get rota by ID
exports.getRotaById = async (req, res) => {
  try {
    const rota = await Rota.findById(req.params.id)
      .populate('clinic')
      .populate('clinician')
      .populate('slot');
    if (!rota) return res.status(404).json({ message: 'Rota not found' });
    res.status(200).json(rota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update rota
exports.updateRota = async (req, res) => {
  try {
    const rota = await Rota.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rota) return res.status(404).json({ message: 'Rota not found' });
    res.status(200).json(rota);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete rota
exports.deleteRota = async (req, res) => {
  try {
    const rota = await Rota.findByIdAndDelete(req.params.id);
    if (!rota) return res.status(404).json({ message: 'Rota not found' });
    res.status(200).json({ message: 'Rota deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
