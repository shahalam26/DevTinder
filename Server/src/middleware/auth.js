

const jwt = require("jsonwebtoken");
const User = require("../models/user");

// const JWT_SECRET = "MY_SUPER_SECRET_KEY";

const authMiddleware = async (req, res, next) => {

    
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    // 1️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2️⃣ Fetch user from DB
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).send("User not found");
    }

    // 3️⃣ Attach user to request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send("Invalid or expired token");
  }
};

module.exports = authMiddleware;
