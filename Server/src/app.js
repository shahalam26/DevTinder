require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/database.js");
const User = require("./models/user.js");

const bcrypt=require("bcrypt")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/auth.js")
const authRouter=require('./routes/auth.js')
const profileRouter=require('./routes/profile.js')
const requestRouter=require('./routes/request.js')
const userRouter=require('./routes/user.js')
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/',authRouter)
app.use('/',profileRouter)
app.use('/',requestRouter)
app.use('/',userRouter)



/*===============================
   Login Api
   ===============================  */
  



// app.post("/login", async (req, res) => {
//   try {
//     const { emailId, password } = req.body;

//     // 1️⃣ basic validation
//     if (!emailId || !password) {
//       return res.status(401).json({
//         error: "Invalid credentials",
//       });
//     }

//     // 2️⃣ check user exists

//     const user = await User.findOne({ emailId }).select("+password");

//     if (!user) {
//       return res.status(401).json({
//         error: "user not registered",
//       });
//     }

//     // 3️⃣ plain password comparison (TEMP)
//     if (user.password !== password) {
//       return res.status(401).json({
//         error: "Invalid credentials",
//       });
//     }

    // 4️⃣ success
//     res.status(200).json({
//       message: "Login successful",
//     });
//   } catch (err) {
//     res.status(500).json({
//       error: "Something went wrong",
//     });
//   }
// });

/* ===============================
   1️⃣ GET ALL USERS
   =============================== */


/* ===============================
   2️⃣ GET USER BY EMAIL
   =============================== */
// app.get("/user", authMiddleware,async (req, res) => {
//   try {
//     const emailId = req.query.emailId?.trim().toLowerCase();

//     // 🔐 validation: required query param
//     if (!emailId) {
//       return res.status(400).send("emailId query param is required");
//     }

//     const user = await User.findOne(
//       { emailId },
//       { password: 0 }, // 🔐 hide password
//     );

//     if (!user) {
//       return res.status(404).send("User not found");
//     }

//     res.send(user);
//   } catch (err) {
//     res.status(500).send("Internal server error");
//   }
// });


// Get profile data 
app.get("/me", authMiddleware, async (req, res) => {
  try {
    res.send(req.user); // req.user comes from authMiddleware
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});


/* ===============================
   3️⃣ DELETE USER BY ID
   =============================== */

/* ===============================
   4️⃣ PATCH USER (UPDATE)
   =============================== */


/* ===============================
   5️⃣ SIGNUP (CREATE USER)
   =============================== */

/* ===============================
   SERVER START
   =============================== */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.port, () => {
      console.log("server is listening on port ",process.env.port);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
