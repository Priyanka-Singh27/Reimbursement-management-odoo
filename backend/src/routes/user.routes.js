const express = require("express");
const {
  createUser,
  listUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require("../controllers/user.controller");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { ROLES } = require("../constants/enums");
const {
  createUserValidator,
  updateUserValidator,
} = require("../validators/user.validator");

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get("/", listUsers);
router.post("/", createUserValidator, validate, createUser);
router.get("/:id", getUserById);
router.patch("/:id/role", updateUserValidator, validate, updateUserRole);
router.delete("/:id", deleteUser);

module.exports = router;
