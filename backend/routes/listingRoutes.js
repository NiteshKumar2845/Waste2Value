const express = require('express');
const {
  estimate,
  createListing,
  getMyListings,
  getNearbyListings,
  getAssignedListings,
  acceptListing,
  reschedule,
  cancelListing,
  verifyAndComplete,
} = require('../controllers/listingController');
const { protect, authorize, requireVerifiedCollector } = require('../middleware/auth');

const router = express.Router();

router.post('/estimate', estimate);

router.use(protect);

router.post('/', authorize('user', 'business'), createListing);
router.get('/mine', authorize('user', 'business'), getMyListings);
router.patch('/:id/reschedule', authorize('user', 'business'), reschedule);
router.patch('/:id/schedule', authorize('user', 'business'), reschedule);
router.patch('/:id/cancel', authorize('user', 'business'), cancelListing);

router.get('/nearby', authorize('collector'), requireVerifiedCollector, getNearbyListings);
router.get('/assigned', authorize('collector'), requireVerifiedCollector, getAssignedListings);
router.patch('/:id/accept', authorize('collector'), requireVerifiedCollector, acceptListing);
router.post('/:id/accept', authorize('collector'), requireVerifiedCollector, acceptListing);
router.patch('/:id/complete', authorize('collector'), requireVerifiedCollector, verifyAndComplete);
router.post('/:id/verify', authorize('collector'), requireVerifiedCollector, verifyAndComplete);

module.exports = router;