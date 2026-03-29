const { StatusCodes } = require("http-status-codes");
const ApprovalLog = require("../models/approvalLog.model");
const ApprovalFlow = require("../models/approvalFlow.model");
const Expense = require("../models/expense.model");
const User = require("../models/user.model");
const {
  APPROVAL_ACTION,
  EXPENSE_STATUS,
  ROLES,
  RULE_TYPES,
} = require("../constants/enums");
const ApiError = require("../utils/apiError");

function findCurrentStep(flow, currentStep) {
  return flow.steps.find((step) => step.sequence === currentStep);
}

async function resolveStepApprovers(expense, step) {
  if (!step) return [];

  if (step.userId) return [String(step.userId)];

  if (step.role === ROLES.MANAGER) {
    const employee = await User.findById(expense.userId).select("managerId");
    return employee?.managerId ? [String(employee.managerId)] : [];
  }

  if (step.role) {
    const users = await User.find({
      companyId: expense.companyId,
      role: step.role,
    }).select("_id");
    return users.map((u) => String(u._id));
  }

  return [];
}

async function isUserAllowedForCurrentStep(expense, flow, userId) {
  const step = findCurrentStep(flow, expense.currentStep);
  const approvers = await resolveStepApprovers(expense, step);
  return approvers.includes(String(userId));
}

function getApprovalPercentage(expense, flow) {
  const totalSteps = flow.steps.length;
  const approvedStepCount = expense.currentStep - 1;
  if (totalSteps === 0) return 0;
  return Math.round((approvedStepCount / totalSteps) * 100);
}

function isSpecificRuleSatisfied(flow, approverId, approverRole) {
  const byUser = (flow.rules.specificApproverUsers || []).some(
    (id) => String(id) === String(approverId)
  );
  const byRole = (flow.rules.specificApproverRoles || []).includes(approverRole);
  return byUser || byRole;
}

function isPercentageRuleSatisfied(expense, flow) {
  const threshold = flow.rules.percentageThreshold || 100;
  return getApprovalPercentage(expense, flow) >= threshold;
}

function evaluateConditionalRule(expense, flow, approverId, approverRole) {
  const percentageSatisfied = isPercentageRuleSatisfied(expense, flow);
  const specificSatisfied = isSpecificRuleSatisfied(flow, approverId, approverRole);

  if (flow.rules.type === RULE_TYPES.PERCENTAGE) return percentageSatisfied;
  if (flow.rules.type === RULE_TYPES.SPECIFIC) return specificSatisfied;
  return percentageSatisfied && specificSatisfied;
}

async function approveExpense({ expenseId, approverId, approverRole, comment }) {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Expense not found.");
  }

  if (expense.status !== EXPENSE_STATUS.PENDING) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Only pending expenses can be approved."
    );
  }

  const flow = await ApprovalFlow.findById(expense.approvalFlowId);
  if (!flow) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Approval flow not found.");
  }

  const allowed = await isUserAllowedForCurrentStep(expense, flow, approverId);
  if (!allowed) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not allowed to approve at this step."
    );
  }

  await ApprovalLog.create({
    expenseId: expense._id,
    approverId,
    action: APPROVAL_ACTION.APPROVED,
    comment,
  });

  if (!expense.approvedBy.some((id) => String(id) === String(approverId))) {
    expense.approvedBy.push(approverId);
  }

  expense.currentStep += 1;

  const conditionalPass = evaluateConditionalRule(
    expense,
    flow,
    approverId,
    approverRole
  );
  const isFinalStep = expense.currentStep > flow.steps.length;

  if (conditionalPass || isFinalStep) {
    expense.status = EXPENSE_STATUS.APPROVED;
  }

  await expense.save();
  return expense;
}

async function rejectExpense({ expenseId, approverId, comment }) {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Expense not found.");
  }

  if (expense.status !== EXPENSE_STATUS.PENDING) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Only pending expenses can be rejected."
    );
  }

  const flow = await ApprovalFlow.findById(expense.approvalFlowId);
  if (!flow) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Approval flow not found.");
  }

  const allowed = await isUserAllowedForCurrentStep(expense, flow, approverId);
  if (!allowed) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not allowed to reject at this step."
    );
  }

  await ApprovalLog.create({
    expenseId: expense._id,
    approverId,
    action: APPROVAL_ACTION.REJECTED,
    comment,
  });

  if (!expense.rejectedBy.some((id) => String(id) === String(approverId))) {
    expense.rejectedBy.push(approverId);
  }
  expense.status = EXPENSE_STATUS.REJECTED;
  await expense.save();

  return expense;
}

async function getPendingApprovalsForUser(user) {
  const pending = await Expense.find({
    companyId: user.companyId,
    status: EXPENSE_STATUS.PENDING,
  })
    .populate("userId", "name email managerId")
    .sort({ createdAt: -1 });

  const allowedExpenses = [];
  for (const expense of pending) {
    const flow = await ApprovalFlow.findById(expense.approvalFlowId);
    if (!flow) continue;
    const allowed = await isUserAllowedForCurrentStep(expense, flow, user._id);
    if (allowed) allowedExpenses.push(expense);
  }
  return allowedExpenses;
}

module.exports = {
  approveExpense,
  rejectExpense,
  getPendingApprovalsForUser,
};
