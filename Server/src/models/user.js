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
      min: 18,
      max: 100
    },

    gender: {
      type: String
    },

    about: {
      type: String,
      default: ""
    },

    photourl: {
      type: String,
      default: ""
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
      validate(value) {
        if (value && value.toLowerCase().includes("password")) {
          throw new Error("Password cannot contain the word 'password'");
        }
      }
    },

    skills: {
      type: [String],
      default: [],
      validate(skills) {
        if (skills.length > 10) {
          throw new Error("you can add max 10 skills");
        }
      }
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// 🔐 hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);
module.exports = User;
