const { StatusCodes } = require("http-status-codes");
const ApprovalFlow = require("../models/approvalFlow.model");
const Expense = require("../models/expense.model");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const { EXPENSE_STATUS } = require("../constants/enums");

const createApprovalFlow = asyncHandler(async (req, res) => {
  const flow = await ApprovalFlow.create({
    companyId: req.user.companyId,
    name: req.body.name,
    steps: req.body.steps,
    rules: req.body.rules,
    isActive: req.body.isActive ?? true,
  });

  return apiResponse(res, StatusCodes.CREATED, "Approval flow created.", flow);
});

const listApprovalFlows = asyncHandler(async (req, res) => {
  const flows = await ApprovalFlow.find({ companyId: req.user.companyId }).sort({
    createdAt: -1,
  });
  return apiResponse(res, StatusCodes.OK, "Approval flows fetched.", flows);
});

const getApprovalFlowById = asyncHandler(async (req, res) => {
  const flow = await ApprovalFlow.findOne({
    _id: req.params.id,
    companyId: req.user.companyId,
  });
  if (!flow) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Approval flow not found.");
  }
  return apiResponse(res, StatusCodes.OK, "Approval flow fetched.", flow);
});

const updateApprovalFlow = asyncHandler(async (req, res) => {
  const flow = await ApprovalFlow.findOne({
    _id: req.params.id,
    companyId: req.user.companyId,
  });

  if (!flow) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Approval flow not found.");
  }

  flow.name = req.body.name ?? flow.name;
  flow.steps = req.body.steps ?? flow.steps;
  flow.rules = req.body.rules ?? flow.rules;
  if (typeof req.body.isActive === "boolean") flow.isActive = req.body.isActive;

  await flow.save();

  return apiResponse(res, StatusCodes.OK, "Approval flow updated.", flow);
});

const deleteApprovalFlow = asyncHandler(async (req, res) => {
  const flow = await ApprovalFlow.findOne({
    _id: req.params.id,
    companyId: req.user.companyId,
  });

  if (!flow) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Approval flow not found.");
  }

  // Guard: don't delete if active pending expenses depend on this flow
  const activeExpenses = await Expense.countDocuments({
    approvalFlowId: flow._id,
    status: EXPENSE_STATUS.PENDING,
  });

  if (activeExpenses > 0) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      `Cannot delete: ${activeExpenses} pending expense(s) are using this flow.`
    );
  }

  await flow.deleteOne();
  return apiResponse(res, StatusCodes.OK, "Approval flow deleted.", null);
});

module.exports = {
  createApprovalFlow,
  listApprovalFlows,
  getApprovalFlowById,
  updateApprovalFlow,
  deleteApprovalFlow,
};
