const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  /* ================= RELATIONS ================= */

  // NEW EXAM ENGINE LINK (primary)
  setId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Set",
    default: null,
    index: true,
  },

  // OLD LINK (keep for old data compatibility)
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    default: null,
    index: true,
  },

  /* ================= QUESTION CONTENT ================= */

  // new field name (standard)
  title: {
    type: String,
  },

  // OLD FIELD SUPPORT
  q: {
    type: String,
  },

  // automatically map old q → title
  // handled in pre-save hook

  type: {
    type: String,
    enum: ["mcq", "msq", "integer", "output"],
    default: "mcq",
  },

  code: {
    type: String,
    default: null,
  },

  options: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        if (this.type === "mcq") return v.length === 4;
        return true;
      },
      message: "MCQ must contain exactly 4 options",
    },
  },

  /* ================= ANSWER ================= */

  // NEW
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
  },

  // OLD SUPPORT
  answerIndex: {
    type: Number,
  },

  explanation: {
    type: String,
    default: "",
  },

  marks: {
    type: Number,
    default: 1,
  },

  negativeMarks: {
    type: Number,
    default: 0,
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },

  tags: [String],

  isActive: {
    type: Boolean,
    default: true,
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
   BACKWARD COMPATIBILITY HANDLER
   Converts old question format → new format automatically
===================================================== */
QuestionSchema.pre("save", function (next) {

  // OLD q -> title
  if (!this.title && this.q) {
    this.title = this.q;
  }

  // OLD answerIndex -> correctAnswer
  if (this.correctAnswer === undefined && this.answerIndex !== undefined) {
    this.correctAnswer = this.answerIndex;
  }

  this.updatedAt = new Date();
  next();
});

/* =====================================================
   INDEXES FOR FAST EXAM LOADING
===================================================== */
QuestionSchema.index({ setId: 1 });
QuestionSchema.index({ subjectId: 1 });
QuestionSchema.index({ difficulty: 1 });

module.exports = mongoose.model("Question", QuestionSchema);
