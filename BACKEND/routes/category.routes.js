const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");

/* ======================================================
   PUBLIC ROUTES (User Side)
====================================================== */

// Get all categories (homepage cards)
router.get("/", categoryController.getAllCategories);

// Get category navigation tree (category → subcategory)
router.get("/tree", categoryController.getCategoryTree);

// Get single category
router.get("/:id", categoryController.getSingleCategory);


/* ======================================================
   ADMIN ROUTES
   Prefix in app.js: /api/admin/categories
====================================================== */

// Create category
router.post("/", categoryController.createCategory);

// Update category
router.put("/:id", categoryController.updateCategory);

// Delete category
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
