const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address");
        }
      }
    },

    age: {
      type: Number,
      required:false,
      min: 18,
      max: 100
    },
    gender:{
     type:String,
     required:false
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot contain the word 'password'");
        }
      },
      select: false
    },
    skills:{
        type:[String],
        default:[],
        validate(skills){
            if (skills.length>10){
                throw new Error("you can add max 10 skills")
            }
        }

    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save",async function (next){
  if (!this.isModified("password")) return;
  this.password=await bcrypt.hash(this.password,10);
 
})
const User = mongoose.model("User", userSchema);
module.exports = User;
