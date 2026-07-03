// src/controllers/auth.controller.js
"use strict";

const crypto = require("crypto");
const User = require("../models/User.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { createSendToken, clearTokenCookie } = require("../utils/jwt");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/email");
const logger = require("../utils/logger");

// ─── Signup ───────────────────────────────────────────────────────────────────
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("An account with this email already exists.", 409));
  }

  const user = await User.create({ name, email, password });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user).catch((err) =>
    logger.warn(`Welcome email failed for ${user.email}: ${err.message}`)
  );

  logger.info(`New user registered: ${user.email}`);
  createSendToken(user, 201, res, "Account created successfully. Welcome to CineMax!");
});

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and explicitly select password (it's select:false by default)
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated. Please contact support.", 401));
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${user.email}`);
  createSendToken(user, 200, res, "Logged in successfully.");
});

// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully." });
});

// ─── Get Current User ─────────────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("watchlist", "title poster rating year category");
  res.status(200).json({
    success: true,
    data: { user: user.toSafeObject() },
  });
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // Always send success to prevent email enumeration
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, resetToken);
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    logger.error(`Password reset email failed: ${err.message}`);
    return next(new AppError("Failed to send reset email. Please try again later.", 500));
  }
});

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Password reset token is invalid or has expired.", 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info(`Password reset successful for: ${user.email}`);
  createSendToken(user, 200, res, "Password reset successful. You are now logged in.");
});

// ─── Update Password (while logged in) ───────────────────────────────────────
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Your current password is incorrect.", 401));
  }

  if (newPassword.length < 8) {
    return next(new AppError("New password must be at least 8 characters.", 400));
  }

  user.password = newPassword;
  await user.save();

  logger.info(`Password updated for: ${user.email}`);
  createSendToken(user, 200, res, "Password updated successfully.");
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
exports.refreshToken = asyncHandler(async (req, res) => {
  // protect middleware already validated — just issue a new token
  createSendToken(req.user, 200, res, "Token refreshed.");
});
