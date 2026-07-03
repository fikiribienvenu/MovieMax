// src/controllers/review.controller.js
"use strict";

const Review = require("../models/Review.model");
const Movie = require("../models/Movie.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// ─── Get Reviews for a Movie ──────────────────────────────────────────────────
exports.getMovieReviews = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.movieId);
  if (!movie) return next(new AppError("Movie not found.", 404));

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;
  const sort = req.query.sort === "helpful" ? { helpful: -1 } : { createdAt: -1 };

  const [reviews, total] = await Promise.all([
    Review.find({ movie: req.params.movieId, isApproved: true })
      .populate("user", "name avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ movie: req.params.movieId, isApproved: true }),
  ]);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { movie: movie._id } },
    { $group: { _id: { $floor: "$rating" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    results: reviews.length,
    total,
    page,
    data: { reviews, ratingDistribution: distribution },
  });
});

// ─── Create Review ────────────────────────────────────────────────────────────
exports.createReview = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;

  const movie = await Movie.findById(movieId);
  if (!movie) return next(new AppError("Movie not found.", 404));

  // Check for duplicate
  const existing = await Review.findOne({ movie: movieId, user: req.user._id });
  if (existing) {
    return next(new AppError("You have already reviewed this movie. Edit your existing review instead.", 409));
  }

  const review = await Review.create({
    movie: movieId,
    user: req.user._id,
    rating: req.body.rating,
    title: req.body.title,
    body: req.body.body,
    containsSpoilers: req.body.containsSpoilers || false,
  });

  await review.populate("user", "name avatar");

  res.status(201).json({
    success: true,
    message: "Review posted successfully.",
    data: { review },
  });
});

// ─── Update Review ────────────────────────────────────────────────────────────
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError("Review not found.", 404));

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("You can only edit your own reviews.", 403));
  }

  const allowed = ["rating", "title", "body", "containsSpoilers"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) review[field] = req.body[field];
  });
  review.isEdited = true;
  review.editedAt = new Date();
  await review.save();

  await review.populate("user", "name avatar");

  res.status(200).json({
    success: true,
    message: "Review updated.",
    data: { review },
  });
});

// ─── Delete Review ────────────────────────────────────────────────────────────
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError("Review not found.", 404));

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("You can only delete your own reviews.", 403));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: "Review deleted successfully." });
});

// ─── Vote Helpful / Not Helpful ───────────────────────────────────────────────
exports.voteHelpful = asyncHandler(async (req, res, next) => {
  const { vote } = req.body; // "helpful" | "not_helpful"
  if (!["helpful", "not_helpful"].includes(vote)) {
    return next(new AppError("Vote must be 'helpful' or 'not_helpful'.", 400));
  }

  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError("Review not found.", 404));
  if (review.user.toString() === req.user._id.toString()) {
    return next(new AppError("You cannot vote on your own review.", 400));
  }

  const userId = req.user._id;

  if (vote === "helpful") {
    review.notHelpful.pull(userId);
    if (review.helpful.includes(userId)) {
      review.helpful.pull(userId); // toggle off
    } else {
      review.helpful.push(userId);
    }
  } else {
    review.helpful.pull(userId);
    if (review.notHelpful.includes(userId)) {
      review.notHelpful.pull(userId);
    } else {
      review.notHelpful.push(userId);
    }
  }

  await review.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      helpfulCount: review.helpful.length,
      notHelpfulCount: review.notHelpful.length,
    },
  });
});

// ─── Get My Review for a Movie ────────────────────────────────────────────────
exports.getMyReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({
    movie: req.params.movieId,
    user: req.user._id,
  });

  if (!review) return next(new AppError("You haven't reviewed this movie yet.", 404));

  res.status(200).json({ success: true, data: { review } });
});
