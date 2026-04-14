require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createServer } = require("http");

// Security & Production Middlewares
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const compression = require("compression");

const authRouter = require("./routes/auth.js");
const oauthRouter = require("./routes/oauth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const uploadRouter = require("./routes/upload.js");
const chatRouter = require("./routes/chat.js");

const authMiddleware = require("./middleware/auth.js");
const initializeSocket = require("./config/socket.js");

const app = express();

// ✅ Trust Proxy for platforms like Render, Vercel, Heroku
app.set("trust proxy", 1);

// ✅ CORS (IMPORTANT)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Body and Cookie Parsers (MUST come before sanitization)
app.use(express.json());
app.use(cookieParser());

// ✅ Security & Logging Middlewares
app.use(helmet()); // Set secure HTTP headers
app.use(morgan("dev")); // Log HTTP requests
app.use(compression()); // Compress Response Payloads

// Prevent NoSQL Injection manually to avoid Express 5 read-only `req.query` issues
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// ✅ Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Routes
app.use("/", authRouter);
app.use("/", oauthRouter);
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

// ✅ Global Error Handler (Must be after all routes)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);
  const payload = { error: "Internal Server Error", details: err.message };
  if (process.env.NODE_ENV !== 'production') {
     payload.stack = err.stack;
  }
  res.status(500).json(payload);
});

// ✅ Socket Initialization
const httpServer = createServer(app);
initializeSocket(httpServer);

// Start server
const startServer = async () => {
  // ✅ Environment Secrets Validation
  if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
    console.error("FATAL ERROR: JWT_SECRET or MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    await connectDB();
    const port = process.env.PORT || process.env.port || 3000;
    httpServer.listen(port, () => {
      console.log("server is listening on port", port);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
