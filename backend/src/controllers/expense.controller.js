const { StatusCodes } = require("http-status-codes");
const Expense = require("../models/expense.model");
const ApprovalFlow = require("../models/approvalFlow.model");
const Company = require("../models/company.model");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const { convertCurrency } = require("../services/currency.service");
const { ROLES, EXPENSE_STATUS } = require("../constants/enums");

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

  const receiptImageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.receiptImageUrl || "";

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
    receiptImageUrl,
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
  if (req.query.userId && req.user.role !== ROLES.EMPLOYEE) {
    query.userId = req.query.userId;
  }

  // date range filters
  if (req.query.from || req.query.to) {
    query.expenseDate = {};
    if (req.query.from) query.expenseDate.$gte = new Date(req.query.from);
    if (req.query.to) query.expenseDate.$lte = new Date(req.query.to);
  }

  const expenses = await Expense.find(query)
    .populate("userId", "name email role managerId")
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
    .populate("approvalFlowId")
    .populate("approvedBy", "name email role")
    .populate("rejectedBy", "name email role");

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

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    companyId: req.user.companyId,
  });

  if (!expense) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Expense not found.");
  }

  // Only the owner or admin can delete; owner can only delete Pending expenses
  if (req.user.role === ROLES.EMPLOYEE) {
    if (String(expense.userId) !== String(req.user._id)) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Not allowed.");
    }
    if (expense.status !== EXPENSE_STATUS.PENDING) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Only pending expenses can be cancelled."
      );
    }
  }

  await expense.deleteOne();
  return apiResponse(res, StatusCodes.OK, "Expense deleted.", null);
});

const getStats = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;

  const [totalExpenses, pending, approved, rejected, totalUsers] =
    await Promise.all([
      Expense.countDocuments({ companyId }),
      Expense.countDocuments({ companyId, status: EXPENSE_STATUS.PENDING }),
      Expense.countDocuments({ companyId, status: EXPENSE_STATUS.APPROVED }),
      Expense.countDocuments({ companyId, status: EXPENSE_STATUS.REJECTED }),
      User.countDocuments({ companyId }),
    ]);

  // Total approved spend (in company currency)
  const spendAgg = await Expense.aggregate([
    { $match: { companyId: req.user.companyId, status: EXPENSE_STATUS.APPROVED } },
    { $group: { _id: null, total: { $sum: "$convertedAmount" } } },
  ]);
  const totalApprovedSpend = spendAgg[0]?.total || 0;

  // Monthly spend (current calendar month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyAgg = await Expense.aggregate([
    {
      $match: {
        companyId: req.user.companyId,
        status: EXPENSE_STATUS.APPROVED,
        expenseDate: { $gte: startOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$convertedAmount" } } },
  ]);
  const monthlySpend = monthlyAgg[0]?.total || 0;

  // Category breakdown
  const categoryBreakdown = await Expense.aggregate([
    { $match: { companyId: req.user.companyId } },
    { $group: { _id: "$category", count: { $sum: 1 }, total: { $sum: "$convertedAmount" } } },
    { $sort: { total: -1 } },
  ]);

  return apiResponse(res, StatusCodes.OK, "Stats fetched.", {
    totalExpenses,
    pending,
    approved,
    rejected,
    totalUsers,
    totalApprovedSpend,
    monthlySpend,
    categoryBreakdown,
  });
});

module.exports = {
  submitExpense,
  listExpenses,
  getExpenseById,
  deleteExpense,
  getStats,
};
