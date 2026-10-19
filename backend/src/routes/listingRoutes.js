const express = require('express');
const { getListings, createListing, getListingById } = require('../controllers/listingController');

const router = express.Router();
router.get('/', getListings);
router.post('/', createListing);
router.get('/:id', getListingById);

module.exports = router;
