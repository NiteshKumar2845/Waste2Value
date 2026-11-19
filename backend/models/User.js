const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pointSchema = require('./pointSchema');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    
    role: { type: String, enum: ['user', 'business', 'collector', 'admin'], default: 'user' },
    phone: String,
    address: String,
    orgName: String,

    location: { type: pointSchema, default: undefined },
    serviceRadiusKm: { type: Number, default: 10 },
    acceptedCategories: [String],
    verified: { type: Boolean, default: false },

    walletBalance: { type: Number, default: 0 },

    passportId: { type: String, unique: true, sparse: true },
    coins: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function () {
  if (this.isNew) {
    if (['user', 'business'].includes(this.role) && !this.passportId) {
      this.passportId = 'W2V-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }
    // Only collectors need manual verification
    if (this.role !== 'collector') this.verified = true;
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
