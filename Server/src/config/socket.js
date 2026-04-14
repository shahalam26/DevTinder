const { Server } = require("socket.io");
const Message = require("../models/message");
const User = require("../models/user");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Track socket IDs to user IDs for presence mapping
  const usersSockets = new Map();

  io.on("connection", (socket) => {
    
    // --- 🌍 PRESENCE SYSTEM ---
    socket.on("userConnected", async (userId) => {
      usersSockets.set(socket.id, userId);
      socket.join(`user_${userId}`); // Private room for system alerts/calls to this user
      
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        socket.broadcast.emit("userPresenceUpdate", { userId, isOnline: true });

        // Update undelivered messages bulk delivery for this user
        const undeliveredMessages = await Message.find({ receiverId: userId, status: "sent" });
        if (undeliveredMessages.length > 0) {
            await Message.updateMany({ receiverId: userId, status: "sent" }, { status: "delivered" });

            // Notify all distinct senders that their messages to this receiver are now delivered
            const senderIds = [...new Set(undeliveredMessages.map(m => m.senderId.toString()))];
            senderIds.forEach(senderId => {
               const roomId = [senderId, userId].sort().join("_");
               // Alert the sender precisely on their device
               io.to(`user_${senderId}`).emit("bulkMessageStatusUpdate", { receiverId: userId, status: "delivered" });
               // Just to be safe, emit to the room so if they have chat window open it instantly updates
               io.to(roomId).emit("bulkMessageStatusUpdate", { receiverId: userId, status: "delivered" });
            });
        }
      } catch (err) { console.error(err); }
    });

    socket.on("checkPresence", async (targetUserId) => {
      try {
        const user = await User.findById(targetUserId, "isOnline lastSeen");
        if (user) {
          socket.emit("userPresenceUpdate", { userId: targetUserId, isOnline: user.isOnline, lastSeen: user.lastSeen });
        }
      } catch (err) {}
    });

    // --- 💬 CHAT SYSTEM ---
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.join(roomId);
      
      // When a user joins explicitly, automatically mark unseen messages as seen
      Message.updateMany(
        { senderId: targetUserId, receiverId: userId, status: { $ne: "seen" } },
        { status: "seen" }
      ).exec().then(() => {
        io.to(roomId).emit("messagesSeen", { byUserId: userId, forSenderId: targetUserId });
      });
    });

    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
      try {
        // Are they strictly online? (in the map)
        const isReceiverOnline = [...usersSockets.values()].includes(receiverId);
        
        // Initial state logic (if online, they might receive it immediately, but let's default to delivered if online, sent if offline)
        // Wait, socket 'receiveMessage' acts as delivery payload. Let's start with 'sent', and clients emit 'messageDelivered'.
        const message = new Message({ senderId, receiverId, text, status: "sent" });
        await message.save();

        const roomId = [senderId, receiverId].sort().join("_");
        // Broadcast to chat room
        io.to(roomId).emit("receiveMessage", message);
        
        // Also send to the precise receiver's private room with sender profile for push notifications
        const senderInfo = await User.findById(senderId, "firstName lastName photourl").lean();
        socket.to(`user_${receiverId}`).emit("incomingMessageAlert", { ...message.toObject(), sender: senderInfo });

      } catch (err) { console.error(err); }
    });

    socket.on("messageDelivered", async ({ messageId, senderId }) => {
        try {
          const msg = await Message.findById(messageId);
          if (msg && msg.status === "sent") {
            msg.status = "delivered";
            await msg.save();
            io.to(`user_${senderId}`).emit("messageStatusUpdate", { messageId, status: "delivered" });
            // Also emit to the room so chat windows update
            const roomId = [msg.senderId, msg.receiverId].sort().join("_");
            io.to(roomId).emit("messageStatusUpdate", { messageId, status: "delivered" });
          }
        } catch (err) {}
    });

    socket.on("markMessagesSeen", async ({ senderId, receiverId }) => {
        try {
          await Message.updateMany(
            { senderId, receiverId, status: { $ne: "seen" } },
            { status: "seen" }
          );
          const roomId = [senderId, receiverId].sort().join("_");
          io.to(roomId).emit("messagesSeen", { byUserId: receiverId, forSenderId: senderId });
        } catch(err) {}
    });

    // --- 📞 WEBRTC CALL SIGNALING ---
    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
      io.to(`user_${userToCall}`).emit("incomingCall", { signal: signalData, from, name });
    });

    socket.on("answerCall", (data) => {
      io.to(`user_${data.to}`).emit("callAccepted", data.signal);
    });

    socket.on("endCall", ({ to }) => {
      io.to(`user_${to}`).emit("callEnded");
    });

    socket.on("rejectCall", ({ to }) => {
      io.to(`user_${to}`).emit("callRejected");
    });

    socket.on("iceCandidate", ({ to, candidate }) => {
      io.to(`user_${to}`).emit("iceCandidate", candidate);
    });


    // --- 🔴 DISCONNECT ---
    socket.on("disconnect", async () => {
      const userId = usersSockets.get(socket.id);
      if (userId) {
        usersSockets.delete(socket.id);
        const lastSeen = Date.now();
        try {
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
          socket.broadcast.emit("userPresenceUpdate", { userId, isOnline: false, lastSeen });
        } catch(err) {}
      }
    });

  });
};

module.exports = initializeSocket;
