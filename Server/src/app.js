require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createServer } = require("http");

const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const uploadRouter = require("./routes/upload.js");
const chatRouter = require("./routes/chat.js");

const authMiddleware = require("./middleware/auth.js");
const initializeSocket = require("./config/socket.js");

const app = express();

// ✅ CORS (IMPORTANT)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", uploadRouter);
app.use("/", chatRouter);

// ✅ Auth check route (IMPORTANT)
app.get("/me", authMiddleware, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

// ✅ Socket Initialization
const httpServer = createServer(app);
initializeSocket(httpServer);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || process.env.port || 3000;
    httpServer.listen(port, () => {
      console.log("server is listening on port", port);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
