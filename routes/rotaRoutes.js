const express = require('express');
const rotaController = require('../controllers/rotaController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.use(authMiddleware.protect);

router.post('/generate', authMiddleware.admin, rotaController.generateRota);
router.get('/view', rotaController.getRotaView);
router.get('/clinician/:id', rotaController.getClinicianSchedule);
router.patch('/:id', rotaController.updateAssignment);
router.delete('/:id', authMiddleware.admin, rotaController.deleteAssignment);

module.exports = router;