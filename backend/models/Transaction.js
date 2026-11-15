const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    grossValue: { type: Number, required: true }, // value of verified waste
    commission: { type: Number, default: 0 },
    userPayout: { type: Number, required: true },
    type: { type: String, default: "pickup_payout" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);
