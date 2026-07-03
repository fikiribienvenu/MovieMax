// src/middleware/validate.js
"use strict";

const { validationResult, body, param, query } = require("express-validator");
const AppError = require("../utils/AppError");

/**
 * Run after validation chains — collect errors and forward
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new AppError(messages.join(". "), 400));
  }
  next();
};

// ─── Auth Validators ──────────────────────────────────────────────────────────

const signupRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and a number"),
  body("confirmPassword")
    .notEmpty().withMessage("Please confirm your password")
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

const forgotPasswordRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail(),
];

const resetPasswordRules = [
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("confirmPassword")
    .notEmpty().withMessage("Please confirm your password")
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
];

// ─── Movie Validators ─────────────────────────────────────────────────────────

const movieRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn(["Action", "Drama", "Sci-Fi", "Thriller", "Comedy", "Horror", "Romance", "Animation", "Documentary", "Crime"])
    .withMessage("Invalid category"),
  body("year")
    .notEmpty().withMessage("Year is required")
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 }).withMessage("Invalid year"),
  body("duration")
    .notEmpty().withMessage("Duration is required")
    .isInt({ min: 1 }).withMessage("Duration must be a positive number (minutes)"),
  body("director").trim().notEmpty().withMessage("Director is required"),
];

// ─── Review Validators ────────────────────────────────────────────────────────

const reviewRules = [
  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isFloat({ min: 1, max: 10 }).withMessage("Rating must be between 1 and 10"),
  body("body")
    .trim()
    .notEmpty().withMessage("Review body is required")
    .isLength({ min: 10, max: 2000 }).withMessage("Review must be 10–2000 characters"),
];

// ─── Subscription Validators (AfriPay) ───────────────────────────────────────

const subscribeRules = [
  body("plan")
    .notEmpty().withMessage("Plan is required")
    .isIn(["basic", "premium", "annual"]).withMessage("Invalid plan. Choose: basic, premium, or annual"),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  movieRules,
  reviewRules,
  subscribeRules,
};
