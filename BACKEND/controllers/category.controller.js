const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");

/* =====================================================
   CREATE CATEGORY (ADMIN)
   POST /api/admin/categories
===================================================== */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, displayName, icon, order } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        message: "name and displayName required.",
      });
    }

    const normalized = name.trim().toLowerCase();

    const exists = await Category.findOne({ name: normalized });
    if (exists) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: normalized,
      displayName,
      icon: icon || "📚",
      order: order || 0,
    });

    res.status(201).json({
      message: "✅ Category created",
      category,
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   GET ALL CATEGORIES (PUBLIC)
   GET /api/categories
===================================================== */
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({})
      .sort({ order: 1, createdAt: -1 });

    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   GET SINGLE CATEGORY
   GET /api/categories/:id
===================================================== */
exports.getSingleCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json(category);
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   UPDATE CATEGORY
   PUT /api/admin/categories/:id
===================================================== */
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, displayName, icon, order } = req.body;

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.toLowerCase(),
        displayName,
        icon,
        order,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Category not found" });

    res.json({
      message: "Category updated",
      category: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   DELETE CATEGORY
   DELETE /api/admin/categories/:id
===================================================== */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // also delete subcategories inside it
    await Subcategory.deleteMany({ categoryId: id });

    await Category.findByIdAndDelete(id);

    res.json({
      message: "🗑️ Category and related subcategories deleted",
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   GET CATEGORY TREE (VERY IMPORTANT API)
   Used for sidebar navigation
   GET /api/categories/tree
===================================================== */
exports.getCategoryTree = async (req, res, next) => {
  try {
    const categories = await Category.find({}).lean();
    const subcategories = await Subcategory.find({}).lean();

    const map = {};

    categories.forEach(cat => {
      map[cat._id] = {
        ...cat,
        subcategories: [],
      };
    });

    subcategories.forEach(sub => {
      if (map[sub.categoryId]) {
        map[sub.categoryId].subcategories.push(sub);
      }
    });

    res.json(Object.values(map));
  } catch (err) {
    next(err);
  }
};
