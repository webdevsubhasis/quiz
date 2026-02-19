const mongoose = require("mongoose");

const SetSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },

  setName: {
    type: String,
    required: true,
  },

  duration: {
    type: Number,
    required: true,
  },

  totalMarks: {
    type: Number,
    default: 0,
  },

  negativeMark: {
    type: Number,
    default: 0,
  },

  instructions: [
    {
      type: String,
    },
  ],

  isPublished: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: Date,
});

module.exports = mongoose.model("Set", SetSchema);
