const Subject = require("../models/Subject");
const Section = require("../models/Section");
const Question = require("../models/Question");
const SetModel = require("../models/Set");
const logActivity = require("../utils/activityLogger");
const ACTIVITY = require("../utils/activityTypes");

/* ===================================================
   ADD SUBJECT
   POST /api/admin/subjects
=================================================== */
exports.addSubject = async (req, res, next) => {
  try {
    const { sectionId, name, description, difficulty, icon, order } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ message: "Subject name is required" });

    // New subjects must belong to section
    if (!sectionId)
      return res.status(400).json({ message: "sectionId is required" });

    // ensure section exists
    const section = await Section.findById(sectionId);
    if (!section)
      return res.status(404).json({ message: "Section not found" });

    const normalizedName = name.trim().toLowerCase();

    // unique inside section
    const existing = await Subject.findOne({
      sectionId,
      name: normalizedName,
    });

    if (existing)
      return res.status(409).json({
        message: "⚠️ Subject already exists in this section!",
      });

    const subject = await Subject.create({
      sectionId,
      name: normalizedName,
      displayName: name.trim(),
      description: description?.trim() || "",
      difficulty: difficulty || "medium",
      icon: icon || "📘",
      order: order || 0,
    });

    await logActivity(req.app.locals.db, {
      actorType: "ADMIN",
      action: ACTIVITY.SUBJECT.CREATED,
      entityType: "SUBJECT",
      entityId: subject._id,
      message: `Subject "${name}" created`,
      metadata: { subjectId: subject._id },
    });

    res.status(201).json({
      message: "📘 Subject created successfully!",
      subject,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   EDIT SUBJECT
=================================================== */
exports.editSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, difficulty, icon, order, isActive } = req.body;

    const subject = await Subject.findById(id);
    if (!subject)
      return res.status(404).json({ message: "Subject not found" });

    if (name) {
      const normalized = name.trim().toLowerCase();

      const duplicate = await Subject.findOne({
        sectionId: subject.sectionId,
        name: normalized,
        _id: { $ne: id },
      });

      if (duplicate)
        return res.status(409).json({
          message: "Another subject with same name exists in this section",
        });

      subject.name = normalized;
      subject.displayName = name.trim();
    }

    if (description !== undefined) subject.description = description;
    if (difficulty) subject.difficulty = difficulty;
    if (icon) subject.icon = icon;
    if (order !== undefined) subject.order = order;
    if (isActive !== undefined) subject.isActive = isActive;

    subject.updatedAt = new Date();
    await subject.save();

    await logActivity(req.app.locals.db, {
      actorType: "ADMIN",
      action: ACTIVITY.SUBJECT.UPDATED,
      entityType: "SUBJECT",
      entityId: subject._id,
      message: `Subject updated: ${subject.displayName}`,
      metadata: { subjectId: subject._id },
    });

    res.json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET SUBJECTS BY SECTION (MOST USED API)
   GET /api/subjects?sectionId=
=================================================== */
exports.getSubjects = async (req, res, next) => {
  try {
    const { sectionId, search } = req.query;

    const query = { isActive: true };

    if (sectionId) query.sectionId = sectionId;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
      ];
    }

    const subjects = await Subject.find(query).sort({ order: 1, createdAt: -1 });

    res.json({ subjects });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET SINGLE SUBJECT WITH SETS COUNT
   GET /api/subjects/:id
=================================================== */
exports.getSingleSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).lean();
    if (!subject)
      return res.status(404).json({ message: "Subject not found" });

    const totalSets = await SetModel.countDocuments({ subjectId: subject._id });
    const totalQuestions = await Question.countDocuments({ subjectId: subject._id });

    res.json({
      ...subject,
      totalSets,
      totalQuestions,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   ADMIN LIST (SEARCH + PAGINATION)
=================================================== */
exports.getAllSubjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { displayName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Subject.countDocuments(query);

    const subjects = await Subject.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      subjects,
      totalSubjects: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   DELETE SUBJECT
=================================================== */
exports.deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject)
      return res.status(404).json({ message: "Subject not found" });

    // delete sets and questions
    const sets = await SetModel.find({ subjectId: id });

    for (const set of sets) {
      await Question.deleteMany({ setId: set._id });
    }

    await SetModel.deleteMany({ subjectId: id });

    // legacy questions
    await Question.deleteMany({ subjectId: id });

    await subject.deleteOne();

    await logActivity(req.app.locals.db, {
      actorType: "ADMIN",
      action: ACTIVITY.SUBJECT.DELETED,
      entityType: "SUBJECT",
      entityId: subject._id,
      message: `Subject deleted: ${subject.displayName}`,
      metadata: { subjectId: subject._id },
    });

    res.json({ message: "🗑️ Subject and related data deleted" });
  } catch (err) {
    next(err);
  }
};
