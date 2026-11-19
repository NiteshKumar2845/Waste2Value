const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const generateToken = require('../utils/generateToken');
const { toPoint } = require('../utils/geo');
const { CATEGORIES } = require('../utils/wasteConfig');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user', phone, address, orgName } = req.body;

  // Nobody can self-register as admin
  if (!['user', 'business', 'collector'].includes(role)) throw httpError(400, 'Invalid role');
  if (!name || !email || !password) throw httpError(400, 'Name, email and password are required');
  if (await User.findOne({ email: email.toLowerCase() })) throw httpError(400, 'Email already registered');

  const user = await User.create({ name, email, password, role, phone, address, orgName });
  res.status(201).json({ user, token: generateToken(user._id) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Invalid email or password');

  res.json({ user, token: generateToken(user._id) });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, phone, address, orgName, location, serviceRadiusKm, acceptedCategories } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (orgName !== undefined) user.orgName = orgName;

  if (location !== undefined) {
    const point = toPoint(location);
    if (!point) throw httpError(400, 'Invalid location');
    user.location = point;
  }
  if (serviceRadiusKm !== undefined) {
    const radius = Number(serviceRadiusKm);
    if (!(radius > 0 && radius <= 100)) throw httpError(400, 'Service radius must be between 1 and 100 km');
    user.serviceRadiusKm = radius;
  }
  if (acceptedCategories !== undefined) {
    if (!Array.isArray(acceptedCategories) || acceptedCategories.some((c) => !CATEGORIES.includes(c))) {
      throw httpError(400, 'Invalid categories');
    }
    user.acceptedCategories = acceptedCategories;
  }

  await user.save();
  res.json({ user });
});

module.exports = { register, login, getMe, updateProfile };
