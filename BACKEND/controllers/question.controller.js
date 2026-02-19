const { ObjectId } = require("mongodb");
const logActivity = require("../utils/activityLogger");
const ACTIVITY = require("../utils/activityTypes");
const Subject = require("../models/Subject");
const Question = require("../models/Question");
const SetModel = require("../models/Set");
const Section = require("../models/Section");
const Subcategory = require("../models/Subcategory");
const Category = require("../models/Category");
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

    const set = await SetModel.findById(setId);
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
      code: type === "output" ? code : null,

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
   IMPORT QUESTIONS FROM JSON (FULL SYSTEM IMPORT)
   POST /api/admin/questions/import
=================================================== */
exports.importQuestions = async (req, res, next) => {
  try {
    const db = req.app.locals.db;

  

    const logActivity = require("../utils/activityLogger");
    const ACTIVITY = require("../utils/activityTypes");

    /* ================= FILE CHECK ================= */
    if (!req.file)
      return res.status(400).json({ message: "JSON file required" });

    let parsed;
    try {
      parsed = JSON.parse(req.file.buffer.toString());
    } catch {
      return res.status(400).json({ message: "Invalid JSON file" });
    }

    /* ================= REQUIRED ROOT FIELDS ================= */
    const required = ["category", "subcategory", "section", "subject", "set", "questions"];
    for (const key of required) {
      if (!parsed[key])
        return res.status(400).json({ message: `Missing field: ${key}` });
    }

    /* ================= CATEGORY ================= */
    let category = await Category.findOne({ name: parsed.category.toLowerCase() });
    if (!category) {
      category = await Category.create({
        name: parsed.category.toLowerCase(),
        displayName: parsed.category,
      });

      await logActivity(db, {
        actorType: "ADMIN",
        action: ACTIVITY.CATEGORY_CREATED || "CATEGORY_CREATED",
        entityType: "CATEGORY",
        entityId: category._id,
        message: `Auto created category: ${parsed.category}`,
      });
    }

    /* ================= SUBCATEGORY ================= */
    let subcategory = await Subcategory.findOne({
      categoryId: category._id,
      name: parsed.subcategory.toLowerCase(),
    });

    if (!subcategory) {
      subcategory = await Subcategory.create({
        categoryId: category._id,
        name: parsed.subcategory.toLowerCase(),
        displayName: parsed.subcategory,
      });
    }

    /* ================= SECTION ================= */
    let section = await Section.findOne({
      subcategoryId: subcategory._id,
      name: parsed.section.toLowerCase(),
    });

    if (!section) {
      section = await Section.create({
        subcategoryId: subcategory._id,
        name: parsed.section.toLowerCase(),
        displayName: parsed.section,
      });
    }

    /* ================= SUBJECT ================= */
    let subject = await Subject.findOne({
      sectionId: section._id,
      name: parsed.subject.toLowerCase(),
    });

    if (!subject) {
      subject = await Subject.create({
        sectionId: section._id,
        name: parsed.subject.toLowerCase(),
        displayName: parsed.subject,
      });

      await logActivity(db, {
        actorType: "ADMIN",
        action: ACTIVITY.SUBJECT.CREATED,
        entityType: "SUBJECT",
        entityId: subject._id,
        message: `Auto created subject: ${parsed.subject}`,
      });
    }

    /* ================= SET ================= */
    let set = await SetModel.findOne({
      subjectId: subject._id,
      setName: parsed.set,
    });

    if (!set) {
      set = await SetModel.create({
        subjectId: subject._id,
        setName: parsed.set,
        duration: parsed.duration || 15,
        instructions: parsed.instructions || [
          "Each question carries 1 mark",
          "Negative marking applicable",
          "Do not refresh the exam",
        ],
      });
    }

    /* ================= QUESTIONS VALIDATION ================= */
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0)
      return res.status(400).json({ message: "No questions found" });

    const validDocs = [];
    const skipped = [];

    parsed.questions.forEach((q, index) => {

      if (!q.title) {
        skipped.push({ index, reason: "Missing title" });
        return;
      }

      /* ---------- TYPE VALIDATION ---------- */
      const type = q.type || "mcq";

      if (type === "mcq") {
        if (!Array.isArray(q.options) || q.options.length !== 4 ||
            typeof q.correctAnswer !== "number") {
          skipped.push({ index, reason: "Invalid MCQ format" });
          return;
        }
      }

      if (type === "output") {
        if (!q.code || !q.code.content || !Array.isArray(q.options)) {
          skipped.push({ index, reason: "Invalid output question" });
          return;
        }
      }

      if (type === "integer") {
        if (q.correctAnswer === undefined) {
          skipped.push({ index, reason: "Invalid integer question" });
          return;
        }
      }

      validDocs.push({
        setId: set._id,
        subjectId: subject._id,
        questionId: q.id || null,
        language: q.language || null,
        type,
        title: q.title,
        code: type === "output" ? q.code : null,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,
      });
    });

    if (!validDocs.length)
      return res.status(400).json({ message: "No valid questions to import" });

    /* ================= INSERT QUESTIONS ================= */
    const inserted = await Question.insertMany(validDocs);

    /* ================= ACTIVITY LOG ================= */
    await logActivity(db, {
      actorType: "ADMIN",
      action: ACTIVITY.QUESTION.BULK_IMPORT,
      entityType: "QUESTION",
      entityId: null,
      message: `Imported ${inserted.length} questions into set "${set.setName}"`,
      metadata: {
        category: category.displayName,
        subcategory: subcategory.displayName,
        section: section.displayName,
        subject: subject.displayName,
        set: set.setName,
      },
    });

    /* ================= RESPONSE ================= */
    res.status(201).json({
      message: "✅ Questions imported successfully",
      category: category.displayName,
      subcategory: subcategory.displayName,
      section: section.displayName,
      subject: subject.displayName,
      set: set.setName,
      inserted: inserted.length,
      skipped: skipped.length,
    });

  } catch (err) {
    next(err);
  }
};

/* ===================================================
   UPDATE QUESTION (ALL TYPES + SET SUPPORT + LOG)
   PUT /api/admin/questions/:id
=================================================== */
exports.updateQuestion = async (req, res, next) => {
  try {
    const Question = require("../models/Question");
    const SetModel = require("../models/Set");
    const logActivity = require("../utils/activityLogger");
    const ACTIVITY = require("../utils/activityTypes");

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
      const set = await SetModel.findById(setId);
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
      const set = await SetModel.findById(question.setId).lean();
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
        const set = await SetModel.findById(q.setId).lean();
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

    /* ================= MODE SELECT ================= */

    // EXAM MODE (highest priority)
    if (setId) {
      const set = await SetModel.findById(setId);
      if (!set || !set.isPublished)
        return res.status(404).json({ message: "Exam not available" });

      query.setId = setId;
    }

    // PRACTICE MODE
    else if (subjectId && subjectId !== "all") {
      query.subjectId = subjectId;
    }

    // SEARCH
    if (search)
      query.title = { $regex: search, $options: "i" };

    /* ================= FETCH QUESTIONS ================= */

    const questions = await Question.find(query)
      .sort({ createdAt: 1 })
      .lean();

    /* ================= REMOVE ANSWERS ================= */

    const sanitized = questions.map(q => {
      return {
        _id: q._id,
        questionId: q.questionId || null,
        type: q.type,
        title: q.title,
        code: q.code || null,
        options: q.options || [],
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,
        difficulty: q.difficulty || "medium"
      };
    });

    /* ================= SUBJECT NAME ================= */

    let subjectName = null;
    if (subjectId) {
      const subject = await Subject.findById(subjectId).lean();
      subjectName = subject?.displayName || subject?.name || null;
    }

    /* ================= RESPONSE ================= */

    res.json({
      mode: setId ? "exam" : "practice",
      subjectName,
      total: sanitized.length,
      questions: sanitized
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
      const set = await SetModel.findById(question.setId).lean();
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
