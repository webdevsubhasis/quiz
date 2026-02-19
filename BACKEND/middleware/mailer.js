const nodemailer = require("nodemailer");

/* 🔐 Transporter */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/* =====================================================
   📩 SEND OTP EMAIL (EXISTING – UNCHANGED LOGIC)
===================================================== */
async function sendOTPEmail(email, otp) {
  try {
    await transporter.sendMail({
      from: `"Security Team" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "🔐 Password Reset OTP",
      text: `Your OTP is ${otp}. Valid for 50 seconds.`,
      html: `
        <div style="font-family:Arial;max-width:420px;margin:auto">
          <h2 style="color:#2563eb">Password Reset</h2>
          <p>Use the OTP below to reset your password:</p>
          <div style="
            font-size:28px;
            font-weight:bold;
            letter-spacing:6px;
            margin:20px 0;
            color:#111">
            ${otp}
          </div>
          <p style="color:#555">⏱ Valid for <b>50 seconds</b></p>
          <hr/>
          <small style="color:#888">
            If you didn't request this, ignore this email.
          </small>
        </div>
      `,
    });
  } catch (err) {
    console.error("OTP EMAIL ERROR:", err);
    throw new Error("Failed to send OTP email");
  }
}


/* =====================================================
   📊 SEND RESULT EMAIL WITH PDF ATTACHMENT
===================================================== */
async function sendResultEmailWithPDF(email, pdfBuffer, subjectName) {
  try {
    await transporter.sendMail({
      from: `"SM Quiz Team" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `📊 Your ${subjectName} Exam Result`,
      html: `
        <div style="font-family:Arial;max-width:480px;margin:auto">
          <h3>📊 Exam Result</h3>
          <p>
            Your exam result for <b>${subjectName}</b> is attached as a PDF.
          </p>
          <p>
            Keep practicing and improving! 🚀
          </p>
          <hr/>
          <small style="color:#888">
            Regards,<br/>SM Quiz Team
          </small>
        </div>
      `,
      attachments: [
        {
          filename: `${subjectName}_Result.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  } catch (err) {
    console.error("RESULT EMAIL ERROR:", err);
    throw new Error("Failed to send result email");
  }
}

/* =====================================================
   EXPORTS (ALL FEATURES)
===================================================== */
module.exports = {
  sendOTPEmail,
  sendResultEmailWithPDF,
};
