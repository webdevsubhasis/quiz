const { ObjectId } = require("mongodb");
const Set = require("../models/Set");
const Question = require("../models/Question");

/* ======================================================
   CREATE SET (ADMIN)
   POST /api/admin/sets
====================================================== */
exports.createSet = async (req, res, next) => {
  try {
    const {
      subjectId,
      setName,
      duration,
      totalMarks,
      negativeMark,
      instructions,
    } = req.body;

    if (!subjectId || !setName || !duration) {
      return res.status(400).json({
        message: "subjectId, setName and duration required",
      });
    }

    const set = await Set.create({
      subjectId,
      setName,
      duration,
      totalMarks: totalMarks || 0,
      negativeMark: negativeMark || 0,
      instructions: instructions || [],
    });

    res.status(201).json({
      message: "✅ Set created successfully",
      set,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   UPDATE SET
   PUT /api/admin/sets/:id
====================================================== */
exports.updateSet = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await Set.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Set not found" });

    res.json({
      message: "Set updated successfully",
      set: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   DELETE SET
   DELETE /api/admin/sets/:id
====================================================== */
exports.deleteSet = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Question.deleteMany({ setId: id });
    await Set.findByIdAndDelete(id);

    res.json({ message: "🗑️ Set and related questions deleted" });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   PUBLISH / UNPUBLISH SET
   PATCH /api/admin/sets/:id/publish
====================================================== */
exports.togglePublishSet = async (req, res, next) => {
  try {
    const set = await Set.findById(req.params.id);
    if (!set) return res.status(404).json({ message: "Set not found" });

    set.isPublished = !set.isPublished;
    await set.save();

    res.json({
      message: set.isPublished ? "Set published" : "Set unpublished",
      isPublished: set.isPublished,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   GET SETS BY SUBJECT (Student Page)
   GET /api/sets?subjectId=
====================================================== */
exports.getSetsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.query;

    if (!subjectId)
      return res.status(400).json({ message: "subjectId required" });

    const sets = await Set.find({
      subjectId,
      isPublished: true,
    }).sort({ createdAt: -1 });

    res.json({ sets });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   GET SET DETAILS (Instruction Modal)
   GET /api/sets/:id
====================================================== */
exports.getSetDetails = async (req, res, next) => {
  try {
    const set = await Set.findById(req.params.id);

    if (!set)
      return res.status(404).json({ message: "Set not found" });

    const totalQuestions = await Question.countDocuments({
      setId: set._id,
    });

    res.json({
      ...set.toObject(),
      totalQuestions,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   START EXAM (Load Questions)
   GET /api/sets/:id/start
====================================================== */
exports.startExam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const set = await Set.findById(id);
    if (!set || !set.isPublished)
      return res.status(404).json({ message: "Exam not available" });

    const questions = await Question.find({ setId: id })
      .select("-correctAnswer -answerIndex") // hide answers
      .sort({ _id: 1 });

    res.json({
      set: {
        id: set._id,
        setName: set.setName,
        duration: set.duration,
        negativeMark: set.negativeMark,
      },
      questions,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   SUBMIT EXAM (Calculate Score)
   POST /api/sets/:id/submit
====================================================== */
exports.submitExam = async (req, res, next) => {
  try {
    const { answers } = req.body; 
    // answers = { questionId: selectedIndex }

    const questions = await Question.find({ setId: req.params.id });

    let score = 0;
    let correct = 0;
    let wrong = 0;

    questions.forEach(q => {
      const userAns = answers[q._id];

      if (userAns === undefined) return;

      const actual = q.correctAnswer ?? q.answerIndex;

      if (userAns == actual) {
        score += q.marks;
        correct++;
      } else {
        score -= q.negativeMarks || 0;
        wrong++;
      }
    });

    res.json({
      score,
      correct,
      wrong,
      total: questions.length,
    });
  } catch (err) {
    next(err);
  }
};
