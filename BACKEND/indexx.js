require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* ================= MIDDLEWARE ================= */

// CORS (allow frontend + postman)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// Body parser (VERY IMPORTANT)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= ROUTES IMPORT ================= */

// auth
const authRoutes = require("./routes/auth.routes");

// user routes
const categoryRoutes = require("./routes/category.routes");
const subcategoryRoutes = require("./routes/subcategory.routes");
const setRoutes = require("./routes/set.routes");
const sectionRoutes = require("./routes/section.routes");
const subjectRoutes = require("./routes/subject.routes");
const questionRoutes = require("./routes/question.routes");
const resultRoutes = require("./routes/result.routes");

// admin routes
const adminRoutes = require("./routes/admin.routes");
const activityRoutes = require("./routes/activity.routes");

/* ================= PUBLIC ROUTES ================= */

app.use("/api", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/sets", setRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);

/* ================= ADMIN ROUTES ================= */

app.use("/api/admin", adminRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/subcategories", subcategoryRoutes);
app.use("/api/admin/sections", sectionRoutes);
app.use("/api/admin/sets", setRoutes);
app.use("/api/admin/subjects", subjectRoutes);
app.use("/api/admin/questions", questionRoutes);
app.use("/api/admin/activity", activityRoutes);

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({
    message: err.message || "Internal server error"
  });
});

/* ================= START SERVER ================= */

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // access raw mongo if needed
    app.locals.db = mongoose.connection.db;

    app.listen(8081, () => {
      console.log("🚀 Server running on http://localhost:8081");
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

startServer();
