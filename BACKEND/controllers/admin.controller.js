const Subject = require("../models/Subject");
const Question = require("../models/Question");
const User = require("../models/User");


/* ===================================================
   GET ADMIN DASHBOARD STATS
=================================================== */
exports.getStats = async (req, res, next) => {
  try {
    const subjects = await Subject.countDocuments();
    const questions = await Question.countDocuments();
    const users = await User.countDocuments();
    // const results = await Result.countDocuments();

    res.json({ subjects, questions, users });
  } catch (err) {
    next(err);
  }
};


