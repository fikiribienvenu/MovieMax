// src/routes/review.routes.js
"use strict";

const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

// Stand-alone review operations (not nested under /movies/:movieId)
router.patch("/:id",        protect, reviewController.updateReview);
router.delete("/:id",       protect, reviewController.deleteReview);
router.post("/:id/vote",    protect, reviewController.voteHelpful);

module.exports = router;
