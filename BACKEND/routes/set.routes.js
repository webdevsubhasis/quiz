const express = require("express");
const router = express.Router();
const setController = require("../controllers/set.controller");




// new
router.post("/submit", setController.submitSet);
router.get("/recent", setController.getRecentSets);
router.get("/popular", setController.getPopularSets);
router.get("/dashboard", setController.getDashboard);

// existing
router.get("/:subjectId", setController.getSetsBySubject);

module.exports = router;