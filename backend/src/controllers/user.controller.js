const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, managerId } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already registered.");
  }

  if (managerId) {
    const manager = await User.findOne({
      _id: managerId,
      companyId: req.user.companyId,
    });
    if (!manager) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid managerId.");
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    managerId: managerId || null,
    companyId: req.user.companyId,
  });

  return apiResponse(res, StatusCodes.CREATED, "User created.", user);
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ companyId: req.user.companyId }).select("-password");
  return apiResponse(res, StatusCodes.OK, "Users fetched.", users);
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, managerId } = req.body;

  const user = await User.findOne({ _id: id, companyId: req.user.companyId });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
  }

  user.role = role || user.role;
  if (typeof managerId !== "undefined") user.managerId = managerId;
  await user.save();

  return apiResponse(res, StatusCodes.OK, "User updated.", user);
});

module.exports = {
  createUser,
  listUsers,
  updateUserRole,
};
