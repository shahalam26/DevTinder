const express = require('express');
const authRouter = express.Router();
const { signUpValidation } = require("../utils/validate.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// SIGNUP route
authRouter.post("/signup", async (req, res) => {
  try {
    const { errors, warnings } = await signUpValidation(req);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Create the actual user
    const user = new User(req.body);
    await user.save();

    // Auto-login
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: "lax", 
    });

    res.status(200).json({ message: "Account created successfully!", token });
  } catch (err) {
    res.status(400).json({ errors: [err.message] });
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
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: "lax", // ✅ IMPORTANT
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
        sameSite: "lax",
        path: "/",
    });
    res.send("logout successful");
});

module.exports = authRouter;
