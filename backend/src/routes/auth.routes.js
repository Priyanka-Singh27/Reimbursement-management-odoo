const express = require("express");
const { signup, login, me } = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");
const {
  signupValidator,
  loginValidator,
} = require("../validators/auth.validator");

const router = express.Router();

router.post("/signup", signupValidator, validate, signup);
router.post("/login", loginValidator, validate, login);
router.get("/me", protect, me);

module.exports = router;
