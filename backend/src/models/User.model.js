// src/models/User.model.js
"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Subscription
    subscription: {
      plan: {
        type: String,
        enum: ["none", "basic", "premium", "annual"],
        default: "none",
      },
      status: {
        type: String,
        enum: ["inactive", "active", "cancelled", "past_due"],
        default: "inactive",
      },
      stripeCustomerId: String,
      stripeSubscriptionId: String,
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      cancelAtPeriodEnd: { type: Boolean, default: false },
    },

    // Watchlist
    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],

    // Watch history
    watchHistory: [
      {
        movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
        watchedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 }, // seconds watched
      },
    ],

    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Email verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual("isSubscribed").get(function () {
  return (
    this.subscription.status === "active" &&
    this.subscription.plan !== "none" &&
    (!this.subscription.currentPeriodEnd ||
      this.subscription.currentPeriodEnd > new Date())
  );
});

userSchema.virtual("initials").get(function () {
  return this.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// ─── Pre-save Hooks ───────────────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.__v;
  return obj;
};

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ "subscription.status": 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);
module.exports = User;
