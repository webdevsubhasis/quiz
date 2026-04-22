const SetModel = require("../models/set"); // ✅ FIXED NAME
const Attempt = require("../models/Attempt");


// ================= GET SETS BY SUBJECT =================
exports.getSetsBySubject = async (req, res) => {
  try {
    const sets = await SetModel.find({
      subjectId: req.params.subjectId,
    })
      .sort({ order: 1 })
      .lean();

    res.json(sets);
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


// ================= POPULAR (ONLY REAL DATA) =================
exports.getPopularSets = async (req, res) => {
  try {
    const sets = await SetModel.find({
      attemptCount: { $gt: 0 },   // ✅ FIXED
    })
      .sort({ attemptCount: -1 })
      .limit(5)
      .select("displayName name attemptCount") // ✅ FIXED
      .lean();

    const result = sets.map((s) => ({
      setId: s._id,
      title: s.displayName || s.name || "Untitled", // ✅ FIXED
      students: s.attemptCount,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= DASHBOARD =================
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || "000000000000000000000001";

    // ---------- RECENT ----------
    const attempts = await Attempt.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "setId",
        select: "displayName name subjectId",
        populate: {
          path: "subjectId",
          select: "displayName",
        },
      })
      .lean();

    const seen = new Set();
    const recentExams = [];

    for (const a of attempts) {
      if (!a.setId) continue;
      console.log("check subject name", a);

      const id = a.setId._id.toString();

      if (!seen.has(id)) {
        seen.add(id);

        recentExams.push({
          setId: a.setId._id,
          setType: a.setId.displayName || a.setId.name || "Untitled",
          subject: a.setId.subjectId?.displayName || "Unknown",
          score: a.score,
          total: a.total,
        });
      }

      if (recentExams.length === 5) break;
    }

    // ---------- POPULAR ----------
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
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};