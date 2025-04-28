const { body, validationResult } = require('express-validator');

exports.validateSlot = [
  body('slotName').notEmpty().withMessage('Slot Name is required'),
  body('startDate').notEmpty().withMessage('Start Date is required').isISO8601(),
  body('endDate').notEmpty().withMessage('End Date is required').isISO8601(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
