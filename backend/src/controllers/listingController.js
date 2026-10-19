const WasteListing = require('../models/WasteListing');

// Illustrative rates only. Real pricing should come from verified local collectors.
const INDICATIVE_RATE_PER_KG = {
  Paper: 8,
  Plastic: 15,
  Metal: 60,
  'E-waste': 25,
  Glass: 2,
  Other: 0,
};

function estimateValue(category, quantityKg) {
  return Math.round((INDICATIVE_RATE_PER_KG[category] || 0) * quantityKg);
}

async function getListings(req, res, next) {
  try {
    const { category, status, search } = req.query;
    const filter = {};
    if (category && category !== 'All categories') filter.category = category;
    if (status) filter.status = status;
    if (search && search.trim()) filter.$text = { $search: search.trim() };

    const listings = await WasteListing.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ count: listings.length, listings });
  } catch (error) {
    next(error);
  }
}

async function createListing(req, res, next) {
  try {
    const { title, category, quantityKg, location, description } = req.body;
    if (!title?.trim() || !category || !location?.trim() || quantityKg === undefined) {
      return res.status(400).json({ message: 'title, category, quantityKg, and location are required.' });
    }
    const quantity = Number(quantityKg);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'quantityKg must be a number greater than 0.' });
    }

    const listing = await WasteListing.create({
      title,
      category,
      quantityKg: quantity,
      location,
      description: description || '',
      estimatedValue: estimateValue(category, quantity),
    });
    return res.status(201).json({ message: 'Waste listing created.', listing });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

async function getListingById(req, res, next) {
  try {
    const listing = await WasteListing.findById(req.params.id).lean();
    if (!listing) return res.status(404).json({ message: 'Waste listing not found.' });
    return res.json({ listing });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid listing ID.' });
    next(error);
  }
}

module.exports = { getListings, createListing, getListingById };
