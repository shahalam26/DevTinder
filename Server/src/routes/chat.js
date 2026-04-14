const express = require("express");
const chatRouter = express.Router();
const authMiddleware = require("../middleware/auth");
const Message = require("../models/message");
const mongoose = require("mongoose");

chatRouter.get("/chat/summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Use aggregation to group by conversation, finding the most recent message
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $sort: { createdAt: -1 } // newest first
      },
      {
        $group: {
          _id: {
            // Uniquely identify the conversation pair
            $cond: [
              { $gt: [{ $toString: "$senderId" }, { $toString: "$receiverId" }] },
              { $concat: [{ $toString: "$senderId" }, "_", { $toString: "$receiverId" }] },
              { $concat: [{ $toString: "$receiverId" }, "_", { $toString: "$senderId" }] }
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: { 
             $sum: { 
                 $cond: [ { $and: [ { $eq: [{ $toString: "$receiverId" }, userId.toString()] }, { $ne: ["$status", "seen"] } ] }, 1, 0 ] 
             } 
          }
        }
      },
      {
        $replaceRoot: { 
            newRoot: { 
               $mergeObjects: ["$lastMessage", { unreadCount: "$unreadCount" }] 
            } 
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Populate the other user details manually since aggregate breaks normal .populate() chain
    const User = require("../models/user");
    const summaries = await Promise.all(messages.map(async (msg) => {
       const partnerId = msg.senderId.toString() === userId.toString() ? msg.receiverId : msg.senderId;
       const partnerInfo = await User.findById(partnerId, "firstName lastName photourl isOnline lastSeen");
       return { ...msg, partner: partnerInfo };
    }));

    res.json({ data: summaries });
  } catch (err) {
    res.status(500).json({ message: "Error fetching summaries", error: err.message });
  }
});

chatRouter.get("/chat/:targetUserId", authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    const User = require("../models/user");
    const partner = await User.findById(targetUserId, "firstName lastName photourl isOnline lastSeen");

    res.json({ data: messages, partner });
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
});




// Delete specific message
chatRouter.delete("/chat/message/:messageId", authMiddleware, async (req, res) => {
    try {
        const { messageId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
          return res.status(400).json({ success: false, message: "Invalid message ID format" });
        }
        const userId = req.user._id;
        // Verify user owns or is related to message to delete for everyone.
        await Message.findOneAndDelete({ _id: messageId, $or: [{ senderId: userId }, { receiverId: userId }]});
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ success: false });
    }
});

// Clear entire chat history
chatRouter.delete("/chat/room/:targetUserId", authMiddleware, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
          return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }
        const userId = req.user._id;
        await Message.deleteMany({
            $or: [
                { senderId: userId, receiverId: targetUserId },
                { senderId: targetUserId, receiverId: userId },
            ]
        });
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ success: false });
    }
});

module.exports = chatRouter;
