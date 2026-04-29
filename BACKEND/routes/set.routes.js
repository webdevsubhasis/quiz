const express = require("express");
const router = express.Router();
const setController = require("../controllers/set.controller");
const { verifyToken } = require("../middleware/auth.middleware"); // ✅ IMPORT

// 🔐 PROTECTED ROUTES
router.post("/submit", verifyToken, setController.submitSet);
router.get("/recent", verifyToken, setController.getRecentSets);
const optionalAuth = (req, res, next) => {
    const token =
        req.headers.authorization?.split(" ")[1];

    if (!token) return next();

    try {
        const decoded = require("jsonwebtoken").verify(
            token,
            process.env.JWT_SECRET
        );
        req.user = decoded;
    } catch (err) {
        // ignore invalid token
    }

    next();
};

router.get("/dashboard", optionalAuth, setController.getDashboard);

// PUBLIC
router.get("/popular", setController.getPopularSets);

// existing
router.get("/:subjectId", setController.getSetsBySubject);

module.exports = router;