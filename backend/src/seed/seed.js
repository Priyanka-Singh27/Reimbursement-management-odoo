const connectDB = require("../config/db");
const User = require("../models/user.model");
const Company = require("../models/company.model");
const ApprovalFlow = require("../models/approvalFlow.model");
const { ROLES, RULE_TYPES } = require("../constants/enums");

async function runSeed() {
  await connectDB();

  let company = await Company.findOne({ name: "Demo Corp" });
  if (!company) {
    company = await Company.create({
      name: "Demo Corp",
      country: "India",
      defaultCurrency: "INR",
    });
  }

  let admin = await User.findOne({ email: "admin@demo.com" });
  if (!admin) {
    admin = await User.create({
      name: "Admin User",
      email: "admin@demo.com",
      password: "Admin@123",
      role: ROLES.ADMIN,
      companyId: company._id,
    });
  }

  let manager = await User.findOne({ email: "manager@demo.com" });
  if (!manager) {
    manager = await User.create({
      name: "Manager User",
      email: "manager@demo.com",
      password: "Manager@123",
      role: ROLES.MANAGER,
      companyId: company._id,
    });
  }

  let employee = await User.findOne({ email: "employee@demo.com" });
  if (!employee) {
    employee = await User.create({
      name: "Employee User",
      email: "employee@demo.com",
      password: "Employee@123",
      role: ROLES.EMPLOYEE,
      companyId: company._id,
      managerId: manager._id,
    });
  } else {
    employee.role = ROLES.EMPLOYEE;
    employee.companyId = company._id;
    employee.managerId = manager._id;
    await employee.save();
  }

  await ApprovalFlow.findOneAndUpdate(
    { companyId: company._id, name: "Default Flow" },
    {
      companyId: company._id,
      name: "Default Flow",
      steps: [
        { sequence: 1, role: ROLES.MANAGER },
        { sequence: 2, role: ROLES.ADMIN },
      ],
      rules: {
        type: RULE_TYPES.HYBRID,
        percentageThreshold: 50,
        specificApproverRoles: [ROLES.ADMIN],
      },
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log("Seed complete.");
  console.log("Admin:", admin.email, "Password: Admin@123");
  console.log("Manager:", manager.email, "Password: Manager@123");
  console.log("Employee:", employee.email, "Password: Employee@123");
  process.exit(0);
}

runSeed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
