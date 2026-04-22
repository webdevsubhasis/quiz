const express = require("express");
const router = express.Router();
const subjectCtrl = require("../controllers/subject.controller");

/* SUBJECT MANAGEMENT (ADMIN) */
router.get("/", subjectCtrl.getAllSubjects);
router.get("/:id", subjectCtrl.getSingleSubject);
router.post("/", subjectCtrl.addSubject);
router.put("/:id", subjectCtrl.editSubject);
router.delete("/:id", subjectCtrl.deleteSubject);

module.exports = router;
