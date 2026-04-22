const mongoose = require("mongoose");

const SetSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  displayName: String,
  isPublished: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  attemptCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SetSchema.index({ subjectId: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Set || mongoose.model("Set", SetSchema);