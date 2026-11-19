const express = require('express');
const { getNearbyCollectors } = require('../controllers/collectorController');

const router = express.Router();

router.get('/nearby', getNearbyCollectors);

module.exports = router;