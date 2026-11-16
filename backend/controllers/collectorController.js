const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const getNearbyCollectors = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw httpError(400, 'lat and lng are required');

  const radiusKm = Number(req.query.radius) || 10;
  const collectors = await User.find({
    role: 'collector',
    verified: true,
    location: {
      $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: radiusKm * 1000 },
    },
  })
    .select('name orgName acceptedCategories serviceRadiusKm location')
    .limit(20);

  res.json({ collectors });
});

module.exports = { getNearbyCollectors };
