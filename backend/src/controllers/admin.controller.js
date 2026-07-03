// src/controllers/admin.controller.js
"use strict";

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Subscription = require("../models/Subscription.model");
const Review = require("../models/Review.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const ApiFeatures = require("../utils/ApiFeatures");
const logger = require("../utils/logger");

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisMonth,
    totalMovies,
    activeSubscriptions,
    totalRevenue,
    recentSubscriptions,
    topMovies,
    categoryBreakdown,
    userGrowth,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Movie.countDocuments({ isActive: true }),
    Subscription.countDocuments({ status: "active" }),
    Subscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$price.amount" } } },
    ]),
    Subscription.find({ createdAt: { $gte: sevenDaysAgo } })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("plan price status createdAt user"),
    Movie.find({ isActive: true })
      .sort({ views: -1 })
      .limit(5)
      .select("title views rating category poster"),
    Movie.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]),
  ]);

  const totalRevenueAmount = totalRevenue[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        newUsersThisMonth,
        totalMovies,
        activeSubscriptions,
        totalRevenue: `$${(totalRevenueAmount / 100).toFixed(2)}`,
        totalRevenueRaw: totalRevenueAmount,
      },
      recentSubscriptions,
      topMovies,
      categoryBreakdown,
      userGrowth: userGrowth.reverse(),
    },
  });
});

// ─── User Management ──────────────────────────────────────────────────────────
exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
  if (req.query.plan) filter["subscription.plan"] = req.query.plan;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -passwordResetToken -emailVerificationToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: users.length,
    total,
    page,
    data: { users },
  });
});

exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select("-password -passwordResetToken -emailVerificationToken")
    .populate("watchlist", "title poster");

  if (!user) return next(new AppError("User not found.", 404));

  const subscriptions = await Subscription.find({ user: user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { user, subscriptions },
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const { password, ...updates } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) return next(new AppError("User not found.", 404));

  logger.info(`Admin ${req.user.email} updated user ${user.email}`);
  res.status(200).json({ success: true, message: "User updated.", data: { user } });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError("You cannot delete your own admin account.", 400));
  }

  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  logger.info(`Admin ${req.user.email} deactivated user ${user.email}`);
  res.status(200).json({ success: true, message: "User deactivated." });
});

// ─── Movie Management ─────────────────────────────────────────────────────────
exports.getAllMoviesAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  const filter = {};
  if (search) filter.$text = { $search: search };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

  const [movies, total] = await Promise.all([
    Movie.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Movie.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, results: movies.length, total, page, data: { movies } });
});

exports.toggleMovieFeatured = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return next(new AppError("Movie not found.", 404));

  // Unfeatured any existing featured movie first
  if (!movie.isFeatured) {
    await Movie.updateMany({ isFeatured: true }, { isFeatured: false });
  }

  movie.isFeatured = !movie.isFeatured;
  await movie.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `Movie ${movie.isFeatured ? "set as" : "removed from"} featured.`,
    data: { isFeatured: movie.isFeatured },
  });
});

exports.toggleMovieTrending = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return next(new AppError("Movie not found.", 404));

  movie.isTrending = !movie.isTrending;
  await movie.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `Movie ${movie.isTrending ? "marked as" : "removed from"} trending.`,
    data: { isTrending: movie.isTrending },
  });
});

// ─── Subscription Management ──────────────────────────────────────────────────
exports.getAllSubscriptions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.plan) filter.plan = req.query.plan;

  const [subscriptions, total] = await Promise.all([
    Subscription.find(filter)
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Subscription.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, results: subscriptions.length, total, page, data: { subscriptions } });
});

// ─── Reviews Moderation ───────────────────────────────────────────────────────
exports.getAllReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find()
      .populate("user", "name email")
      .populate("movie", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(),
  ]);

  res.status(200).json({ success: true, results: reviews.length, total, page, data: { reviews } });
});

exports.approveReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );
  if (!review) return next(new AppError("Review not found.", 404));
  res.status(200).json({ success: true, message: "Review approved.", data: { review } });
});
