const express = require("express");
const router = express.Router();

const setController = require("../controllers/set.controller");

/* ======================================================
   PUBLIC ROUTES (STUDENT SIDE)
====================================================== */

// Get sets under subject
router.get("/", setController.getSetsBySubject);

// Instruction modal
router.get("/:id", setController.getSetDetails);

// Start exam
router.get("/:id/start", setController.startExam);

// Submit exam
router.post("/:id/submit", setController.submitExam);


/* ======================================================
   ADMIN ROUTES
====================================================== */

// Create set
router.post("/", setController.createSet);

// Update set
router.put("/:id", setController.updateSet);

// Delete set
router.delete("/:id", setController.deleteSet);

// Publish / Unpublish
router.patch("/:id/publish", setController.togglePublishSet);

module.exports = router;
