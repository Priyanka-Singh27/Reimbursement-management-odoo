const mongoose = require("mongoose");
const { EXPENSE_STATUS } = require("../constants/enums");

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    amount: { type: Number, required: true, min: 0 },
    convertedAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, trim: true },
    companyCurrency: { type: String, required: true, uppercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    merchantName: { type: String, trim: true, default: "" },
    expenseDate: { type: Date, required: true },
    receiptImageUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: Object.values(EXPENSE_STATUS),
      default: EXPENSE_STATUS.PENDING,
      index: true,
    },
    approvalFlowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApprovalFlow",
      required: true,
    },
    currentStep: { type: Number, default: 1 },
    approverSnapshot: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, createdAt: -1 });
expenseSchema.index({ companyId: 1, status: 1, currentStep: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
