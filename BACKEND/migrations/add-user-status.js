require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/db");

async function runMigration() {
  try {
    await connectDB();
    console.log("✅ DB connected");

    const result = await User.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: "" }
        ]
      },
      { $set: { status: "Active" } }
    );

    console.log("Matched:", result.matchedCount);
    console.log("Modified:", result.modifiedCount);

    process.exit(0);

  } catch (err) {
    console.error("❌ Migration failed", err);
    process.exit(1);
  }
}

runMigration();
