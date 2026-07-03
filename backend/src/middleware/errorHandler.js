// src/middleware/errorHandler.js
"use strict";

const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

// ─── Error Transformers ───────────────────────────────────────────────────────

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(
    `An account with ${field} "${value}" already exists. Please use a different ${field}.`,
    409
  );
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Validation failed: ${errors.join(". ")}`, 400);
};

const handleJWTError = () =>
  new AppError("Invalid authentication token. Please sign in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please sign in again.", 401);

// ─── Response Senders ─────────────────────────────────────────────────────────

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error("UNHANDLED ERROR:", err);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
};

// ─── Main Error Handler ───────────────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  logger.error(`${err.statusCode} ${req.method} ${req.originalUrl} — ${err.message}`);

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, res);
  }

  // Transform known Mongoose/JWT errors into AppErrors
  let error = { ...err, message: err.message };

  if (err.name === "CastError") error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  sendErrorProd(error, res);
};

module.exports = errorHandler;
