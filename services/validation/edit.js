const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateEditInput(data) {
  let errors = {};

  // Checks new password length
  if (!Validator.isLength(data.password, { min: 8 })) {
    errors.password = "Password must be at least 8 characters";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
