const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const jwtConfig = require("../config/jwt");
const { sendOTPEmail } = require("../middleware/mailer");
const { sendWelcomeEmail } = require("../middleware/registerMail");

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_OTP_ATTEMPTS = 5;

/* ================= UTILS ================= */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/* ================= REGISTER ================= */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log("test", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email, password required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      fullname: name,
      email,
      phone,
      password: hash,
      role: "student",
      createdAt: new Date(),
    });
    sendWelcomeEmail(email, name);
    await user.save();

    res.status(201).json({
      message: "Registration successful",
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email & password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname, // ✅ FIXED
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ================= FORGOT PASSWORD (SEND OTP) ================= */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const otp = generateOTP();

    user.otpHash = hashOTP(otp);
    user.otpExpires = Date.now() + OTP_EXPIRY_MS;
    user.otpAttempts = 0;
    user.otpVerified = false;

    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

/* ================= VERIFY OTP ================= */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otpHash) {
      return res
        .status(400)
        .json({ message: "OTP not generated or already verified" });
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ message: "Too many attempts" });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(410).json({ message: "OTP expired" });
    }

    if (hashOTP(otp) !== user.otpHash) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const resetToken = jwt.sign(
      { email: user.email, purpose: "reset-password" },
      jwtConfig.secret,
      { expiresIn: "5m" }
    );

    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpVerified = true;

    await user.save();

    res.json({ message: "OTP verified", resetToken });
  } catch (err) {
    next(err);
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.secret);
    } catch {
      return res.status(401).json({ message: "Token expired or invalid" });
    }

    if (decoded.purpose !== "reset-password") {
      return res.status(403).json({ message: "Invalid token usage" });
    }

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await User.updateOne(
      { email: decoded.email },
      {
        $set: {
          password: hash,
          otpVerified: true,
        },
      }
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};
