const express = require('express');
const { getRates } = require('../controllers/metaController');

const router = express.Router();

router.get('/rates', getRates);

module.exports = router;