const express = require("express");
const {
  createApprovalFlow,
  listApprovalFlows,
  getApprovalFlowById,
  updateApprovalFlow,
  deleteApprovalFlow,
} = require("../controllers/approvalFlow.controller");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  flowValidator,
  updateFlowValidator,
} = require("../validators/approvalFlow.validator");
const { ROLES } = require("../constants/enums");

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.post("/", flowValidator, validate, createApprovalFlow);
router.get("/", listApprovalFlows);
router.get("/:id", getApprovalFlowById);
router.patch("/:id", updateFlowValidator, validate, updateApprovalFlow);
router.delete("/:id", deleteApprovalFlow);

module.exports = router;
