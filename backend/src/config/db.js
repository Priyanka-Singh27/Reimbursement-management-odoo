const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

async function connectDB() {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is required in environment variables.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  logger.info("MongoDB connected successfully.");
}

module.exports = connectDB;
