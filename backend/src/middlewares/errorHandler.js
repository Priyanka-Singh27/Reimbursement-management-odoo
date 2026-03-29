const { StatusCodes } = require("http-status-codes");
const apiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

function notFoundHandler(req, res) {
  return apiResponse(
    res,
    StatusCodes.NOT_FOUND,
    `Route ${req.originalUrl} not found.`
  );
}

function errorHandler(err, req, res, next) {
  logger.error(err);

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";

  return apiResponse(res, statusCode, message, {
    details: err.details || null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
