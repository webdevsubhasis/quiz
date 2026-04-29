const mongoose = require("mongoose");
const SetModel = require("../models/set"); // ✅ FIXED NAME
const Attempt = require("../models/Attempt");
const Question = require("../models/Question"); // ✅ add this

// ================= GET SETS BY SUBJECT =================

exports.getSetsBySubject = async (req, res) => {
  try {
    const sets = await SetModel.find({
      subjectId: req.params.subjectId,
    })
      .sort({ order: 1 })
      .lean();

    // 🔥 add question count
    const setsWithCount = await Promise.all(
      sets.map(async (set) => {
        const count = await Question.countDocuments({
          setId: set._id,
        });

        return {
          ...set,
          questionCount: count,
        };
      })
    );

    res.json(setsWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= SUBMIT TEST =================
exports.submitSet = async (req, res) => {
  try {
    const { setId, score, total } = req.body;

    const userId = req.user?.id || "000000000000000000000001";

    // save attempt
    await Attempt.create({
      userId,
      setId,
      score,
      total,
    });

    // increase popularity
    await SetModel.findByIdAndUpdate(setId, {
      $inc: { attemptCount: 1 },
    });

    res.json({ message: "Submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ================= RECENT (NO DUPLICATES) =================
exports.getRecentSets = async (req, res) => {
  try {
    const userId = req.user?.id || "000000000000000000000001";

    const attempts = await Attempt.find({ userId })
      .sort({ createdAt: -1 })
      .populate("setId", "displayName name") // ✅ FIXED
      .lean();

    const seen = new Set();   // ✅ NOW WORKS
    const result = [];

    for (const a of attempts) {
      if (!a.setId) continue;

      const id = a.setId._id.toString();

      if (!seen.has(id)) {
        seen.add(id);

        result.push({
          setId: a.setId._id,
          title: a.setId.displayName || a.setId.name || "Untitled", // ✅ FIXED
          score: a.score,
          total: a.total,
        });
      }

      if (result.length === 5) break;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




/* =====================================================
   GET POPULAR SETS
===================================================== */
exports.getPopularSets = async (req, res) => {
  try {
    const sets = await SetModel.find({
      attemptCount: { $gt: 0 },
    })
      .sort({ attemptCount: -1 })
      .limit(5)
      .populate("subjectId", "displayName")
      .select("displayName name attemptCount subjectId")
      .lean();

    const result = sets.map((s) => ({
      setId: s._id,
      setType: s.displayName || s.name || "Untitled",
      subject: s.subjectId?.displayName || "Unknown",
      students: s.attemptCount,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Popular Sets Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   GET DASHBOARD (RECENT + POPULAR)
===================================================== */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;

    let recentExams = [];

    /* ================= RECENT (ONLY IF LOGGED IN) ================= */
    if (userId) {
      recentExams = await Attempt.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$setId",
            latestAttempt: { $first: "$$ROOT" },
          },
        },
        { $limit: 5 },
        {
          $lookup: {
            from: "sets",
            localField: "_id",
            foreignField: "_id",
            as: "set",
          },
        },
        { $unwind: "$set" },
        {
          $lookup: {
            from: "subjects",
            localField: "set.subjectId",
            foreignField: "_id",
            as: "subject",
          },
        },
        { $unwind: "$subject" },
        {
          $project: {
            _id: 0,
            setId: "$_id",
            setType: {
              $ifNull: ["$set.displayName", "$set.name"],
            },
            subject: "$subject.displayName",
            score: "$latestAttempt.score",
            total: "$latestAttempt.total",
          },
        },
      ]);
    }

    /* ================= POPULAR (ALWAYS) ================= */
    const sets = await SetModel.find({
      attemptCount: { $gt: 0 },
    })
      .sort({ attemptCount: -1 })
      .limit(5)
      .populate("subjectId", "displayName")
      .select("displayName name attemptCount subjectId")
      .lean();

    const popularExams = sets.map((s) => ({
      setId: s._id,
      setType: s.displayName || s.name || "Untitled",
      subject: s.subjectId?.displayName || "Unknown",
      students: s.attemptCount,
    }));

    res.json({
      recentExams,
      popularExams,
    });

  } catch (err) {
    console.error("❌ Dashboard Error:", err);
    res.status(500).json({ message: err.message });
  }
};