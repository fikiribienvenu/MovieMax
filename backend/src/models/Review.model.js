// src/models/Review.model.js
"use strict";

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Review must belong to a movie"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating cannot exceed 10"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Review title cannot exceed 100 characters"],
    },
    body: {
      type: String,
      required: [true, "Review body is required"],
      minlength: [10, "Review must be at least 10 characters"],
      maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
    containsSpoilers: { type: Boolean, default: false },
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notHelpful: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isApproved: { type: Boolean, default: true },
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Each user can only review a movie once ───────────────────────────────────
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });
reviewSchema.index({ movie: 1, rating: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
reviewSchema.virtual("helpfulCount").get(function () {
  return this.helpful?.length || 0;
});

// ─── Post-save: update movie rating ───────────────────────────────────────────
reviewSchema.post("save", async function () {
  await mongoose.model("Movie").updateRating(this.movie);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await mongoose.model("Movie").updateRating(doc.movie);
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
