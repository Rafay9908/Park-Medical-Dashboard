const { body } = require('express-validator');

exports.createClinicValidator = [
  body('clinicName').notEmpty().withMessage('Clinic Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('minSessionPerWeek').isNumeric().withMessage('Minimum Session Per Week should be a number'),
];
