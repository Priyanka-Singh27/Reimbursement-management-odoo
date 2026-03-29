const { body } = require("express-validator");

const signupValidator = [
  body("companyName").trim().notEmpty().withMessage("companyName is required."),
  body("country").trim().notEmpty().withMessage("country is required."),
  body("name").trim().notEmpty().withMessage("name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long."),
];

const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("password is required."),
];

module.exports = {
  signupValidator,
  loginValidator,
};
