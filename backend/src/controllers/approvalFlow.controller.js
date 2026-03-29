const { StatusCodes } = require("http-status-codes");
const ApprovalFlow = require("../models/approvalFlow.model");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

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

module.exports = {
  createApprovalFlow,
  listApprovalFlows,
  updateApprovalFlow,
};
