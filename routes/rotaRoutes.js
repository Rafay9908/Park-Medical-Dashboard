const express = require('express');
const router = express.Router();
const rotaController = require('../controllers/rotaController');

router.post('/', rotaController.createRota);
router.get('/', rotaController.getAllRota);
router.get('/:id', rotaController.getRotaById);
router.put('/:id', rotaController.updateRota);
router.delete('/:id', rotaController.deleteRota);

module.exports = router;



// const generateWeeklyRota = require('../utils/generateWeeklyRota');

// router.post('/generate-weekly', async (req, res) => {
//   try {
//     const result = await generateWeeklyRota();
//     res.status(201).json(result);
//   } catch (err) {
//     res.status(500).json({ message: err.message },);
//   }
// });

// module.exports = router;

const generateWeeklyRota = require('../utils/generateWeeklyRota');
const Clinic = require('../models/clinic');
const Clinician = require('../models/clinician');
const Slot = require('../models/slot');

router.post('/generate-weekly', async (req, res) => {
  try {
    if (req.query.preview === 'true') {
      const clinics = await Clinic.find({}, '_id ');
      const clinicians = await Clinician.find({}, '_id ');
      const slots = await Slot.find({}, '_id ');

      return res.status(200).json({
        clinics,
        clinicians,
        slots,
        message: 'Fetched data preview before generating rota',
      });
    }

    const result = await generateWeeklyRota();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;