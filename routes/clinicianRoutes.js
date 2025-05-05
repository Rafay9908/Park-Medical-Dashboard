const express = require('express');
const router = express.Router();
const clinicianController = require('../controllers/clinicianController');

router.post('/', clinicianController.createClinician);
router.get('/', clinicianController.getAllClinicians);
router.get('/:id', clinicianController.getClinicianById);
router.put('/:id', clinicianController.updateClinician);
router.delete('/:id', clinicianController.deleteClinician);

module.exports = router;
