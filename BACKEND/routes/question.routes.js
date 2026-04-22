const express = require("express");
const router = express.Router();
const questionCtrl = require("../controllers/question.controller");
const upload = require("../middleware/uploadJson");

/* FRONTEND */
router.get("/public", questionCtrl.getFrontendQuestions);

/* ADMIN */
router.post("/", questionCtrl.addQuestion);
router.post("/import", (req, res, next) => {
    upload.single("file")(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                message: err.message || "File upload error",
            });
        }
        next();
    });
}, questionCtrl.importQuestions);
router.put("/:id", questionCtrl.updateQuestion);
router.get("/:id", questionCtrl.getSingleQuestion);
router.get("/", questionCtrl.getAdminQuestions);
router.delete("/:id", questionCtrl.deleteQuestion);



module.exports = router;