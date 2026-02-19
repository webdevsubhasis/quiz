const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  role: String,
  otpAttempts: Number,
  otpVerified: Boolean,
  createdAt: Date,
  status: {
    type: String,
    default: "Active",
  },
});

module.exports = mongoose.model("User", UserSchema);
