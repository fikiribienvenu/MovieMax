// src/server.js
"use strict";

const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/database");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info(`🎬 CineMax API running on port ${PORT} [${process.env.NODE_ENV}]`);
    logger.info(`📖 API Docs available at http://localhost:${PORT}/api/v1`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Promise Rejection:", err.message);
    server.close(() => process.exit(1));
  });
});
