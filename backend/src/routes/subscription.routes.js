// src/routes/subscription.routes.js
"use strict";

const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");
const { protect } = require("../middleware/auth.middleware");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");

// ─── Public ───────────────────────────────────────────────────────────────────

// View available plans
router.get("/plans", subscriptionController.getPlans);

// AfriPay redirects user here after payment (GET with query params)
router.get("/callback", subscriptionController.handleCallback);

// AfriPay server-to-server IPN notification (POST)
router.post("/ipn", subscriptionController.handleIPN);

// ─── Protected ────────────────────────────────────────────────────────────────
router.use(protect);

// STEP 1 — Initiate checkout, get AfriPay form params
router.post(
  "/initiate",
  [
    body("plan")
      .notEmpty().withMessage("Plan is required")
      .isIn(["basic", "premium", "annual"]).withMessage("Invalid plan. Choose: basic, premium, or annual"),
  ],
  validate,
  subscriptionController.initiatePayment
);

// STEP 2 — Frontend polls this after returning from AfriPay
router.get("/status/:clientToken", subscriptionController.checkPaymentStatus);

// My subscription details
router.get("/my",           subscriptionController.getMySubscription);

// Billing history
router.get("/billing",      subscriptionController.getBillingHistory);

// Manage subscription
router.patch("/cancel",     subscriptionController.cancelSubscription);
router.patch("/reactivate", subscriptionController.reactivateSubscription);

module.exports = router;
