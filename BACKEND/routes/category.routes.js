const express = require("express");
const router = express.Router();

const categoryCtrl = require("../controllers/category.controller");

// ✅ API
router.get("/with-subjects", categoryCtrl.getCategoriesWithSubjects);

module.exports = router;