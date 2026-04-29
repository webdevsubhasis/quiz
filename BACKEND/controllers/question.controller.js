const { ObjectId } = require("mongodb");
const logActivity = require("../utils/activityLogger");
const ACTIVITY = require("../utils/activityTypes");
const Section = require("../models/Section");
const Category = require("../models/category");
const Subject = require("../models/subject");
const Set = require("../models/set");
const Question = require("../models/question");
/* =========================================================
   ADD QUESTION (ALL TYPES SUPPORTED + LOG)
   POST /api/admin/questions
========================================================= */
exports.addQuestion = async (req, res, next) => {
  try {

    const db = req.app.locals.db;

    const {
      setId,
      type = "mcq",
      title,
      code,
      options,
      correctAnswer,
      explanation,
      marks,
      negativeMarks,
      difficulty,
      questionId,
      language
    } = req.body;

    /* ================= BASIC VALIDATION ================= */

    if (!setId || !title)
      return res.status(400).json({ message: "setId and title required" });

    const set = await Set.findById(setId);
    if (!set)
      return res.status(404).json({ message: "Set not found" });

    /* ================= TYPE BASED VALIDATION ================= */

    if (type === "mcq") {
      if (!Array.isArray(options) || options.length !== 4)
        return res.status(400).json({
          message: "MCQ must contain exactly 4 options",
        });

      if (typeof correctAnswer !== "number" || correctAnswer < 0 || correctAnswer > 3)
        return res.status(400).json({
          message: "Correct answer must be index 0-3",
        });
    }

    if (type === "output") {
      if (!code || !code.content)
        return res.status(400).json({
          message: "Code content required for output question",
        });

      if (!Array.isArray(options) || options.length !== 4)
        return res.status(400).json({
          message: "Output question must have 4 options",
        });
    }

    if (type === "integer") {
      if (correctAnswer === undefined)
        return res.status(400).json({
          message: "Integer question requires numeric answer",
        });
    }

    /* ================= CREATE QUESTION ================= */

    const question = await Question.create({
      setId,
      subjectId: set.subjectId,
      questionId: questionId || null,
      language: language || null,

      type,
      title,
      code:
        type === "output"
          ? {
            ...code,
            content: code.content.replace(/\\n/g, "\n"),
          }
          : null,

      options: options || [],
      correctAnswer,

      explanation: explanation || "",
      marks: marks ?? 1,
      negativeMarks: negativeMarks ?? 0,
      difficulty: difficulty || "medium",
    });

    /* ================= ACTIVITY LOG ================= */
    try {
      await logActivity(db, {
        actorType: "ADMIN",
        action: ACTIVITY.QUESTION.ADDED,
        entityType: "QUESTION",
        entityId: question._id,
        message: `New ${type.toUpperCase()} question added`,
        metadata: {
          subjectId: set.subjectId,
          setId: set._id,
          questionType: type,
          title: question.title,
        },
      });
    } catch (logErr) {
      console.error("Activity log failed:", logErr);
    }

    /* ================= RESPONSE ================= */
    res.status(201).json({
      message: "❓ Question added successfully",
      question,
    });

  } catch (err) {
    next(err);
  }
};

/* ===================================================
/* ===================================================
   IMPORT QUESTIONS (UPDATED STRUCTURE)
   POST /api/admin/questions/import
=================================================== */

exports.importQuestions = async (req, res, next) => {
  try {
    /* ================= FILE CHECK ================= */
    if (!req.file) {
      return res.status(400).json({ message: "JSON file required" });
    }

    let parsed;
    try {
      parsed = JSON.parse(req.file.buffer.toString());
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON file" });
    }

    /* ================= REQUIRED ROOT ================= */
    if (!parsed.category || !parsed.subjectId || !parsed.subjectName || !parsed.questions) {
      return res.status(400).json({
        message: "Missing category / subjectId / subjectName / questions",
      });
    }

    /* ================= CATEGORY ================= */
    let category = await Category.findOne({
      name: parsed.category.toLowerCase(),
    });

    if (!category) {
      category = await Category.create({
        name: parsed.category.toLowerCase(),
        displayName: parsed.category,
      });
    }

    /* ================= SUBJECT ================= */
    let subject = await Subject.findOne({
      name: parsed.subjectId.toLowerCase(),
    });

    if (!subject) {
      subject = await Subject.create({
        categoryId: category._id,
        name: parsed.subjectId.toLowerCase(),
        displayName: parsed.subjectName,
      });
    }

    /* ================= ENSURE ALL SETS EXIST ================= */
    const defaultSets = ["easy", "medium", "hard"];
    const orderMap = { easy: 1, medium: 2, hard: 3 };

    const setsMap = {};

    for (const level of defaultSets) {
      let set = await Set.findOne({
        subjectId: subject._id,
        name: level,
      });

      if (!set) {
        set = await Set.create({
          subjectId: subject._id,
          name: level,
          displayName: level,
          order: orderMap[level],
          isPublished: true,
        });
      }

      setsMap[level] = set;
    }

    /* ================= QUESTIONS VALIDATION ================= */
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return res.status(400).json({ message: "No questions found" });
    }

    /* ================= SET RESOLUTION ================= */
    let level = (parsed.set || "easy").toLowerCase();
    const selectedSet = setsMap[level] || setsMap["easy"];

    /* ================= PROCESS QUESTIONS ================= */
    const validDocs = [];
    const skipped = [];

    for (const [index, q] of parsed.questions.entries()) {
      if (!q.question) {
        skipped.push({ index, reason: "Missing question" });
        continue;
      }

      const type = q.type || "mcq";

      /* ---------- VALIDATION ---------- */
      if (type === "mcq") {
        if (
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          typeof q.correctAnswer !== "number"
        ) {
          skipped.push({ index, reason: "Invalid MCQ" });
          continue;
        }
      }

      if (type === "output") {
        if (!q.code || !Array.isArray(q.options)) {
          skipped.push({ index, reason: "Invalid output question" });
          continue;
        }
      }

      /* ================= PUSH QUESTION ================= */
      validDocs.push({
        setId: selectedSet._id,
        subjectId: subject._id,
        categoryId: category._id,

        title: q.question,
        type,

        options: q.options || [],
        correctAnswer: q.correctAnswer,

        explanation: q.explanation || "",
        code: q.code || null,

        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,

        isActive: true,
      });
    }

    if (!validDocs.length) {
      return res.status(400).json({
        message: "No valid questions to import",
        skipped,
      });
    }

    /* ================= INSERT ================= */
    const inserted = await Question.insertMany(validDocs);

    /* ================= RESPONSE ================= */
    res.status(201).json({
      message: "✅ Questions imported successfully",
      category: category.displayName,
      subject: subject.displayName,
      set: selectedSet.displayName,
      inserted: inserted.length,
      skipped: skipped.length,
    });

  } catch (err) {
    console.error("IMPORT ERROR:", err);

    if (typeof next === "function") {
      next(err);
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

/* ===================================================
   UPDATE QUESTION (ALL TYPES + SET SUPPORT + LOG)
   PUT /api/admin/questions/:id
=================================================== */
exports.updateQuestion = async (req, res, next) => {
  try {


    const db = req.app.locals.db;

    const { id } = req.params;
    const {
      setId,
      type,
      title,
      code,
      options,
      correctAnswer,
      explanation,
      marks,
      negativeMarks,
      difficulty,
      language
    } = req.body;

    /* ================= FIND QUESTION ================= */
    const question = await Question.findById(id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    /* ================= SET CHANGE SUPPORT ================= */
    if (setId && setId !== String(question.setId)) {
      const set = await Set.findById(setId);
      if (!set)
        return res.status(404).json({ message: "Target set not found" });

      question.setId = set._id;
      question.subjectId = set.subjectId; // keep sync
    }

    /* ================= TYPE VALIDATION ================= */
    const newType = type || question.type;

    if (newType === "mcq") {
      if (!Array.isArray(options) || options.length !== 4)
        return res.status(400).json({
          message: "MCQ must contain exactly 4 options",
        });

      if (typeof correctAnswer !== "number" || correctAnswer < 0 || correctAnswer > 3)
        return res.status(400).json({
          message: "Correct answer must be index 0-3",
        });
    }

    if (newType === "output") {
      if (!code || !code.content)
        return res.status(400).json({
          message: "Output question requires code.content",
        });

      if (!Array.isArray(options) || options.length !== 4)
        return res.status(400).json({
          message: "Output question must have 4 options",
        });
    }

    if (newType === "integer") {
      if (correctAnswer === undefined)
        return res.status(400).json({
          message: "Integer question requires numeric answer",
        });
    }

    /* ================= APPLY UPDATES ================= */

    if (title !== undefined) question.title = title;
    if (language !== undefined) question.language = language;
    if (type !== undefined) question.type = type;

    if (code !== undefined)
      question.code = newType === "output" ? code : null;

    if (options !== undefined) question.options = options;

    if (correctAnswer !== undefined) {
      question.correctAnswer = correctAnswer;
      question.answerIndex = correctAnswer; // legacy support
    }

    if (explanation !== undefined) question.explanation = explanation;
    if (marks !== undefined) question.marks = marks;
    if (negativeMarks !== undefined) question.negativeMarks = negativeMarks;
    if (difficulty !== undefined) question.difficulty = difficulty;

    question.updatedAt = new Date();

    await question.save();

    /* ================= ACTIVITY LOG ================= */
    try {
      await logActivity(db, {
        actorType: "ADMIN",
        action: ACTIVITY.QUESTION.UPDATED,
        entityType: "QUESTION",
        entityId: question._id,
        message: `Question updated (${question.type.toUpperCase()})`,
        metadata: {
          setId: question.setId,
          subjectId: question.subjectId,
          title: question.title,
        },
      });
    } catch (logErr) {
      console.error("Activity log failed:", logErr);
    }

    /* ================= RESPONSE ================= */
    res.json({
      message: "Question updated successfully",
      question,
    });

  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET SINGLE QUESTION (FULL HIERARCHY INFO)
   GET /api/admin/questions/:id
=================================================== */
exports.getSingleQuestion = async (req, res, next) => {
  try {

    const { id } = req.params;

    /* ================= FIND QUESTION ================= */
    const question = await Question.findById(id).lean();
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    let hierarchy = {
      category: null,
      subcategory: null,
      section: null,
      subject: null,
      set: null,
    };

    /* ================= NEW SYSTEM (SET BASED) ================= */
    if (question.setId) {
      const set = await Set.findById(question.setId).lean();
      if (set) {
        hierarchy.set = set.setName;

        const subject = await Subject.findById(set.subjectId).lean();
        if (subject) {
          hierarchy.subject = subject.displayName || subject.name;

          const section = await Section.findById(subject.sectionId).lean();
          if (section) {
            hierarchy.section = section.displayName;

            const subcategory = await Subcategory.findById(section.subcategoryId).lean();
            if (subcategory) {
              hierarchy.subcategory = subcategory.displayName;

              const category = await Category.findById(subcategory.categoryId).lean();
              if (category) {
                hierarchy.category = category.displayName;
              }
            }
          }
        }
      }
    }
    /* ================= LEGACY SYSTEM ================= */
    else if (question.subjectId) {
      const subject = await Subject.findById(question.subjectId).lean();
      if (subject) {
        hierarchy.subject = subject.displayName || subject.name;
      }
    }

    /* ================= RESPONSE ================= */
    res.json({
      ...question,
      hierarchy,
    });

  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET QUESTIONS (ADMIN ADVANCED FILTER + HIERARCHY)
   GET /api/admin/questions
=================================================== */
exports.getAdminQuestions = async (req, res, next) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limitParam = req.query.limit || "10";
    const search = req.query.search || "";

    const {
      categoryId,
      subcategoryId,
      sectionId,
      subjectId,
      setId,
      type,
      difficulty
    } = req.query;

    const query = {};

    /* ================= SEARCH ================= */
    if (search)
      query.title = { $regex: search, $options: "i" };

    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;

    /* ================= HIERARCHY FILTER ================= */

    let subjectIds = [];
    let setIds = [];

    // filter by set
    if (setId && setId !== "all") {
      query.setId = setId;
    }

    // filter by subject
    else if (subjectId && subjectId !== "all") {
      query.subjectId = subjectId;
    }

    // filter by section
    else if (sectionId && sectionId !== "all") {
      subjectIds = (await Subject.find({ sectionId })).map(s => s._id);
      query.subjectId = { $in: subjectIds };
    }

    // filter by subcategory
    else if (subcategoryId && subcategoryId !== "all") {
      const sections = await Section.find({ subcategoryId });
      const sectionIds = sections.map(s => s._id);
      subjectIds = (await Subject.find({ sectionId: { $in: sectionIds } })).map(s => s._id);
      query.subjectId = { $in: subjectIds };
    }

    // filter by category
    else if (categoryId && categoryId !== "all") {
      const subcats = await Subcategory.find({ categoryId });
      const subIds = subcats.map(s => s._id);

      const sections = await Section.find({ subcategoryId: { $in: subIds } });
      const sectionIds = sections.map(s => s._id);

      subjectIds = (await Subject.find({ sectionId: { $in: sectionIds } })).map(s => s._id);
      query.subjectId = { $in: subjectIds };
    }

    /* ================= COUNT ================= */
    const total = await Question.countDocuments(query);

    let cursor = Question.find(query).sort({ createdAt: -1 });

    let questions;
    if (limitParam === "all") {
      questions = await cursor.lean();
    } else {
      const limit = parseInt(limitParam);
      questions = await cursor.skip((page - 1) * limit).limit(limit).lean();
    }

    /* ================= BUILD HIERARCHY ================= */
    const final = [];

    for (const q of questions) {
      let hierarchy = {
        category: null,
        subcategory: null,
        section: null,
        subject: null,
        set: null,
      };

      if (q.setId) {
        const set = await Set.findById(q.setId).lean();
        if (set) {
          hierarchy.set = set.setName;

          const subject = await Subject.findById(set.subjectId).lean();
          if (subject) {
            hierarchy.subject = subject.displayName || subject.name;

            const section = await Section.findById(subject.sectionId).lean();
            if (section) {
              hierarchy.section = section.displayName;

              const subcategory = await Subcategory.findById(section.subcategoryId).lean();
              if (subcategory) {
                hierarchy.subcategory = subcategory.displayName;

                const category = await Category.findById(subcategory.categoryId).lean();
                if (category) {
                  hierarchy.category = category.displayName;
                }
              }
            }
          }
        }
      }

      final.push({ ...q, hierarchy });
    }

    /* ================= RESPONSE ================= */
    res.json({
      questions: final,
      total,
      totalPages:
        limitParam === "all" ? 1 : Math.ceil(total / parseInt(limitParam)),
      currentPage: page,
    });

  } catch (err) {
    next(err);
  }
};

/* ===================================================
   FRONTEND QUESTIONS (SECURE — NO ANSWERS LEAK)
   GET /api/questions
=================================================== */
exports.getFrontendQuestions = async (req, res, next) => {
  try {
    const { setId, subjectId, search } = req.query;

    const query = {};
    let subjectName = null;
    let finalSubjectId = null;

    /* ================= MODE SELECT ================= */

    // ✅ EXAM MODE
    if (setId) {
      const set = await Set.findById(setId).lean();

      if (!set || !set.isPublished) {
        return res.status(404).json({ message: "Exam not available" });
      }

      if (set.name.toLowerCase() === "hard" && !user.isPremium) {
        return res.status(403).json({
          message: "Upgrade required",
        });
      }

      query.setId = setId;

      // 🔥 IMPORTANT: extract subjectId from set
      finalSubjectId = set.subjectId;
    }

    // ✅ PRACTICE MODE
    else if (subjectId && subjectId !== "all") {
      query.subjectId = subjectId;
      finalSubjectId = subjectId;
    }

    /* ================= SEARCH ================= */

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    /* ================= FETCH QUESTIONS ================= */

    const questions = await Question.find(query)
      .sort({ createdAt: 1 })
      .lean();

    /* ================= REMOVE ANSWERS ================= */

    const sanitized = questions.map((q) => ({
      _id: q._id,
      questionId: q.questionId || null,
      type: q.type,
      title: q.title,
      code: q.code || null,
      options: q.options || [],
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks || 0,
      correctAnswer: q.correctAnswer || 0,
      explanation: q.explanation || null
    }));

    /* ================= SUBJECT NAME (FIXED) ================= */

    if (finalSubjectId) {
      const subject = await Subject.findById(finalSubjectId).lean();

      subjectName =
        subject?.displayName ||
        subject?.name ||
        null;
    }

    /* ================= RESPONSE ================= */

    res.json({
      mode: setId ? "exam" : "practice",
      subjectName,
      total: sanitized.length,
      questions: sanitized,
    });

  } catch (err) {
    next(err);
  }
};
/* ===================================================
   DELETE QUESTION (SAFE + ACTIVITY LOG)
   DELETE /api/admin/questions/:id
=================================================== */
exports.deleteQuestion = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    /* ================= FIND QUESTION ================= */
    const question = await Question.findById(id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    /* ================= GET CONTEXT INFO ================= */
    let setName = null;
    let subjectName = null;

    if (question.setId) {
      const set = await Set.findById(question.setId).lean();
      setName = set?.setName || null;

      const subject = await Subject.findById(set?.subjectId).lean();
      subjectName = subject?.displayName || subject?.name || null;
    }
    else if (question.subjectId) {
      const subject = await Subject.findById(question.subjectId).lean();
      subjectName = subject?.displayName || subject?.name || null;
    }

    /* ================= DELETE ================= */
    await question.deleteOne();

    /* ================= ACTIVITY LOG ================= */
    try {
      await logActivity(db, {
        actorType: "ADMIN",
        action: ACTIVITY.QUESTION.DELETED,
        entityType: "QUESTION",
        entityId: question._id,
        message: "Question deleted",
        metadata: {
          title: question.title,
          type: question.type,
          subject: subjectName,
          set: setName,
        },
      });
    } catch (logErr) {
      console.error("Activity log failed:", logErr);
    }

    /* ================= RESPONSE ================= */
    res.json({
      message: "🗑️ Question deleted successfully",
      deletedQuestion: {
        id: question._id,
        title: question.title,
        subject: subjectName,
        set: setName,
      },
    });

  } catch (err) {
    next(err);
  }
};
