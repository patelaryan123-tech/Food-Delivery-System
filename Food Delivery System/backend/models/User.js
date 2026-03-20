const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "admin", "delivery"],
      default: "customer",
    },
    isVerified: { type: Boolean, default: false },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    walletBalance: { type: Number, default: 0 },
    totalSavings: { type: Number, default: 0 },
    savedAddresses: [
      {
        label: { type: String, default: "Home" },
        address: { type: String },
        lat: { type: Number },
        lng: { type: Number },
        isDefault: { type: Boolean, default: false },
      },
    ],
    streaks: {
      count: { type: Number, default: 0 },
      lastOrderDate: { type: Date },
    },
    previousOrders: [
      {
        foodId: String,
        foodName: String,
        category: String,
        count: { type: Number, default: 1 },
      },
    ],
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: "" },
    isPlusMember: { type: Boolean, default: false },
    plusExpiry: { type: Date },
    loyaltyPoints: { type: Number, default: 0 },
    membershipTier: { 
        type: String, 
        enum: ["Bronze", "Silver", "Gold", "Platinum"], 
        default: "Bronze" 
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
