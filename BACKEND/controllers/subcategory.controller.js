const Subcategory = require("../models/Subcategory");
const Section = require("../models/Section");

/* =====================================================
   CREATE SUBCATEGORY (ADMIN)
   POST /api/admin/subcategories
===================================================== */
exports.createSubcategory = async (req, res, next) => {
  try {
    const { categoryId, name, displayName, order } = req.body;

    if (!categoryId || !name || !displayName) {
      return res.status(400).json({
        message: "categoryId, name and displayName required",
      });
    }

    const normalized = name.trim().toLowerCase();

    const exists = await Subcategory.findOne({
      categoryId,
      name: normalized,
    });

    if (exists) {
      return res.status(409).json({
        message: "Subcategory already exists in this category",
      });
    }

    const subcategory = await Subcategory.create({
      categoryId,
      name: normalized,
      displayName,
      order: order || 0,
    });

    res.status(201).json({
      message: "✅ Subcategory created",
      subcategory,
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   GET SUBCATEGORIES BY CATEGORY
   GET /api/subcategories?categoryId=
===================================================== */
exports.getSubcategories = async (req, res, next) => {
  try {
    const { categoryId } = req.query;

    if (!categoryId)
      return res.status(400).json({ message: "categoryId required" });

    const subcategories = await Subcategory.find({ categoryId })
      .sort({ order: 1, createdAt: -1 });

    res.json({ subcategories });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   GET SINGLE SUBCATEGORY
   GET /api/subcategories/:id
===================================================== */
exports.getSingleSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory)
      return res.status(404).json({ message: "Subcategory not found" });

    res.json(subcategory);
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   UPDATE SUBCATEGORY
   PUT /api/admin/subcategories/:id
===================================================== */
exports.updateSubcategory = async (req, res, next) => {
  try {
    const { name, displayName, order } = req.body;

    const updated = await Subcategory.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.toLowerCase(),
        displayName,
        order,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Subcategory not found" });

    res.json({
      message: "Subcategory updated",
      subcategory: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   DELETE SUBCATEGORY
   DELETE /api/admin/subcategories/:id
===================================================== */
exports.deleteSubcategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // delete sections inside this subcategory
    await Section.deleteMany({ subcategoryId: id });

    await Subcategory.findByIdAndDelete(id);

    res.json({
      message: "🗑️ Subcategory and related sections deleted",
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   GET SUBCATEGORY TREE (Sidebar Step 2)
   GET /api/subcategories/:id/tree
===================================================== */
exports.getSubcategoryTree = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).lean();
    if (!subcategory)
      return res.status(404).json({ message: "Subcategory not found" });

    const sections = await Section.find({
      subcategoryId: subcategory._id,
    }).lean();

    res.json({
      ...subcategory,
      sections,
    });
  } catch (err) {
    next(err);
  }
};
