const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    setId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Set",
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 🔥 performance index
attemptSchema.index({ userId: 1, createdAt: -1 });

// ✅ FIX HERE
module.exports = mongoose.model("Attempt", attemptSchema);