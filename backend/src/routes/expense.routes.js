const express = require("express");
const {
  submitExpense,
  listExpenses,
  getExpenseById,
  deleteExpense,
  getStats,
} = require("../controllers/expense.controller");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { expenseValidator } = require("../validators/expense.validator");
const { ROLES } = require("../constants/enums");

const router = express.Router();

router.use(protect);

router.get("/stats", getStats);
router.post("/", expenseValidator, validate, submitExpense);
router.get("/", listExpenses);
router.get("/:id", getExpenseById);
router.delete("/:id", deleteExpense);

module.exports = router;
