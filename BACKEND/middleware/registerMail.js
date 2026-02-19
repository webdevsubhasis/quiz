const nodemailer = require("nodemailer");

/* 📮 Transporter */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * 🎉 Send Welcome Email after Registration
 * @param {string} email
 * @param {string} name
 */
async function sendWelcomeEmail(email, name) {
  try {
    const loginUrl = `${process.env.FrontEnd_BASE_URL}/login`;

    await transporter.sendMail({
      from: `"SM Quiz Team" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "🎉 Welcome to SM Quiz Platform",
      text: `Welcome ${name}! Your account has been created successfully.
Login here: ${loginUrl}`,
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 520px;
          margin: auto;
          padding: 24px;
          border-radius: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        ">

          <h2 style="color:#2563eb; margin-bottom:10px">
            🎉 Welcome to SM Quiz!
          </h2>

          <p style="font-size:16px; color:#111">
            Hi <b>${name}</b>,
          </p>

          <p style="font-size:15px; color:#444; line-height:1.6">
            Your account has been successfully created on the
            <b>SM Quiz Platform</b>.
          </p>

          <div style="
            background:#ecfeff;
            border-left:4px solid #06b6d4;
            padding:12px;
            margin:20px 0;
            font-size:14px;
            color:#065f46;
          ">
            🚀 You can now log in, attempt exams, and track your progress.
          </div>

          <div style="text-align:center; margin:30px 0;">
            <a
              href="${loginUrl}"
              style="
                display:inline-block;
                padding:14px 28px;
                background:#2563eb;
                color:#ffffff;
                text-decoration:none;
                border-radius:10px;
                font-weight:600;
                font-size:15px;
              "
            >
              🔐 Login to Your Account
            </a>
          </div>

          <p style="font-size:14px; color:#555">
            If you did not register on our platform, please ignore this email.
          </p>

          <hr style="margin:24px 0"/>

          <p style="font-size:12px; color:#888">
            Regards,<br/>
            <b>SM Quiz Team</b>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("WELCOME EMAIL ERROR:", error);
    throw new Error("Failed to send welcome email");
  }
}

module.exports = { sendWelcomeEmail };
