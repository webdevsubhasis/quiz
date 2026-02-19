const generateResultPDF = require("../utils/resultPdf");
const { sendResultEmailWithPDF } = require("../middleware/mailer");



/* ===================================================
   EMAIL RESULT PDF AGAIN
=================================================== */
exports.emailResultPDF = async (req, res, next) => {
  try {
    const {
      email,
      userName,
      subjectName,
      questions,
      answers,
      total,
      attempted,
      correct,
      wrong,
      score,
      percentage,
      timeTakenSec,
    } = req.body;

    if (!email || !subjectName || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid result data" });
    }

    const pdfBuffer = await generateResultPDF({
      userName,
      email,
      subjectName,
      questions,
      answers,
      total,
      attempted,
      correct,
      wrong,
      score,
      percentage,
      timeTakenSec,
    });

    await sendResultEmailWithPDF(email, pdfBuffer, subjectName);

    res.json({ message: "📧 Result emailed successfully" });
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET USER RESULTS HISTORY
=================================================== */
exports.getUserResults = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const results = await Result.find({ userId })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json(results);
  } catch (err) {
    next(err);
  }
};
