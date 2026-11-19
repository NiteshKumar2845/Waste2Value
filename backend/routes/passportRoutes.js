const express = require('express');
const { getMyPassport, getPublicPassport } = require('../controllers/passportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, getMyPassport);
router.get('/:passportId', getPublicPassport);

module.exports = router;