const mongoose = require('mongoose');

const CATEGORIES = ['Paper', 'Plastic', 'Metal', 'E-waste', 'Glass', 'Other'];
const STATUSES = ['Available', 'Pickup requested', 'Collector assigned', 'Collected', 'Cancelled'];

const wasteListingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, enum: CATEGORIES },
  quantityKg: { type: Number, required: true, min: 0.1 },
  location: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 600, default: '' },
  status: { type: String, enum: STATUSES, default: 'Available' },
  estimatedValue: { type: Number, min: 0, default: 0 },
  createdBy: { type: String, default: 'demo-user' },
}, { timestamps: true });

wasteListingSchema.index({ category: 1, status: 1 });
wasteListingSchema.index({ location: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model('WasteListing', wasteListingSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
