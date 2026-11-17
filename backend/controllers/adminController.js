const User = require("../models/User");
const Listing = require("../models/Listing");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

const listCollectors = asyncHandler(async (req, res) => {
  const filter = { role: "collector" };
  if (req.query.verified !== undefined)
    filter.verified = req.query.verified === "true";
  const collectors = await User.find(filter).sort("-createdAt");
  res.json({ collectors });
});

const verifyCollector = asyncHandler(async (req, res) => {
  const collector = await User.findOne({
    _id: req.params.id,
    role: "collector",
  });
  if (!collector) throw httpError(404, "Collector not found");

  collector.verified = req.body.verified !== false;
  await collector.save();
  res.json({ collector });
});

const getStats = asyncHandler(async (req, res) => {
  const [
    users,
    collectors,
    pendingCollectors,
    openListings,
    completedListings,
    money,
  ] = await Promise.all([
    User.countDocuments({ role: { $in: ["user", "business"] } }),
    User.countDocuments({ role: "collector", verified: true }),
    User.countDocuments({ role: "collector", verified: false }),
    Listing.countDocuments({ status: "open" }),
    Listing.countDocuments({ status: "completed" }),
    Transaction.aggregate([
      {
        $group: {
          _id: null,
          gross: { $sum: "$grossValue" },
          commission: { $sum: "$commission" },
        },
      },
    ]),
  ]);

  res.json({
    stats: {
      users,
      collectors,
      pendingCollectors,
      openListings,
      completedListings,
      grossValue: money[0] ? money[0].gross : 0,
      commissionEarned: money[0] ? money[0].commission : 0,
    },
  });
});

module.exports = { listCollectors, verifyCollector, getStats };
