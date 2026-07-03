// src/middleware/auth.middleware.js
"use strict";

const { verifyToken } = require("../utils/jwt");
const User = require("../models/User.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * protect — require a valid JWT to access a route
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Fallback to cookie
  else if (req.cookies?.jwt && req.cookies.jwt !== "loggedout") {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please sign in to continue.", 401));
  }

  // Verify token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Your session has expired. Please sign in again.", 401));
    }
    return next(new AppError("Invalid token. Please sign in again.", 401));
  }

  // Check user still exists
  const currentUser = await User.findById(decoded.id).select("+password");
  if (!currentUser) {
    return next(new AppError("The user associated with this token no longer exists.", 401));
  }

  // Check account is active
  if (!currentUser.isActive) {
    return next(new AppError("Your account has been deactivated. Please contact support.", 401));
  }

  req.user = currentUser;
  next();
});

/**
 * optionalAuth — attach user to req if token present, but don't block
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt && req.cookies.jwt !== "loggedout") {
    token = req.cookies.jwt;
  }

  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch (_) {
    // Invalid token is fine for optional auth
  }
  next();
});

/**
 * restrictTo — require one of the given roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
};

/**
 * requireSubscription — require an active subscription
 */
const requireSubscription = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const isSubscribed =
    user.subscription?.status === "active" &&
    user.subscription?.plan !== "none" &&
    (!user.subscription?.currentPeriodEnd ||
      user.subscription.currentPeriodEnd > new Date());

  if (!isSubscribed) {
    return next(
      new AppError(
        "This content requires an active subscription. Please subscribe to access it.",
        403
      )
    );
  }
  next();
});

module.exports = { protect, optionalAuth, restrictTo, requireSubscription };
