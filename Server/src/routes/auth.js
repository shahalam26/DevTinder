const express=require('express')
const authRouter= express.Router();
const { signUpValidation } = require("../utils/validate.js");
const bcrypt=require("bcrypt")
const jwt = require("jsonwebtoken");
const User = require("../models/user");



authRouter.post("/signup", async (req, res) => {
  try {
    const { errors, warnings } = await signUpValidation(req);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    const user = new User(req.body);
    await user.save();

    res.status(201).send("User registered successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});


authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId }).select("+password");
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }
     const token = jwt.sign(
      { userId: user._id },
       process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
     res.cookie("token", token, {
      httpOnly: true,          
      maxAge: 60 * 60 * 1000  
    });

    res.send("Login successful");
  } catch (err) {
  console.error("LOGIN ERROR ", err);
  res.status(500).json({
    message: "Server error",
    error: err.message,
  });
}

});

authRouter.post('/logout',(req,res)=>{
    res.cookie('token',null,{
        expires:new Date(Date.now()),
        
    })
    res.send("logout successfull")
})

module.exports = authRouter;
