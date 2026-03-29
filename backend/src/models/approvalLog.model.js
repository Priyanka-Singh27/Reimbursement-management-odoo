const mongoose = require("mongoose");
const { APPROVAL_ACTION } = require("../constants/enums");

const approvalLogSchema = new mongoose.Schema(
  {
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: "Expense", required: true },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: Object.values(APPROVAL_ACTION), required: true },
    comment: { type: String, trim: true, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

approvalLogSchema.index({ expenseId: 1, timestamp: -1 });
approvalLogSchema.index({ approverId: 1, timestamp: -1 });

module.exports = mongoose.model("ApprovalLog", approvalLogSchema);
