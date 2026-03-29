const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signToken(userId, role) {
  return jwt.sign({ sub: userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

module.exports = { signToken };
