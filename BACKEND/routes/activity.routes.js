const express = require("express");
const router = express.Router();
const activityCtrl = require("../controllers/activity.controller");

// Optional (recommended later)
// const auth = require("../middleware/auth.middleware");
// router.use(auth.verifyToken);
// router.use(auth.requireAdmin);

router.get("/activities", activityCtrl.getAdminActivities);
router.put("/activities/read", activityCtrl.markActivitiesRead);

module.exports = router;
