const express = require("express");
const router = express.Router();

const subcategoryController = require("../controllers/subcategory.controller");

/* ======================================================
   PUBLIC ROUTES (USER SIDE)
====================================================== */

// Get subcategories under a category
// example: /api/subcategories?categoryId=123
router.get("/", subcategoryController.getSubcategories);

// Get subcategory with its sections (tree step 2)
router.get("/:id/tree", subcategoryController.getSubcategoryTree);

// Get single subcategory
router.get("/:id", subcategoryController.getSingleSubcategory);


/* ======================================================
   ADMIN ROUTES
   Prefix in app.js: /api/admin/subcategories
====================================================== */

// Create subcategory
router.post("/", subcategoryController.createSubcategory);

// Update subcategory
router.put("/:id", subcategoryController.updateSubcategory);

// Delete subcategory
router.delete("/:id", subcategoryController.deleteSubcategory);

module.exports = router;
