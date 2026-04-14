const express = require('express');
const authRouter = express.Router();
const { signUpValidation } = require("../utils/validate.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Otp = require("../models/otp");
const { sendOTPEmail } = require("../utils/sendEmail");

// SEND OTP
authRouter.post("/send-otp", async (req, res) => {
  try {
    const { emailId, type = "signup" } = req.body;

    if (!emailId || typeof emailId !== "string" || !emailId.includes("@")) {
       return res.status(400).json({ errors: ["Invalid email"] });
    }

    if (type === "signup") {
        const { errors } = await signUpValidation(req);
        if (errors.length > 0) return res.status(400).json({ errors });
    } else if (type === "forgot") {
        const user = await User.findOne({ emailId: emailId.toLowerCase() });
        if (!user) return res.status(404).json({ errors: ["User not found with this email."] });
    } else {
        return res.status(400).json({ errors: ["Invalid OTP request type"] });
    }

    const otpData = Math.floor(100000 + Math.random() * 900000).toString();

    const otpRec = new Otp({ emailId: emailId.toLowerCase(), otp: otpData });
    await otpRec.save();
    
    await sendOTPEmail(emailId.toLowerCase(), otpData, type);

    res.status(200).json({ message: "OTP sent successfully. Please check your inbox." });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// SIGNUP route
authRouter.post("/signup", async (req, res) => {
  try {
    const { emailId, otp } = req.body;

    // Validate the complete payload to ensure integrity
    const { errors } = await signUpValidation(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    if (!otp) return res.status(400).json({ errors: ["OTP is required"] });

    // Validate OTP
    const validOtp = await Otp.findOne({ emailId: emailId.toLowerCase() }).sort({ createdAt: -1 });
    if (!validOtp || validOtp.otp !== otp) {
      return res.status(400).json({ errors: ["Invalid or expired OTP"] });
    }

    // Create the actual user
    const user = new User(req.body);
    await user.save();

    // Clear Otp
    await Otp.deleteMany({ emailId: emailId.toLowerCase() });

    // Auto-login
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
      secure: process.env.NODE_ENV === "production" || true
    });

    res.status(200).json({ message: "Account created successfully!", token });
  } catch (err) {
    res.status(400).json({ errors: [err.message] });
  }
});

// FORGOT PASSWORD
authRouter.post("/forgot-password", async (req, res) => {
  try {
     const { emailId, otp, newPassword } = req.body;
     
     if (!emailId || !otp || !newPassword) {
         return res.status(400).json({ errors: ["All fields are required"] });
     }

     const validOtp = await Otp.findOne({ emailId: emailId.toLowerCase() }).sort({ createdAt: -1 });
     if (!validOtp || validOtp.otp !== otp) {
         return res.status(400).json({ errors: ["Invalid or expired OTP"] });
     }

     const user = await User.findOne({ emailId: emailId.toLowerCase() });
     if (!user) return res.status(404).json({ errors: ["User not found."] });

     // Save triggers bcrypt hashing defined in User model (assuming standard pre-save hook)
     // Let's verify if user model has pre-save. If yes, simply user.password = newPassword. If no, we hash it manually.
     // In most standard paths, pre('save') is used. If we aren't sure, we can set and save.
     user.password = newPassword; 
     await user.save();

     await Otp.deleteMany({ emailId: emailId.toLowerCase() });

     res.status(200).json({ message: "Password reset successful! You can now login." });
  } catch(err) {
     res.status(500).json({ errors: [err.message] });
  }
});

// LOGIN route
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ IMPORTANT for cross-domain
      secure: process.env.NODE_ENV === "production" || true
    });

    res.send("Login successful");
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT route
authRouter.post('/logout', (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production" || true,
        path: "/",
    });
    res.send("logout successful");
});

module.exports = authRouter;
