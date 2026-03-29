const path = require("path");
const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const { extractReceiptData } = require("../services/ocr.service");

const scanReceipt = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Receipt image is required.");
  }

  const receiptPath = path.resolve(req.file.path);
  const extracted = await extractReceiptData(receiptPath);

  return apiResponse(res, StatusCodes.OK, "Receipt scanned successfully.", {
    receiptImageUrl: req.file.path,
    ...extracted,
  });
});

module.exports = { scanReceipt };
