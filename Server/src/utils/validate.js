const validator = require("validator");
const User = require("../models/user");

const signUpValidation = async (req) => {
  const { emailId, password, firstName, lastName, } = req.body;

  const errors = [];
  const warnings = [];

  // BLOCKING ERRORS
 
  if (!emailId || !validator.isEmail(emailId)) {
    errors.push("Invalid email");
  } else {
    try {
      const user = await User.findOne({ emailId: emailId.toLowerCase() });
      if (user) {
        errors.push("Email already exists. Try logging in.");
      }
    } catch (err) {
      errors.push("Database error while checking email.");
    }
  }

  if (!firstName || firstName.length < 2) {
    errors.push("Invalid first name");
  }

  if (!lastName || lastName.length < 2) {
    errors.push("Invalid last name");
  }
  if (!password) {
    errors.push("Password is required");
  }

  // NON-BLOCKING WARNING
  if (password && !validator.isStrongPassword(password)) {
    warnings.push("Password is weak. Consider adding symbols, numbers, and uppercase letters.");
  }

  return { errors, warnings };
};

module.exports = { signUpValidation };
