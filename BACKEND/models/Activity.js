const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    actorType: {
      type: String,
      enum: ["ADMIN", "USER"],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    message: String,
    metadata: Object,
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
