const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
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

module.exports = {
  listPendingApprovals,
  approve,
  reject,
};
