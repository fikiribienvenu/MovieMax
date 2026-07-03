// src/models/Movie.model.js
"use strict";

const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    tagline: {
      type: String,
      maxlength: [300, "Tagline cannot exceed 300 characters"],
    },
    poster: {
      url: { type: String, required: true },
      publicId: String,
    },
    backdrop: {
      url: { type: String, required: true },
      publicId: String,
    },
    trailer: {
      url: { type: String },           // Full video URL
      youtubeId: { type: String },      // YouTube embed ID
    },
    video: {
      url: String,                      // Full movie URL (protected)
      publicId: String,
      duration: Number,                 // seconds
      quality: {
        type: String,
        enum: ["480p", "720p", "1080p", "4K"],
        default: "1080p",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Action", "Drama", "Sci-Fi", "Thriller", "Comedy", "Horror", "Romance", "Animation", "Documentary", "Crime"],
    },
    genres: [{ type: String }],
    director: {
      type: String,
      required: [true, "Director is required"],
    },
    cast: [
      {
        name: String,
        character: String,
        photo: String,
      },
    ],
    year: {
      type: Number,
      required: [true, "Release year is required"],
      min: 1900,
      max: new Date().getFullYear() + 2,
    },
    releaseDate: Date,
    duration: {
      type: Number, // minutes
      required: [true, "Duration is required"],
    },
    language: { type: String, default: "English" },
    country: { type: String, default: "USA" },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    ratingsCount: { type: Number, default: 0 },
    ageRating: {
      type: String,
      enum: ["G", "PG", "PG-13", "R", "NC-17", "NR"],
      default: "PG-13",
    },
    isSubscriptionRequired: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    badge: {
      type: String,
      enum: ["new", "hot", "exclusive", "coming_soon", null],
      default: null,
    },
    tags: [String],
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    subtitles: [
      {
        language: String,
        url: String,
      },
    ],
    streamingFrom: Date,
    streamingUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────
movieSchema.virtual("durationFormatted").get(function () {
  if (!this.duration) return null;
  const h = Math.floor(this.duration / 60);
  const m = this.duration % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
});

movieSchema.virtual("likesCount").get(function () {
  return this.likes?.length || 0;
});

movieSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "movie",
  localField: "_id",
});

// ─── Pre-save Hooks ───────────────────────────────────────────────────────────
movieSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-") + "-" + this._id.toString().slice(-6);
  }
  next();
});

// ─── Static Methods ───────────────────────────────────────────────────────────
movieSchema.statics.updateRating = async function (movieId) {
  const Review = mongoose.model("Review");
  const stats = await Review.aggregate([
    { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
    { $group: { _id: "$movie", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await this.findByIdAndUpdate(movieId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      ratingsCount: stats[0].count,
    });
  }
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
movieSchema.index({ title: "text", description: "text", tags: "text" });
movieSchema.index({ category: 1, isActive: 1 });
movieSchema.index({ isTrending: 1, isActive: 1 });
movieSchema.index({ isFeatured: 1 });
movieSchema.index({ year: -1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ views: -1 });
movieSchema.index({ slug: 1 });
movieSchema.index({ createdAt: -1 });

const Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;
