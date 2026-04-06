const mongoose=require('mongoose')
const express=require('express')


const connectionRequestSchema=new mongoose.Schema(
{
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    status:{
        type:String,
        enum:["pending","accepted","rejected"],
        default:"pending",
    },
},
{timestamps:true}
);

connectionRequestSchema.index(
    {fromUserId:1,toUserId:1},
    {unique:true}
);

connectionRequestSchema.pre("save",function(next){
    if(this.fromUserId.equals(this.toUserId)){
        return next(new Error("can not send request to yourself"));
    }
    
})
const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
module.exports = ConnectionRequestModel;