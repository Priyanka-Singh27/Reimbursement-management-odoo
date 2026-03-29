const { StatusCodes } = require("http-status-codes");
const Expense = require("../models/expense.model");
const ApprovalFlow = require("../models/approvalFlow.model");
const Company = require("../models/company.model");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const { convertCurrency } = require("../services/currency.service");
const { ROLES } = require("../constants/enums");

const submitExpense = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.user.companyId);
  if (!company) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Company not found.");
  }

  const flow =
    (await ApprovalFlow.findOne({
      companyId: req.user.companyId,
      isActive: true,
      _id: req.body.approvalFlowId || undefined,
    })) ||
    (await ApprovalFlow.findOne({ companyId: req.user.companyId, isActive: true }));

  if (!flow) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "No active approval flow found for this company."
    );
  }

  const convertedAmount = await convertCurrency(
    req.body.amount,
    req.body.currency,
    company.defaultCurrency
  );

  const expense = await Expense.create({
    userId: req.user._id,
    companyId: req.user.companyId,
    amount: req.body.amount,
    convertedAmount,
    currency: req.body.currency,
    companyCurrency: company.defaultCurrency,
    category: req.body.category,
    description: req.body.description,
    merchantName: req.body.merchantName || "",
    expenseDate: req.body.expenseDate,
    receiptImageUrl: req.body.receiptImageUrl || "",
    approvalFlowId: flow._id,
    currentStep: 1,
  });

  return apiResponse(res, StatusCodes.CREATED, "Expense submitted.", expense);
});

const listExpenses = asyncHandler(async (req, res) => {
  const query = { companyId: req.user.companyId };
  if (req.user.role === ROLES.EMPLOYEE) {
    query.userId = req.user._id;
  }
  if (req.query.status) query.status = req.query.status;

  const expenses = await Expense.find(query)
    .populate("userId", "name email role")
    .populate("approvalFlowId", "name")
    .sort({ createdAt: -1 });

  return apiResponse(res, StatusCodes.OK, "Expenses fetched.", expenses);
});

const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    companyId: req.user.companyId,
  })
    .populate("userId", "name email role managerId")
    .populate("approvalFlowId");

  if (!expense) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Expense not found.");
  }

  if (
    req.user.role === ROLES.EMPLOYEE &&
    String(expense.userId._id) !== String(req.user._id)
  ) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Not allowed.");
  }

  return apiResponse(res, StatusCodes.OK, "Expense fetched.", expense);
});

module.exports = {
  submitExpense,
  listExpenses,
  getExpenseById,
};
