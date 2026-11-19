const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) throw httpError(401, 'Not authorized, no token');

  const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, 'User no longer exists');

  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(httpError(403, `Role "${req.user.role}" cannot access this route`));
  }
  next();
};

const requireVerifiedCollector = (req, res, next) => {
  if (!req.user.verified) {
    return next(httpError(403, 'Your collector account is pending admin verification'));
  }
  next();
};

module.exports = { protect, authorize, requireVerifiedCollector };
