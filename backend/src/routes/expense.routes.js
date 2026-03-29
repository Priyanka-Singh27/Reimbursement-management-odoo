const express = require("express");
const {
  submitExpense,
  listExpenses,
  getExpenseById,
} = require("../controllers/expense.controller");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { expenseValidator } = require("../validators/expense.validator");

const router = express.Router();

router.use(protect);
router.post("/", expenseValidator, validate, submitExpense);
router.get("/", listExpenses);
router.get("/:id", getExpenseById);

module.exports = router;
