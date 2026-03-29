const { body } = require("express-validator");

const expenseValidator = [
  body("amount").isFloat({ min: 0.01 }).withMessage("amount must be greater than 0."),
  body("currency")
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("currency must be a 3-letter code."),
  body("category").trim().notEmpty().withMessage("category is required."),
  body("description").trim().notEmpty().withMessage("description is required."),
  body("expenseDate").isISO8601().withMessage("expenseDate must be a valid date."),
  body("approvalFlowId").optional().isMongoId().withMessage("approvalFlowId must be valid."),
];

const approvalActionValidator = [
  body("comment").optional().trim().isLength({ max: 500 }),
];

module.exports = {
  expenseValidator,
  approvalActionValidator,
};
