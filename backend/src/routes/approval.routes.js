const express = require("express");
const {
  listPendingApprovals,
  approve,
  reject,
} = require("../controllers/approval.controller");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { approvalActionValidator } = require("../validators/expense.validator");
const { ROLES } = require("../constants/enums");

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN, ROLES.MANAGER));
router.get("/pending", listPendingApprovals);
router.post("/:expenseId/approve", approvalActionValidator, validate, approve);
router.post("/:expenseId/reject", approvalActionValidator, validate, reject);

module.exports = router;
