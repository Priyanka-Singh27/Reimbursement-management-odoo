const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

const EXPENSE_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const APPROVAL_ACTION = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const RULE_TYPES = {
  PERCENTAGE: "percentage",
  SPECIFIC: "specific",
  HYBRID: "hybrid",
};

module.exports = {
  ROLES,
  EXPENSE_STATUS,
  APPROVAL_ACTION,
  RULE_TYPES,
};
