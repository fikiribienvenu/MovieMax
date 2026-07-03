// src/routes/admin.routes.js
"use strict";

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const movieController = require("../controllers/movie.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const { validate, movieRules } = require("../middleware/validate");

// All admin routes: must be logged in AND have role "admin"
router.use(protect, restrictTo("admin"));

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);

// User management
router.get("/users",            adminController.getAllUsers);
router.get("/users/:id",        adminController.getUserById);
router.patch("/users/:id",      adminController.updateUser);
router.delete("/users/:id",     adminController.deleteUser);

// Movie management
router.get("/movies",                           adminController.getAllMoviesAdmin);
router.post("/movies",       movieRules, validate, movieController.createMovie);
router.patch("/movies/:id",                     movieController.updateMovie);
router.delete("/movies/:id",                    movieController.deleteMovie);
router.patch("/movies/:id/featured",            adminController.toggleMovieFeatured);
router.patch("/movies/:id/trending",            adminController.toggleMovieTrending);

// Subscription management
router.get("/subscriptions",    adminController.getAllSubscriptions);

// Review moderation
router.get("/reviews",          adminController.getAllReviews);
router.patch("/reviews/:id/approve", adminController.approveReview);

module.exports = router;
