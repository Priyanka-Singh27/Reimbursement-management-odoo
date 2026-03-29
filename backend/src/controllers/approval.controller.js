const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
const ApprovalLog = require("../models/approvalLog.model");
const {
  approveExpense,
  rejectExpense,
  getPendingApprovalsForUser,
} = require("../services/approval.service");

const listPendingApprovals = asyncHandler(async (req, res) => {
  const pending = await getPendingApprovalsForUser(req.user);
  return apiResponse(res, StatusCodes.OK, "Pending approvals fetched.", pending);
});

const approve = asyncHandler(async (req, res) => {
  const expense = await approveExpense({
    expenseId: req.params.expenseId,
    approverId: req.user._id,
    approverRole: req.user.role,
    comment: req.body.comment || "",
  });

  return apiResponse(res, StatusCodes.OK, "Expense approved.", expense);
});

const reject = asyncHandler(async (req, res) => {
  const expense = await rejectExpense({
    expenseId: req.params.expenseId,
    approverId: req.user._id,
    comment: req.body.comment || "",
  });

  return apiResponse(res, StatusCodes.OK, "Expense rejected.", expense);
});

const getApprovalLogs = asyncHandler(async (req, res) => {
  const logs = await ApprovalLog.find({ expenseId: req.params.expenseId })
    .populate("approverId", "name email role")
    .sort({ timestamp: 1 });

  return apiResponse(res, StatusCodes.OK, "Approval logs fetched.", logs);
});

const getApprovalHistory = asyncHandler(async (req, res) => {
  const logs = await ApprovalLog.find({ approverId: req.user._id })
    .populate({
      path: "expenseId",
      select: "amount convertedAmount currency companyCurrency category description status expenseDate",
      populate: { path: "userId", select: "name email" },
    })
    .sort({ timestamp: -1 })
    .limit(50);

  return apiResponse(res, StatusCodes.OK, "Approval history fetched.", logs);
});

module.exports = {
  listPendingApprovals,
  approve,
  reject,
  getApprovalLogs,
  getApprovalHistory,
};
