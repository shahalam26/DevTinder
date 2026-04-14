const express=require ('express')
const profileRouter=express.Router()
const authMiddleware = require("../middleware/auth.js")
const User=require('../models/user.js')

profileRouter.get("/profile/view",authMiddleware, async (req, res) => {
  try {
    const user = req.user
    // 🔐 validation: hide password

    res.send(user);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});
profileRouter.patch("/profile/edit",authMiddleware, async (req, res) => {
 try{
 const allowedUpdates = [
  "firstName",
  "lastName",
  "age",
  "skills",
  "about",
  "photourl" // ✅ ADD
];
  const updates=Object.keys(req.body);

  const isValidUpdate=updates.every((field)=>
  allowedUpdates.includes(field));

  if(!isValidUpdate){
  return  res.status(400).json({message:"invalid update fields"})
  }

  const updatedUser=await User.findByIdAndUpdate(
    req.user._id,
    req.body,
    {new:true,runValidators:true}
  ).select("-password")

   res.json(updatedUser);

 }
 catch(err){
   console.error("JWT ERROR:", err.message);
  res.status(400).json({message:err.message});
}
});
module.exports=profileRouter;