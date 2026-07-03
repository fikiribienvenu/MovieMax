// src/controllers/user.controller.js
"use strict";

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");

// ─── Get My Profile ───────────────────────────────────────────────────────────
exports.getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("watchlist", "title poster rating year category duration")
    .populate("watchHistory.movie", "title poster year");

  res.status(200).json({
    success: true,
    data: { user: user.toSafeObject() },
  });
});

// ─── Update My Profile ────────────────────────────────────────────────────────
exports.updateMyProfile = asyncHandler(async (req, res, next) => {
  // Do NOT allow password updates here — use /auth/update-password
  const { password, confirmPassword, role, subscription, ...allowedFields } = req.body;

  const allowedUpdates = ["name", "avatar"];
  const updates = {};
  allowedUpdates.forEach((field) => {
    if (allowedFields[field] !== undefined) updates[field] = allowedFields[field];
  });

  if (Object.keys(updates).length === 0) {
    return next(new AppError("No valid fields to update.", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: { user: user.toSafeObject() },
  });
});

// ─── Delete My Account ────────────────────────────────────────────────────────
exports.deleteMyAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  if (!password) return next(new AppError("Please provide your password to confirm.", 400));

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(password))) {
    return next(new AppError("Incorrect password.", 401));
  }

  // Soft delete — set isActive to false
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  logger.info(`Account deactivated: ${user.email}`);
  res.status(200).json({ success: true, message: "Account deactivated successfully." });
});

// ─── Watchlist ────────────────────────────────────────────────────────────────
exports.getWatchlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "watchlist",
    "title poster rating year category duration badge isTrending"
  );

  res.status(200).json({
    success: true,
    results: user.watchlist.length,
    data: { watchlist: user.watchlist },
  });
});

exports.addToWatchlist = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;

  const movie = await Movie.findById(movieId);
  if (!movie) return next(new AppError("Movie not found.", 404));

  const user = await User.findById(req.user._id);
  if (user.watchlist.includes(movieId)) {
    return res.status(200).json({
      success: true,
      message: "Movie is already in your watchlist.",
      data: { watchlist: user.watchlist },
    });
  }

  user.watchlist.push(movieId);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `"${movie.title}" added to your watchlist.`,
    data: { watchlist: user.watchlist },
  });
});

exports.removeFromWatchlist = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;

  const user = await User.findById(req.user._id);
  const index = user.watchlist.indexOf(movieId);
  if (index === -1) {
    return next(new AppError("Movie not found in your watchlist.", 404));
  }

  user.watchlist.splice(index, 1);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Movie removed from your watchlist.",
    data: { watchlist: user.watchlist },
  });
});

// ─── Watch History ────────────────────────────────────────────────────────────
exports.getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "watchHistory.movie",
    "title poster rating year category duration"
  );

  const history = user.watchHistory
    .sort((a, b) => b.watchedAt - a.watchedAt)
    .slice(0, 50); // Last 50 entries

  res.status(200).json({
    success: true,
    results: history.length,
    data: { watchHistory: history },
  });
});

exports.updateWatchProgress = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;
  const { progress } = req.body; // seconds watched

  if (progress === undefined || progress < 0) {
    return next(new AppError("Valid progress value (seconds) is required.", 400));
  }

  const user = await User.findById(req.user._id);
  const existing = user.watchHistory.find(
    (h) => h.movie.toString() === movieId
  );

  if (existing) {
    existing.progress = progress;
    existing.watchedAt = new Date();
  } else {
    user.watchHistory.push({ movie: movieId, progress, watchedAt: new Date() });
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Watch progress saved.",
    data: { progress },
  });
});

exports.clearWatchHistory = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { watchHistory: [] });
  res.status(200).json({ success: true, message: "Watch history cleared." });
});

// ─── Get Subscription Status ──────────────────────────────────────────────────
exports.getSubscriptionStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    data: {
      subscription: user.subscription,
      isSubscribed: user.isSubscribed,
    },
  });
});
