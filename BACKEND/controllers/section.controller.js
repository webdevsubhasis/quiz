const Section = require("../models/Section");
const Subject = require("../models/Subject");

/* =====================================================
   CREATE SECTION (ADMIN)
   POST /api/admin/sections
===================================================== */
exports.createSection = async (req, res, next) => {
  try {
    const { subcategoryId, name, displayName } = req.body;

    if (!subcategoryId || !name || !displayName) {
      return res.status(400).json({
        message: "subcategoryId, name and displayName required",
      });
    }

    const normalized = name.trim().toLowerCase();

    const exists = await Section.findOne({
      subcategoryId,
      name: normalized,
    });

    if (exists) {
      return res.status(409).json({
        message: "Section already exists in this subcategory",
      });
    }

    const section = await Section.create({
      subcategoryId,
      name: normalized,
      displayName,
    });

    res.status(201).json({
      message: "✅ Section created",
      section,
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   GET SECTIONS BY SUBCATEGORY
   GET /api/sections?subcategoryId=
===================================================== */
exports.getSections = async (req, res, next) => {
  try {
    const { subcategoryId } = req.query;

    if (!subcategoryId)
      return res.status(400).json({ message: "subcategoryId required" });

    const sections = await Section.find({ subcategoryId })
      .sort({ createdAt: -1 });

    res.json({ sections });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   GET SINGLE SECTION
   GET /api/sections/:id
===================================================== */
exports.getSingleSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section)
      return res.status(404).json({ message: "Section not found" });

    res.json(section);
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   UPDATE SECTION
   PUT /api/admin/sections/:id
===================================================== */
exports.updateSection = async (req, res, next) => {
  try {
    const { name, displayName } = req.body;

    const updated = await Section.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.toLowerCase(),
        displayName,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Section not found" });

    res.json({
      message: "Section updated",
      section: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   DELETE SECTION
   DELETE /api/admin/sections/:id
===================================================== */
exports.deleteSection = async (req, res, next) => {
  try {
    const { id } = req.params;

    // delete subjects inside section
    await Subject.deleteMany({ sectionId: id });

    await Section.findByIdAndDelete(id);

    res.json({
      message: "🗑️ Section and related subjects deleted",
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   GET SECTION TREE (for subjects page)
   GET /api/sections/:id/tree
===================================================== */
exports.getSectionTree = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id).lean();
    if (!section)
      return res.status(404).json({ message: "Section not found" });

    const subjects = await Subject.find({
      sectionId: section._id,
      isActive: true,
    }).lean();

    res.json({
      ...section,
      subjects,
    });
  } catch (err) {
    next(err);
  }
};
