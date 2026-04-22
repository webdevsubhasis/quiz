const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: "📚",
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

module.exports = mongoose.models.Category || mongoose.model("Category", CategorySchema);
