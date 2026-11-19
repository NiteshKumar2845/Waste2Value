const express = require('express');
const { protect } = require('../middleware/auth');
const { register, login, getMe, updateProfile, redeemCoins } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/redeem', protect, redeemCoins);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;