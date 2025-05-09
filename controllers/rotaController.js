const Rota = require('../models/rota');

// Create
exports.createRota = async (req, res) => {
  try {
    const Rota = await Rota.create(req.body);
    res.status(201).json(Rota);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read all
exports.getAllRotas = async (req, res) => {
  try {
    const Rotas = await Rota.find();
    res.json(Rotas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
exports.getRotaById = async (req, res) => {
  try {
    const Rota = await Rota.findById(req.params.id);
    if (!Rota) return res.status(404).json({ message: 'Rota not found' });
    res.json(Rota);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Update
exports.updateRota = async (req, res) => {
  try {
    const Rota = await Rota.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!Rota) return res.status(404).json({ message: 'Rota not found' });
    res.json(Rota);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteRota = async (req, res) => {
  try {
    const Rota = await Rota.findByIdAndDelete(req.params.id);
    if (!Rota) return res.status(404).json({ message: 'Rota not found' });
    res.json({ message: 'Rota deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
