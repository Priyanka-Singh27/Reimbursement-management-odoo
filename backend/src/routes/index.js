const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const expenseRoutes = require("./expense.routes");
const approvalFlowRoutes = require("./approvalFlow.routes");
const approvalRoutes = require("./approval.routes");
const ocrRoutes = require("./ocr.routes");
const companyRoutes = require("./company.routes");

const router = express.Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({ success: true, message: "Backend is healthy." });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/expenses", expenseRoutes);
router.use("/approval-flows", approvalFlowRoutes);
router.use("/approvals", approvalRoutes);
router.use("/ocr", ocrRoutes);
router.use("/companies", companyRoutes);

module.exports = router;
