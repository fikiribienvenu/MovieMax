// src/routes/user.routes.js
"use strict";

const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

// All user routes require authentication
router.use(protect);

// Profile
router.get("/me",             userController.getMyProfile);
router.patch("/me",           userController.updateMyProfile);
router.delete("/me",          userController.deleteMyAccount);

// Subscription status
router.get("/me/subscription", userController.getSubscriptionStatus);

// Watchlist
router.get("/me/watchlist",                         userController.getWatchlist);
router.post("/me/watchlist/:movieId",               userController.addToWatchlist);
router.delete("/me/watchlist/:movieId",             userController.removeFromWatchlist);

// Watch History
router.get("/me/history",                           userController.getWatchHistory);
router.patch("/me/history/:movieId/progress",       userController.updateWatchProgress);
router.delete("/me/history",                        userController.clearWatchHistory);

module.exports = router;
