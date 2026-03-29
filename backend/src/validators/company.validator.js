const { body } = require("express-validator");

const companyUpdateValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("company name cannot be empty."),
  body("country")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("country name cannot be empty."),
];

module.exports = {
  companyUpdateValidator,
};
