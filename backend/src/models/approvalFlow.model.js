const mongoose = require("mongoose");
const { ROLES, RULE_TYPES } = require("../constants/enums");

const approvalStepSchema = new mongoose.Schema(
  {
    sequence: { type: Number, required: true, min: 1 },
    role: { type: String, enum: Object.values(ROLES), default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false }
);

const approvalRulesSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(RULE_TYPES), default: RULE_TYPES.PERCENTAGE },
    percentageThreshold: { type: Number, min: 1, max: 100, default: 100 },
    specificApproverRoles: [{ type: String, enum: Object.values(ROLES) }],
    specificApproverUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: false }
);

const approvalFlowSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true, trim: true },
    steps: {
      type: [approvalStepSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one approval step is required.",
      },
    },
    rules: { type: approvalRulesSchema, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

approvalFlowSchema.index({ companyId: 1, isActive: 1 });

module.exports = mongoose.model("ApprovalFlow", approvalFlowSchema);
