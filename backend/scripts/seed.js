require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Transaction = require("../models/Transaction");

const DEMO_EMAILS = ["admin@w2v.test", "collector@w2v.test", "user@w2v.test"];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const old = await User.find({ email: { $in: DEMO_EMAILS } });
  const oldIds = old.map((u) => u._id);
  await Listing.deleteMany({
    $or: [{ user: { $in: oldIds } }, { collector: { $in: oldIds } }],
  });
  await Transaction.deleteMany({
    $or: [{ user: { $in: oldIds } }, { collector: { $in: oldIds } }],
  });
  await User.deleteMany({ email: { $in: DEMO_EMAILS } });

  await User.create({
    name: "Platform Admin",
    email: "admin@w2v.test",
    password: "Admin@123",
    role: "admin",
  });

  await User.create({
    name: "Green Loop Recyclers",
    orgName: "Green Loop Recyclers",
    email: "collector@w2v.test",
    password: "Collector@123",
    role: "collector",
    phone: "9000000001",
    verified: true,
    location: { type: "Point", coordinates: [77.4538, 28.6692] }, // Ghaziabad
    serviceRadiusKm: 15,
  });

  await User.create({
    name: "Nitesh",
    email: "user@w2v.test",
    password: "User@123",
    role: "user",
    phone: "9000000002",
    address: "Indirapuram, Ghaziabad",
  });

  console.log("Seeded demo accounts:");
  console.log("  admin      admin@w2v.test      / Admin@123");
  console.log(
    "  collector  collector@w2v.test  / Collector@123  (verified, Ghaziabad)",
  );
  console.log("  user       user@w2v.test       / User@123");
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
