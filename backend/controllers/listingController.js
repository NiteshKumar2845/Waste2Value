const Listing = require("../models/Listing");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");
const { toPoint } = require("../utils/geo");
const { CATEGORIES, round2, estimateValue } = require("../utils/wasteConfig");

const cleanItems = (items, field) => {
  if (!Array.isArray(items) || items.length === 0)
    throw httpError(400, "Add at least one waste item");
  const merged = {};
  items.forEach((i) => {
    const kg = Number(i[field]);
    if (!CATEGORIES.includes(i.category))
      throw httpError(400, `Unknown category: ${i.category}`);
    if (!Number.isFinite(kg) || kg <= 0)
      throw httpError(400, `Enter a weight above 0 kg for ${i.category}`);
    merged[i.category] = (merged[i.category] || 0) + kg;
  });
  return Object.entries(merged).map(([category, kg]) => ({
    category,
    [field]: round2(kg),
  }));
};

const parseFutureDate = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) throw httpError(400, "Invalid date");
  if (d <= new Date())
    throw httpError(400, "Pickup time must be in the future");
  return d;
};

const estimate = asyncHandler(async (req, res) => {
  const items = cleanItems(req.body.items, "estimatedKg");
  res.json({ estimatedValue: estimateValue(items) });
});

const createListing = asyncHandler(async (req, res) => {
  const { items, description, address, location, scheduledAt } = req.body;

  const point = toPoint(location);
  if (!point) throw httpError(400, "Pickup location (lat/lng) is required");
  if (!address) throw httpError(400, "Pickup address is required");

  const itemsClean = cleanItems(items, "estimatedKg");
  const listing = await Listing.create({
    user: req.user._id,
    items: itemsClean,
    description,
    address,
    location: point,
    scheduledAt: scheduledAt ? parseFutureDate(scheduledAt) : undefined,
    estimatedValue: estimateValue(itemsClean),
  });

  res.status(201).json({ listing });
});

const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ user: req.user._id })
    .populate("collector", "name orgName phone")
    .sort("-createdAt");
  res.json({ listings });
});

const getNearbyListings = asyncHandler(async (req, res) => {
  const me = req.user;
  const lat = req.query.lat !== undefined ? Number(req.query.lat) : undefined;
  const lng = req.query.lng !== undefined ? Number(req.query.lng) : undefined;
  const coordinates =
    lat !== undefined && lng !== undefined
      ? [lng, lat]
      : me.location && me.location.coordinates;

  if (!coordinates) throw httpError(400, "Set your service location first");

  const radiusKm = Number(req.query.radius) || me.serviceRadiusKm || 10;
  const filter = {
    status: "open",
    location: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: radiusKm * 1000,
      },
    },
  };
  if (me.acceptedCategories && me.acceptedCategories.length) {
    filter["items.category"] = { $in: me.acceptedCategories };
  }

  const listings = await Listing.find(filter)
    .populate("user", "name role")
    .limit(50);
  res.json({ listings });
});

const getAssignedListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ collector: req.user._id })
    .populate("user", "name role phone")
    .sort("-updatedAt");
  res.json({ listings });
});

const acceptListing = asyncHandler(async (req, res) => {
  const update = {
    status: "accepted",
    collector: req.user._id,
    acceptedAt: new Date(),
  };
  if (req.body.scheduledAt)
    update.scheduledAt = parseFutureDate(req.body.scheduledAt);

  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, status: "open" },
    update,
    { new: true },
  );
  if (!listing) throw httpError(409, "This listing is no longer available");

  res.json({ listing });
});

const reschedule = asyncHandler(async (req, res) => {
  const listing = await Listing.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!listing) throw httpError(404, "Listing not found");
  if (!["open", "accepted"].includes(listing.status))
    throw httpError(400, "This listing can no longer be rescheduled");

  listing.scheduledAt = parseFutureDate(req.body.scheduledAt);
  await listing.save();
  res.json({ listing });
});

const cancelListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!listing) throw httpError(404, "Listing not found");
  if (!["open", "accepted"].includes(listing.status))
    throw httpError(400, "This listing can no longer be cancelled");

  listing.status = "cancelled";
  await listing.save();
  res.json({ listing });
});

const verifyAndComplete = asyncHandler(async (req, res) => {
  const listing = await Listing.findOne({
    _id: req.params.id,
    collector: req.user._id,
    status: "accepted",
  });
  if (!listing) throw httpError(404, "No accepted pickup found with this id");

  const weighed = cleanItems(req.body.items, "actualKg");
  listing.items = weighed.map((w) => {
    const original = listing.items.find((i) => i.category === w.category);
    return {
      category: w.category,
      estimatedKg: original ? original.estimatedKg : 0,
      actualKg: w.actualKg,
    };
  });

  const finalValue = estimateValue(weighed, "actualKg");
  const commission = round2(
    (finalValue * (Number(process.env.COMMISSION_PERCENT) || 0)) / 100,
  );

  listing.finalValue = finalValue;
  listing.commission = commission;
  listing.status = "completed";
  listing.completedAt = new Date();
  await listing.save();

  const totalActualWeight = weighed.reduce(
    (sum, item) => sum + item.actualKg,
    0,
  );
  const earnedCoins = Math.round(totalActualWeight * 50);

  await User.findByIdAndUpdate(listing.user, {
    $inc: { walletBalance: finalValue, coins: earnedCoins },
  });
  await Transaction.create({
    user: listing.user,
    collector: req.user._id,
    listing: listing._id,
    grossValue: finalValue,
    commission,
    userPayout: finalValue,
  });

  res.json({ listing, payout: finalValue, commission, earnedCoins });
});

module.exports = {
  estimate,
  createListing,
  getMyListings,
  getNearbyListings,
  getAssignedListings,
  acceptListing,
  reschedule,
  cancelListing,
  verifyAndComplete,
};
