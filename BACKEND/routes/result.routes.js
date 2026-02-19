const express = require("express");
const router = express.Router();
const resultCtrl = require("../controllers/user.controller");


// email pdf again (optional)
router.post("/result/email", resultCtrl.emailResultPDF);

// get user results
router.get("/results/:userId", resultCtrl.getUserResults);

module.exports = router;
