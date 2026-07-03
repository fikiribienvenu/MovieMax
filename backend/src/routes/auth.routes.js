// src/routes/auth.routes.js
"use strict";

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const {
  validate,
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require("../middleware/validate");

// Public routes
router.post("/signup",  signupRules,        validate, authController.signup);
router.post("/login",   loginRules,         validate, authController.login);
router.post("/logout",                                authController.logout);
router.post("/forgot-password", forgotPasswordRules, validate, authController.forgotPassword);
router.patch("/reset-password/:token",  resetPasswordRules, validate, authController.resetPassword);

// Protected routes
router.use(protect);
router.get("/me",                       authController.getMe);
router.post("/refresh-token",           authController.refreshToken);
router.patch("/update-password",        authController.updatePassword);

module.exports = router;
