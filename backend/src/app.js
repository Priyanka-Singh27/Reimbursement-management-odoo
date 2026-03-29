const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl === "*" ? true : env.clientUrl }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// Serve uploaded receipt images statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/v1", routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
