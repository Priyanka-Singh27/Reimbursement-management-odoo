const express = require("express");
const {
  getMyCompany,
  updateMyCompany,
} = require("../controllers/company.controller");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { companyUpdateValidator } = require("../validators/company.validator");
const { ROLES } = require("../constants/enums");

const router = express.Router();

router.use(protect);

router.get("/me", getMyCompany);
router.patch("/me", authorize(ROLES.ADMIN), companyUpdateValidator, validate, updateMyCompany);

module.exports = router;
