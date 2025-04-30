const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');

router.post('/', clinicController.createClinic);
router.get('/', clinicController.getAllClinics);
router.get('/:id', clinicController.getClinicById);
router.put('/:id', clinicController.updateClinic);
router.delete('/:id', clinicController.deleteClinic);

module.exports = router;
