const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const ApiError = require("../utils/apiError");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "Validation failed.",
        errors.array()
      )
    );
  }
  return next();
}

module.exports = validate;
