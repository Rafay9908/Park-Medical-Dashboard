const express = require('express');
const router = express.Router();
const rotaController = require('../controllers/rotaController');

router.post('/', rotaController.createRota);
router.get('/', rotaController.getAllRotas);
router.get('/:id', rotaController.getRotaById);
router.put('/:id', rotaController.updateRota);
router.delete('/:id', rotaController.deleteRota);


module.exports = router;
