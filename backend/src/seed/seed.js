const mongoose = require("mongoose");
const env = require("../config/env");
const User = require("../models/user.model");
const Company = require("../models/company.model");
const Expense = require("../models/expense.model");
const ApprovalFlow = require("../models/approvalFlow.model");
const { ROLES, EXPENSE_STATUS, RULE_TYPES } = require("../constants/enums");

const seed = async () => {
  try {
    console.log("Seeding data...");
    await mongoose.connect(env.mongoUri);

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Expense.deleteMany({});
    await ApprovalFlow.deleteMany({});

    // Create Company
    const company = await Company.create({
      name: "Oddo Solutions",
      country: "India",
      defaultCurrency: "INR",
    });

    // Create Admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@oddo.com",
      password: "password123",
      role: ROLES.ADMIN,
      companyId: company._id,
    });

    // Create Manager
    const manager = await User.create({
      name: "John Manager",
      email: "manager@oddo.com",
      password: "password123",
      role: ROLES.MANAGER,
      companyId: company._id,
    });

    // Create Employees
    const emp1 = await User.create({
      name: "Alice Employee",
      email: "alice@oddo.com",
      password: "password123",
      role: ROLES.EMPLOYEE,
      companyId: company._id,
      managerId: manager._id,
    });

    const emp2 = await User.create({
      name: "Bob Employee",
      email: "bob@oddo.com",
      password: "password123",
      role: ROLES.EMPLOYEE,
      companyId: company._id,
      managerId: manager._id,
    });

    const finance = await User.create({
      name: "Finance Team",
      email: "finance@oddo.com",
      password: "password123",
      role: ROLES.MANAGER, // Finance acts as manager for approvals
      companyId: company._id,
    });

    // Create Approval Flow
    const flow = await ApprovalFlow.create({
      companyId: company._id,
      name: "Default Workflow",
      steps: [
        { sequence: 1, role: ROLES.MANAGER }, // Direct manager
        { sequence: 2, userId: finance._id }, // specific finance user
      ],
      rules: {
        type: RULE_TYPES.PERCENTAGE,
        percentageThreshold: 100,
      },
      isActive: true,
    });

    // Create some Expenses
    const expenses = [
      {
        userId: emp1._id,
        companyId: company._id,
        amount: 500,
        convertedAmount: 500,
        currency: "INR",
        companyCurrency: "INR",
        category: "Food",
        description: "Team lunch",
        expenseDate: new Date(),
        status: EXPENSE_STATUS.PENDING,
        approvalFlowId: flow._id,
        currentStep: 1,
      },
      {
        userId: emp1._id,
        companyId: company._id,
        amount: 80,
        convertedAmount: 6500, // Roughly 80 USD to INR
        currency: "USD",
        companyCurrency: "INR",
        category: "Software",
        description: "AWS Subscription",
        expenseDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
        status: EXPENSE_STATUS.APPROVED,
        approvalFlowId: flow._id,
        currentStep: 3,
        approvedBy: [manager._id, finance._id],
      },
      {
        userId: emp2._id,
        companyId: company._id,
        amount: 1500,
        convertedAmount: 1500,
        currency: "INR",
        companyCurrency: "INR",
        category: "Travel",
        description: "Client meeting cab",
        expenseDate: new Date(Date.now() - 86400000 * 5),
        status: EXPENSE_STATUS.REJECTED,
        approvalFlowId: flow._id,
        currentStep: 1,
        rejectedBy: [manager._id],
      },
    ];

    await Expense.create(expenses);

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
