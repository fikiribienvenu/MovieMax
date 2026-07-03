// src/routes/movie.routes.js
"use strict";

const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movie.controller");
const reviewController = require("../controllers/review.controller");
const { protect, optionalAuth, restrictTo, requireSubscription } = require("../middleware/auth.middleware");
const { validate, movieRules, reviewRules } = require("../middleware/validate");

// ─── Public / Optional Auth Routes ───────────────────────────────────────────
router.get("/",           optionalAuth, movieController.getAllMovies);
router.get("/featured",   optionalAuth, movieController.getFeaturedMovie);
router.get("/trending",   optionalAuth, movieController.getTrendingMovies);
router.get("/top-rated",  optionalAuth, movieController.getTopRatedMovies);
router.get("/latest",     optionalAuth, movieController.getLatestMovies);
router.get("/search",     optionalAuth, movieController.searchMovies);
router.get("/category/:category", optionalAuth, movieController.getMoviesByCategory);

// Single movie — subscription check is done inside controller
router.get("/:id",        optionalAuth, movieController.getMovie);

// ─── Protected: Subscription Required ────────────────────────────────────────
router.get("/:id/stream", protect, requireSubscription, movieController.getStreamUrl);

// ─── Protected: Auth Required ─────────────────────────────────────────────────
router.post("/:id/like",  protect, movieController.toggleLike);

// Reviews (nested under movies)
router.get("/:movieId/reviews",         optionalAuth, reviewController.getMovieReviews);
router.get("/:movieId/reviews/mine",    protect,      reviewController.getMyReview);
router.post("/:movieId/reviews",        protect,      reviewRules, validate, reviewController.createReview);
router.patch("/reviews/:id",            protect,      reviewController.updateReview);
router.delete("/reviews/:id",           protect,      reviewController.deleteReview);
router.post("/reviews/:id/vote",        protect,      reviewController.voteHelpful);

// ─── Admin Only ───────────────────────────────────────────────────────────────
router.use(protect, restrictTo("admin"));
router.post("/",          movieRules, validate, movieController.createMovie);
router.patch("/:id",                  movieController.updateMovie);
router.delete("/:id",                 movieController.deleteMovie);

module.exports = router;
