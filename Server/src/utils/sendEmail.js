const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp, type = "signup") => {
  const isSignup = type === "signup";
  const subject = isSignup ? "Verify your DevTinder account" : "Reset your DevTinder password";
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; min-width: 320px;">
      <h2 style="color: #ec4899; text-align: center;">DevTinder 🚀</h2>
      <p style="font-size: 16px; color: #334155;">Hello,</p>
      <p style="font-size: 16px; color: #334155;">
        ${isSignup ? "Thank you for signing up for DevTinder! Use the following OTP to verify your email address and complete your registration." : "We received a request to reset your password. Use the following OTP to verify your identity and set a new password."}
      </p>
      <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; color: #0f172a; letter-spacing: 4px;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #64748b;">
        This code will expire in 5 minutes. If you did not request this, please ignore this email.
      </p>
      <p style="font-size: 16px; color: #334155;">Happy assembling,<br/>The DevTinder Team</p>
    </div>
  `;

  const mailOptions = {
    from: `"DevTinder" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent safely to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email verification.");
  }
};

module.exports = { sendOTPEmail };
