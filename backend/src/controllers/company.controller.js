const { StatusCodes } = require("http-status-codes");
const Company = require("../models/company.model");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

const getMyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.user.companyId);
  if (!company) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Company not found.");
  }
  return apiResponse(res, StatusCodes.OK, "Company fetched.", company);
});

const updateMyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.user.companyId);
  if (!company) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Company not found.");
  }

  company.name = req.body.name || company.name;
  company.country = req.body.country || company.country;

  await company.save();
  return apiResponse(res, StatusCodes.OK, "Company updated.", company);
});

module.exports = {
  getMyCompany,
  updateMyCompany,
};
