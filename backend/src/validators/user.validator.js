const { body } = require("express-validator");
const { ROLES } = require("../constants/enums");

const createUserValidator = [
  body("name").trim().notEmpty().withMessage("name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long."),
  body("role")
    .isIn(Object.values(ROLES))
    .withMessage(`role must be one of: ${Object.values(ROLES).join(", ")}`),
  body("managerId").optional().isMongoId().withMessage("managerId must be a valid id."),
];

const updateUserValidator = [
  body("role")
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`role must be one of: ${Object.values(ROLES).join(", ")}`),
  body("managerId").optional({ nullable: true }).isMongoId(),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
};
