// src/controllers/movie.controller.js
"use strict";

const Movie = require("../models/Movie.model");
const Review = require("../models/Review.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const ApiFeatures = require("../utils/ApiFeatures");
const logger = require("../utils/logger");

// ─── Get All Movies ───────────────────────────────────────────────────────────
exports.getAllMovies = asyncHandler(async (req, res) => {
  const baseQuery = Movie.find({ isActive: true });
  const features = new ApiFeatures(baseQuery, req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const [movies, total] = await Promise.all([
    features.query.select("-video.url"), // Never expose full video URL in list
    Movie.countDocuments({ isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    results: movies.length,
    total,
    page: features._page || 1,
    limit: features._limit || 20,
    data: { movies },
  });
});

// ─── Get Single Movie ─────────────────────────────────────────────────────────
exports.getMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      { slug: req.params.id },
    ],
    isActive: true,
  }).populate({
    path: "reviews",
    match: { isApproved: true },
    select: "rating title body user createdAt helpful",
    populate: { path: "user", select: "name avatar" },
    options: { limit: 10, sort: { createdAt: -1 } },
  });

  if (!movie) return next(new AppError("Movie not found.", 404));

  // Increment view count (fire and forget)
  Movie.findByIdAndUpdate(movie._id, { $inc: { views: 1 } }).exec();

  // Determine what to expose based on subscription
  const isSubscribed = req.user?.isSubscribed;
  const movieData = movie.toObject();

  if (!isSubscribed) {
    delete movieData.video; // Hide full video from non-subscribers
  }

  res.status(200).json({
    success: true,
    data: { movie: movieData },
  });
});

// ─── Get Movie Stream URL (subscription required) ─────────────────────────────
exports.getStreamUrl = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id).select("+video.url");
  if (!movie) return next(new AppError("Movie not found.", 404));
  if (!movie.video?.url) return next(new AppError("Video not available.", 404));

  // In production: generate a signed/time-limited URL here
  res.status(200).json({
    success: true,
    data: {
      streamUrl: movie.video.url,
      quality: movie.video.quality,
      duration: movie.video.duration,
      subtitles: movie.subtitles,
    },
  });
});

// ─── Get Featured Movie ───────────────────────────────────────────────────────
exports.getFeaturedMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findOne({ isFeatured: true, isActive: true })
    .select("-video.url")
    .sort({ createdAt: -1 });

  if (!movie) return next(new AppError("No featured movie found.", 404));

  res.status(200).json({ success: true, data: { movie } });
});

// ─── Get Trending Movies ──────────────────────────────────────────────────────
exports.getTrendingMovies = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const movies = await Movie.find({ isTrending: true, isActive: true })
    .select("-video.url")
    .sort({ views: -1, rating: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    results: movies.length,
    data: { movies },
  });
});

// ─── Get Top Rated Movies ─────────────────────────────────────────────────────
exports.getTopRatedMovies = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const movies = await Movie.find({ isActive: true, ratingsCount: { $gte: 1 } })
    .select("-video.url")
    .sort({ rating: -1, ratingsCount: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    results: movies.length,
    data: { movies },
  });
});

// ─── Get Latest Movies ────────────────────────────────────────────────────────
exports.getLatestMovies = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const movies = await Movie.find({ isActive: true })
    .select("-video.url")
    .sort({ year: -1, createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    results: movies.length,
    data: { movies },
  });
});

// ─── Get Movies by Category ───────────────────────────────────────────────────
exports.getMoviesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const [movies, total] = await Promise.all([
    Movie.find({ category, isActive: true })
      .select("-video.url")
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit),
    Movie.countDocuments({ category, isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    results: movies.length,
    total,
    page,
    data: { movies },
  });
});

// ─── Search Movies ────────────────────────────────────────────────────────────
exports.searchMovies = asyncHandler(async (req, res) => {
  const { q, category, sort = "rating" } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };
  if (category && category !== "all") filter.category = category;

  let query;
  if (q?.trim()) {
    query = Movie.find({ $text: { $search: q.trim() }, ...filter }, {
      score: { $meta: "textScore" },
    }).sort({ score: { $meta: "textScore" } });
  } else {
    const sortMap = { rating: "-rating", year: "-year", views: "-views", title: "title" };
    query = Movie.find(filter).sort(sortMap[sort] || "-rating");
  }

  const [movies, total] = await Promise.all([
    query.select("-video.url").skip(skip).limit(limit),
    Movie.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: movies.length,
    total,
    page,
    query: q || "",
    data: { movies },
  });
});

// ─── Like / Unlike a Movie ────────────────────────────────────────────────────
exports.toggleLike = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return next(new AppError("Movie not found.", 404));

  const userId = req.user._id;
  const liked = movie.likes.includes(userId);

  if (liked) {
    movie.likes.pull(userId);
  } else {
    movie.likes.push(userId);
  }
  await movie.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: liked ? "Movie unliked." : "Movie liked.",
    data: { liked: !liked, likesCount: movie.likes.length },
  });
});

// ─── ADMIN: Create Movie ──────────────────────────────────────────────────────
exports.createMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.create(req.body);
  logger.info(`Movie created: ${movie.title} by admin ${req.user.email}`);
  res.status(201).json({
    success: true,
    message: "Movie created successfully.",
    data: { movie },
  });
});

// ─── ADMIN: Update Movie ──────────────────────────────────────────────────────
exports.updateMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!movie) return next(new AppError("Movie not found.", 404));

  logger.info(`Movie updated: ${movie.title} by admin ${req.user.email}`);
  res.status(200).json({
    success: true,
    message: "Movie updated successfully.",
    data: { movie },
  });
});

// ─── ADMIN: Delete Movie ──────────────────────────────────────────────────────
exports.deleteMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return next(new AppError("Movie not found.", 404));

  // Soft delete
  movie.isActive = false;
  await movie.save({ validateBeforeSave: false });

  logger.info(`Movie soft-deleted: ${movie.title} by admin ${req.user.email}`);
  res.status(200).json({ success: true, message: "Movie deleted successfully." });
});
