const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");
const generateToken = require("../utils/generateToken");
const { toPoint } = require("../utils/geo");

const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    address,
    orgName,
    location,
    serviceRadiusKm,
    acceptedCategories,
  } = req.body;

  const existing = await User.findOne({ email: email?.toLowerCase() });
  if (existing) throw httpError(400, "Already exists: email");

  const safeRole = ["user", "business", "collector"].includes(role)
    ? role
    : "user";
  const point = location ? toPoint(location) : undefined;

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    phone,
    address,
    orgName,
    ...(point ? { location: point } : {}),
    ...(serviceRadiusKm !== undefined
      ? { serviceRadiusKm: Number(serviceRadiusKm) }
      : {}),
    ...(Array.isArray(acceptedCategories) ? { acceptedCategories } : {}),
  });

  res.status(201).json({
    token: generateToken(user._id),
    user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw httpError(400, "Email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );
  if (!user || !(await user.matchPassword(password))) {
    throw httpError(401, "Invalid email or password");
  }

  res.json({
    token: generateToken(user._id),
    user,
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw httpError(404, "User not found");

  const {
    name,
    phone,
    address,
    orgName,
    location,
    serviceRadiusKm,
    acceptedCategories,
  } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (orgName !== undefined) user.orgName = orgName;
  if (serviceRadiusKm !== undefined)
    user.serviceRadiusKm = Number(serviceRadiusKm);
  if (Array.isArray(acceptedCategories))
    user.acceptedCategories = acceptedCategories;

  if (location !== undefined) {
    const point = toPoint(location);
    if (!point)
      throw httpError(
        400,
        "Invalid location (lat/lng or coordinates required)",
      );
    user.location = point;
  }

  await user.save();
  res.json({ user });
});

const redeemCoins = asyncHandler(async (req, res) => {
  const { upiId, coins } = req.body;
  const amountCoins = Number(coins);

  if (!upiId || !upiId.includes("@")) {
    return res
      .status(400)
      .json({ message: "Please enter a valid UPI ID (e.g. name@upi)" });
  }
  if (!amountCoins || amountCoins < 1000) {
    return res
      .status(400)
      .json({ message: "Minimum 1000 coins (₹1) required" });
  }

  const user = await User.findById(req.user._id);
  if ((user.coins || 0) < amountCoins) {
    return res.status(400).json({ message: "Not enough coins" });
  }

  user.coins -= amountCoins;
  await user.save();

  const rupees = (amountCoins / 1000).toFixed(2);
  const txnId = "UPI" + Date.now();

  res.json({
    message: `₹${rupees} transferred to ${upiId} (Ref: ${txnId})`,
    coins: user.coins,
  });
});

module.exports = { register, login, getMe, updateProfile, redeemCoins };
