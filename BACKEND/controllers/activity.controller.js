const Activity = require("../models/Activity");

/* ===================================================
   GET ADMIN ACTIVITIES (Latest 30)
=================================================== */
exports.getAdminActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(activities);
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   MARK ALL ACTIVITIES AS READ
=================================================== */
exports.markActivitiesRead = async (req, res, next) => {
  try {
    await Activity.updateMany({ read: false }, { $set: { read: true } });

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};
