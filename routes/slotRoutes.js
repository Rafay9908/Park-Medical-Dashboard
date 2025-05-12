const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const { validateSlot } = require('../validators/slotValidators');

router.post('/', validateSlot, slotController.createSlot);
router.get('/', slotController.getSlots);
router.put('/:id', validateSlot, slotController.updateSlot);
router.delete('/:id', slotController.deleteSlot);


module.exports = router;
