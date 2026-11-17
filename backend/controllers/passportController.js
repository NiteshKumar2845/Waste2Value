const Listing = require("../models/Listing");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");
const {
  round2,
  calcImpact,
  computeGreenScore,
  levelFor,
} = require("../utils/wasteConfig");

const buildStats = async (userId) => {
  const completed = await Listing.find({ user: userId, status: "completed" });

  let totalKg = 0;
  let totalEarned = 0;
  const byCategory = {};

  completed.forEach((l) => {
    totalEarned += l.finalValue || 0;
    l.items.forEach((i) => {
      const kg = i.actualKg || 0;
      totalKg += kg;
      byCategory[i.category] = round2((byCategory[i.category] || 0) + kg);
    });
  });

  const greenScore = computeGreenScore({
    totalKg,
    pickups: completed.length,
    categories: Object.keys(byCategory).length,
  });

  return {
    totalKg: round2(totalKg),
    totalEarned: round2(totalEarned),
    pickups: completed.length,
    byCategory,
    impact: calcImpact(byCategory),
    greenScore,
    level: levelFor(greenScore),
  };
};

const getMyPassport = asyncHandler(async (req, res) => {
  const stats = await buildStats(req.user._id);
  res.json({
    passport: {
      name: req.user.orgName || req.user.name,
      passportId: req.user.passportId,
      memberSince: req.user.createdAt,
      walletBalance: req.user.walletBalance,
      ...stats,
    },
  });
});

const getPublicPassport = asyncHandler(async (req, res) => {
  const user = await User.findOne({ passportId: req.params.passportId });
  if (!user) throw httpError(404, "Passport not found");

  const { totalEarned, ...publicStats } = await buildStats(user._id);
  res.json({
    passport: {
      name: user.orgName || user.name,
      passportId: user.passportId,
      memberSince: user.createdAt,
      ...publicStats,
    },
  });
});

module.exports = { getMyPassport, getPublicPassport };
