const express = require('express');
const router = express.Router();
const rotaController = require('../controllers/rotaController');

router.post('/', rotaController.createRota);
router.get('/', rotaController.getAllRota);
router.get('/:id', rotaController.getRotaById);
router.put('/:id', rotaController.updateRota);
router.delete('/:id', rotaController.deleteRota);

module.exports = router;



const generateWeeklyRota = require('../utils/generateWeeklyRota');

router.post('/generate-weekly', async (req, res) => {
  try {
    const result = await generateWeeklyRota();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
