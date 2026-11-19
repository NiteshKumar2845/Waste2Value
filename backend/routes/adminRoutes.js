const express = require('express');
const { listCollectors, verifyCollector, getStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/collectors', listCollectors);
router.patch('/collectors/:id/verify', verifyCollector);

module.exports = router;
