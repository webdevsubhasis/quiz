const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  /* ================= RELATIONS ================= */

  // ✅ UPDATED: subject belongs to category
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    index: true,
    required: true,
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
   UNIQUE PER CATEGORY
===================================================== */
SubjectSchema.index(
  { categoryId: 1, name: 1 },
  { unique: true }
);

/* =====================================================
   AUTO displayName generator
===================================================== */
SubjectSchema.pre("save", function () {
  if (!this.displayName) {
    this.displayName = this.name
      .split("_")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  this.updatedAt = new Date();
});

module.exports =
  mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);