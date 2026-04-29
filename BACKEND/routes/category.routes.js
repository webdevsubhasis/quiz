const express = require("express");
const router = express.Router();

const categoryCtrl = require("../controllers/category.controller");

// 🔥 HOME
router.get("/with-subjects", categoryCtrl.getCategoriesWithSubjects);

// 🔥 VIEW ALL PAGE
router.get("/:id", categoryCtrl.getCategoryById);

module.exports = router;