const express = require("express");
const userRouter = express.Router();
const authMiddleware = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photourl age gender about skills";

const getPendingRequests = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const requests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "pending",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({
      data: requests,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

userRouter.get("/user/requests/received", authMiddleware, getPendingRequests);
userRouter.get("/user/requests/recieved", authMiddleware, getPendingRequests);

userRouter.get("/user/connections", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({ data });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

userRouter.get("/feed", authMiddleware, async (req, res) => {
  try {

      const loggedInUser=req.user;
      const page=parseInt(req.query.page)||1;
      let limit=parseInt(req.query.limit)||10;
      limit=limit>50?50:limit;

      const skip=(page-1)*limit;

      const connections=await ConnectionRequest.find({
        $or:[
          {fromUserId:loggedInUser._id},
          {toUserId: loggedInUser._id}, 
        ]
      }).select("fromUserId , toUserId");

      const hideUser=new Set();

      connections.forEach((conn) => {
      hideUser.add(conn.fromUserId.toString());
      hideUser.add(conn.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUser) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });

  
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(USER_SAFE_DATA);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Invalid User ID or internal error" });
  }
});


module.exports = userRouter;
