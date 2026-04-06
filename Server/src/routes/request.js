const express = require('express')
const requestRouter = express.Router();
const authMiddleware = require("../middleware/auth.js")
const ConnectionRequest = require('../models/connectionRequest')
const User = require('../models/user')
/*
Send Connection Request 
in this module we have wrote the code for sending connection request from user 1 to user 2 and we are checking multiple things is there exist some
request already from b to a or a to b if they send match happens also we check  user should not send connection to itself 
*/

requestRouter.post("/request/:toUserId", authMiddleware, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const { toUserId } = req.params;

        if (fromUserId.equals(toUserId)) {
            return res.status(400).json({ message: "Can't connect to yourself" })
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: "User not found" })
        }

        const reverseRequest = await ConnectionRequest.findOne({
            fromUserId: toUserId,
            toUserId: fromUserId,
            status: "pending",
        });

        if (reverseRequest) {
            reverseRequest.status = "accepted";
            await reverseRequest.save();
            return res.json({ message: "It's a match 🎉" });
        }

        // const existingRequest = await ConnectionRequest.findOne({
        //     fromUserId,
        //     toUserId,
        //     status: "pending"
        // });    checking one way connection only 

const existingRequest=await ConnectionRequest.findOne({
  $or: [
    { fromUserId, toUserId },
    { fromUserId: toUserId, toUserId: fromUserId }
  ]
});

        if (existingRequest) {
            return res.status(400).json({ message: "Request already exists" });
        }

        await ConnectionRequest.create({
            fromUserId,
            toUserId,
            status: "pending"
        });

        res.json({ message: "Connection request sent" })

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Request already exists" });
        }

        res.status(400).json({ message: err.message });
    }
})

/* Review request section*/

requestRouter.patch('/review/:requestId',authMiddleware,async(req,res)=>{
    try{
        const {requestId}=req.params;
        const {status}=req.body;
        const userId=req.user._id;

        if(!["accepted","rejected"].includes(status)){
            return res.status(400).json({message:"Invalid status"})
        }
        const request=await ConnectionRequest.findOne({
              _id:requestId,
              toUserId:userId,
              status:"pending",
          })

          if(!request){
            return res.status(404).json({
                message:"request not found",
            })
          }

          request.status=status;
          await request.save();

          res.status(200).json({message:`request ${status} succesfully`})
    }
    catch(err){
         res.status(400).json({
            message:err.message
         })
    }
})



module.exports = requestRouter;
