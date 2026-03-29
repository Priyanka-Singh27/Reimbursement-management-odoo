const { StatusCodes } = require("http-status-codes");
const Company = require("../models/company.model");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
const { ROLES } = require("../constants/enums");
const { signToken } = require("../services/token.service");
const { getCurrencyByCountry } = require("../services/currency.service");

const signup = asyncHandler(async (req, res) => {
  const { companyName, country, name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already registered.");
  }

  const defaultCurrency = await getCurrencyByCountry(country);

  const company = await Company.create({
    name: companyName,
    country,
    defaultCurrency,
  });

  const admin = await User.create({
    name,
    email,
    password,
    role: ROLES.ADMIN,
    companyId: company._id,
  });

  const token = signToken(admin._id, admin.role);
  return apiResponse(res, StatusCodes.CREATED, "Signup successful.", {
    token,
    user: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      companyId: admin.companyId,
    },
    company,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials.");
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials.");
  }

  const token = signToken(user._id, user.role);
  return apiResponse(res, StatusCodes.OK, "Login successful.", {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      managerId: user.managerId,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  return apiResponse(res, StatusCodes.OK, "Current user fetched.", req.user);
});

module.exports = {
  signup,
  login,
  me,
};
