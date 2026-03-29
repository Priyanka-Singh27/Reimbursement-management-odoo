const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const env = require("../config/env");
const ApiError = require("../utils/apiError");
const User = require("../models/user.model");

async function protect(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, "Missing authentication token.")
    );
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select("-password");
    if (!user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "User not found."));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token."));
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(StatusCodes.FORBIDDEN, "You are not allowed to do this.")
      );
    }

    return next();
  };
}

module.exports = {
  protect,
  authorize,
};
