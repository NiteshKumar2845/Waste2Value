const mongoose = require('mongoose');
const pointSchema = require('./pointSchema');
const { CATEGORIES } = require('../utils/wasteConfig');

const itemSchema = new mongoose.Schema(
  {
    category: { type: String, enum: CATEGORIES, required: true },
    estimatedKg: { type: Number, min: 0, default: 0 }, // what the user thinks they have
    actualKg: { type: Number, min: 0 }, // what the collector weighs
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: {
      type: [itemSchema],
      validate: [(v) => v.length > 0, 'Add at least one waste item'],
    },
    description: { type: String, maxlength: 500 },
    address: { type: String, required: [true, 'Pickup address is required'] },
    location: { type: pointSchema, required: [true, 'Pickup location is required'] },

    estimatedValue: Number,
    finalValue: Number,
    commission: Number,

    status: {
      type: String,
      enum: ['open', 'accepted', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },
    collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduledAt: Date,
    acceptedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

listingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Listing', listingSchema);
