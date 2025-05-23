// const express = require('express');
// const router = express.Router();
// const rotaController = require('../controllers/rotaController');

// // POST /rota/generate-weekly
// router.post('/generate-weekly', rotaController.generateWeeklyRota);
// router.get('/', rotaController.getAllRota);

// module.exports = router;


const express = require('express');
const router = express.Router();
const rotaController = require('../controllers/rotaController');

// POST /rota/generate-weekly
router.post('/generate-weekly', rotaController.generateWeeklyRota);

// GET /rota/
router.get('/', rotaController.getAllRota);

module.exports = router;
