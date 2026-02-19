const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/section.controller");

/* ================= PUBLIC ================= */

// list sections under subcategory
router.get("/", sectionController.getSections);

// get subjects under section
router.get("/:id/subjects", sectionController.getSectionTree);

// get single section details
router.get("/:id", sectionController.getSingleSection);


/* ================= ADMIN ================= */

router.post("/", sectionController.createSection);
router.put("/:id", sectionController.updateSection);
router.delete("/:id", sectionController.deleteSection);

module.exports = router;
