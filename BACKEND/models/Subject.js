const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  /* ================= RELATIONS ================= */

  // NEW: subject belongs to section
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    default: null, // keeps old data working
    index: true,
  },

  /* ================= BASIC INFO ================= */

  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  displayName: {
    type: String,
    trim: true,
  },

  description: {
    type: String,
    default: "",
  },

  /* ================= META ================= */

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },

  icon: {
    type: String,
    default: "📘",
  },

  order: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  /* ================= LEGACY SUPPORT ================= */
  // for old questions already linked only by subject name
  legacyId: {
    type: String,
    default: null,
  },

  /* ================= TIMESTAMPS ================= */

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

/* =====================================================
   UNIQUE PER SECTION (NOT GLOBAL UNIQUE ANYMORE)
   Same subject allowed in different exams
===================================================== */
SubjectSchema.index(
  { sectionId: 1, name: 1 },
  { unique: true, partialFilterExpression: { sectionId: { $type: "objectId" } } }
);

/* =====================================================
   AUTO displayName generator
===================================================== */
SubjectSchema.pre("save", function (next) {
  if (!this.displayName) {
    this.displayName = this.name
      .split("_")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Subject", SubjectSchema);
