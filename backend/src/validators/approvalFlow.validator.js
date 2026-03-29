const { body } = require("express-validator");
const { ROLES, RULE_TYPES } = require("../constants/enums");

const ruleTypeMessage = `rules.type must be one of: ${Object.values(RULE_TYPES).join(", ")}`;

const flowValidator = [
  body("name").trim().notEmpty().withMessage("name is required."),
  body("steps").isArray({ min: 1 }).withMessage("steps must be a non-empty array."),
  body("steps.*.sequence").isInt({ min: 1 }).withMessage("steps.sequence must be >= 1."),
  body("steps.*.role")
    .optional({ nullable: true })
    .isIn(Object.values(ROLES))
    .withMessage(`steps.role must be one of: ${Object.values(ROLES).join(", ")}`),
  body("steps.*.userId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("steps.userId must be a valid id."),
  body("rules.type").isIn(Object.values(RULE_TYPES)).withMessage(ruleTypeMessage),
  body("rules.percentageThreshold")
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage("rules.percentageThreshold must be between 1 and 100."),
  body("rules.specificApproverUsers")
    .optional()
    .isArray()
    .withMessage("rules.specificApproverUsers must be an array."),
  body("rules.specificApproverRoles")
    .optional()
    .isArray()
    .withMessage("rules.specificApproverRoles must be an array."),
];

const updateFlowValidator = [
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty."),
  body("steps").optional().isArray({ min: 1 }).withMessage("steps must be a non-empty array."),
  body("steps.*.sequence")
    .optional()
    .isInt({ min: 1 })
    .withMessage("steps.sequence must be >= 1."),
  body("steps.*.role")
    .optional({ nullable: true })
    .isIn(Object.values(ROLES))
    .withMessage(`steps.role must be one of: ${Object.values(ROLES).join(", ")}`),
  body("steps.*.userId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("steps.userId must be a valid id."),
  body("rules.type").optional().isIn(Object.values(RULE_TYPES)).withMessage(ruleTypeMessage),
  body("rules.percentageThreshold")
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage("rules.percentageThreshold must be between 1 and 100."),
  body("rules.specificApproverUsers")
    .optional()
    .isArray()
    .withMessage("rules.specificApproverUsers must be an array."),
  body("rules.specificApproverRoles")
    .optional()
    .isArray()
    .withMessage("rules.specificApproverRoles must be an array."),
];

module.exports = { flowValidator, updateFlowValidator };
