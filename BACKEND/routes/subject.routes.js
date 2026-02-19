const express = require("express");
const router = express.Router();
const subjectCtrl = require("../controllers/subject.controller");

/* SUBJECT MANAGEMENT (ADMIN) */
router.post("/subjects", subjectCtrl.addSubject);
router.put("/subjects/:id", subjectCtrl.editSubject);
router.get("/subjects/:id", subjectCtrl.getSingleSubject);
router.get("/subjects", subjectCtrl.getAllSubjects);
router.delete("/subjects/:id", subjectCtrl.deleteSubject);

module.exports = router;
