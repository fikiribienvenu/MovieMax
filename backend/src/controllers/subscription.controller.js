// src/controllers/subscription.controller.js
"use strict";

const Subscription = require("../models/Subscription.model");
const User = require("../models/User.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSubscriptionConfirmEmail } = require("../utils/email");
const logger = require("../utils/logger");
const afripay = require("../services/afripay.service");

// ─── Plan Configuration (prices in RWF) ──────────────────────────────────────
const PLANS = {
  basic: {
    name: "Basic",
    price: afripay.PLAN_PRICES_RWF.basic,
    currency: "RWF",
    billingCycle: "monthly",
    durationDays: 30,
    features: ["HD 720p", "1 screen", "500+ movies", "Mobile & Tablet"],
  },
  premium: {
    name: "Premium",
    price: afripay.PLAN_PRICES_RWF.premium,
    currency: "RWF",
    billingCycle: "monthly",
    durationDays: 30,
    features: ["4K Ultra HD", "4 screens", "All movies", "All devices", "Downloads", "Early access"],
  },
  annual: {
    name: "Annual Premium",
    price: afripay.PLAN_PRICES_RWF.annual,
    currency: "RWF",
    billingCycle: "yearly",
    durationDays: 365,
    features: ["Everything in Premium", "Priority support", "6 screens", "6 profiles", "No ads"],
  },
};

// ─── Get All Plans ────────────────────────────────────────────────────────────
exports.getPlans = asyncHandler(async (req, res) => {
  const plans = Object.entries(PLANS).map(([id, plan]) => ({
    id,
    ...plan,
    priceFormatted: `RWF ${plan.price.toLocaleString()}`,
  }));
  res.status(200).json({ success: true, data: { plans } });
});

// ─── STEP 1: Initiate Checkout — returns AfriPay form params ─────────────────
// POST /subscriptions/initiate
// Body: { plan: "basic" | "premium" | "annual" }
exports.initiatePayment = asyncHandler(async (req, res, next) => {
  const { plan: planId } = req.body;
  const planConfig = PLANS[planId];
  if (!planConfig) return next(new AppError("Invalid subscription plan.", 400));

  const user = await User.findById(req.user._id);
  if (user.isSubscribed) {
    return next(new AppError("You already have an active subscription. Cancel it first to change plans.", 400));
  }

  // Build AfriPay checkout parameters
  const checkout = afripay.buildCheckoutParams({
    userId: user._id.toString(),
    planId,
    planName: planConfig.name,
    comment: `CineMax ${planConfig.name} Subscription — ${user.email}`,
  });

  // Pre-create a PENDING subscription record so we can match it on callback
  const now = new Date();
  const periodEnd = new Date(now.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);

  const subscription = await Subscription.create({
    user: user._id,
    plan: planId,
    status: "pending",
    billingCycle: planConfig.billingCycle,
    price: { amount: planConfig.price, currency: planConfig.currency },
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    afripay: {
      clientToken: checkout.clientToken,
      checkoutUrl: checkout.checkoutUrl,
      appId: afripay.AFRIPAY_CONFIG.appId,
    },
    payments: [{
      amount: planConfig.price,
      currency: planConfig.currency,
      status: "pending",
      gateway: "afripay",
      invoiceId: `inv_afripay_${Date.now()}`,
    }],
  });

  logger.info(`Payment initiated: user=${user.email} plan=${planId} token=${checkout.clientToken}`);

  // Return everything the frontend needs to render or submit the AfriPay form
  res.status(200).json({
    success: true,
    message: "Payment session created. Redirect user to AfriPay checkout.",
    data: {
      subscriptionId: subscription._id,
      plan: planId,
      planName: planConfig.name,
      amount: planConfig.price,
      currency: planConfig.currency,
      priceFormatted: `RWF ${planConfig.price.toLocaleString()}`,

      // AfriPay checkout details
      afripay: {
        checkoutUrl: checkout.checkoutUrl,
        fields: checkout.fields,        // All hidden form fields
        clientToken: checkout.clientToken,
        returnUrl: checkout.returnUrl,
      },

      // Ready-to-use HTML form (embed in frontend or redirect)
      checkoutForm: buildAfriPayHtmlForm(checkout),
    },
  });
});

// ─── STEP 2: Payment Callback — AfriPay redirects user here after payment ────
// GET /subscriptions/callback?status=success&transaction_id=TXN123&client_token=...
exports.handleCallback = asyncHandler(async (req, res, next) => {
  const parsed = afripay.parseCallbackStatus(req.query);

  logger.info(`AfriPay callback received: status=${parsed.raw} txn=${parsed.transactionId} token=${parsed.clientToken}`);

  if (!parsed.clientToken) {
    return next(new AppError("Invalid payment callback: missing token.", 400));
  }

  // Verify and decode the client token
  const verification = afripay.verifyCallback({
    app_id: req.query.app_id,
    client_token: parsed.clientToken,
    status: parsed.raw,
    transaction_id: parsed.transactionId,
  });

  if (!verification.valid) {
    logger.warn(`Invalid AfriPay callback: ${verification.reason}`);
    return next(new AppError(`Payment verification failed: ${verification.reason}`, 400));
  }

  const { userId, planId } = verification.decoded;

  // Find the pending subscription for this token
  const subscription = await Subscription.findOne({
    user: userId,
    plan: planId,
    status: "pending",
    "afripay.clientToken": parsed.clientToken,
  });

  if (!subscription) {
    logger.warn(`No pending subscription found for token=${parsed.clientToken}`);
    return next(new AppError("No pending subscription found for this payment session.", 404));
  }

  // Store raw callback data
  const rawCallbackMap = new Map(Object.entries(req.query).map(([k, v]) => [k, String(v)]));
  subscription.afripay.rawCallback = rawCallbackMap;
  subscription.afripay.callbackReceivedAt = new Date();
  subscription.afripay.transactionId = parsed.transactionId;

  if (parsed.succeeded) {
    // ── Payment Succeeded ──────────────────────────────────────────
    subscription.status = "active";
    subscription.payments[0].status = "succeeded";
    subscription.payments[0].transactionId = parsed.transactionId;
    subscription.payments[0].paidAt = new Date();
    await subscription.save();

    // Update user subscription
    await User.findByIdAndUpdate(userId, {
      "subscription.plan": planId,
      "subscription.status": "active",
      "subscription.currentPeriodStart": subscription.currentPeriodStart,
      "subscription.currentPeriodEnd": subscription.currentPeriodEnd,
    });

    // Send confirmation email
    const user = await User.findById(userId);
    sendSubscriptionConfirmEmail(user, PLANS[planId].name, subscription.currentPeriodEnd)
      .catch((err) => logger.warn(`Subscription email failed: ${err.message}`));

    logger.info(`Payment succeeded: user=${userId} plan=${planId} txn=${parsed.transactionId}`);

    // Redirect user to success page on frontend
    const successUrl = `${process.env.CLIENT_URL}/payment/success?plan=${planId}&txn=${parsed.transactionId || ""}`;
    return res.redirect(successUrl);

  } else if (parsed.failed) {
    // ── Payment Failed ─────────────────────────────────────────────
    subscription.status = "failed";
    subscription.payments[0].status = "failed";
    await subscription.save();

    logger.warn(`Payment failed: user=${userId} plan=${planId} status=${parsed.raw}`);

    const failUrl = `${process.env.CLIENT_URL}/payment/failed?reason=${encodeURIComponent(parsed.raw)}`;
    return res.redirect(failUrl);

  } else {
    // ── Payment Pending / Unknown ──────────────────────────────────
    await subscription.save();
    logger.info(`Payment pending: user=${userId} plan=${planId} status=${parsed.raw}`);

    const pendingUrl = `${process.env.CLIENT_URL}/payment/pending?token=${parsed.clientToken}`;
    return res.redirect(pendingUrl);
  }
});

// ─── STEP 2b: Check Payment Status (frontend polls this) ─────────────────────
// GET /subscriptions/status/:clientToken
exports.checkPaymentStatus = asyncHandler(async (req, res, next) => {
  const { clientToken } = req.params;

  const decoded = afripay.decodeClientToken(clientToken);
  if (!decoded || decoded.userId !== req.user._id.toString()) {
    return next(new AppError("Invalid or unauthorized token.", 403));
  }

  const subscription = await Subscription.findOne({
    user: req.user._id,
    "afripay.clientToken": clientToken,
  }).sort({ createdAt: -1 });

  if (!subscription) {
    return next(new AppError("Payment session not found.", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      status: subscription.status,
      plan: subscription.plan,
      transactionId: subscription.afripay?.transactionId || null,
      isActive: subscription.status === "active",
      currentPeriodEnd: subscription.currentPeriodEnd,
    },
  });
});

// ─── Get My Subscription ──────────────────────────────────────────────────────
exports.getMySubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: { $in: ["active", "pending"] },
  }).sort({ createdAt: -1 });

  const planConfig = PLANS[user.subscription?.plan] || null;

  res.status(200).json({
    success: true,
    data: {
      isSubscribed: user.isSubscribed,
      subscription: user.subscription,
      planDetails: planConfig
        ? { ...planConfig, priceFormatted: `RWF ${planConfig.price.toLocaleString()}` }
        : null,
      billingHistory: subscription?.payments || [],
      daysRemaining: subscription?.daysRemaining || 0,
    },
  });
});

// ─── Cancel Subscription ──────────────────────────────────────────────────────
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user.isSubscribed) {
    return next(new AppError("You do not have an active subscription.", 400));
  }

  await Subscription.findOneAndUpdate(
    { user: req.user._id, status: "active" },
    { status: "cancelled", cancelledAt: new Date(), cancelAtPeriodEnd: true }
  );

  await User.findByIdAndUpdate(req.user._id, {
    "subscription.status": "cancelled",
    "subscription.cancelAtPeriodEnd": true,
  });

  logger.info(`Subscription cancelled: user=${user.email}`);

  res.status(200).json({
    success: true,
    message: "Subscription cancelled. You retain access until the end of your billing period.",
    data: { cancelledAt: new Date(), accessUntil: user.subscription.currentPeriodEnd },
  });
});

// ─── Reactivate Subscription ──────────────────────────────────────────────────
exports.reactivateSubscription = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.subscription?.status !== "cancelled") {
    return next(new AppError("No cancelled subscription found.", 400));
  }

  if (user.subscription.currentPeriodEnd < new Date()) {
    return next(new AppError("Your subscription period has ended. Please subscribe again.", 400));
  }

  await Subscription.findOneAndUpdate(
    { user: req.user._id, status: "cancelled" },
    { status: "active", cancelledAt: null, cancelAtPeriodEnd: false }
  );

  await User.findByIdAndUpdate(req.user._id, {
    "subscription.status": "active",
    "subscription.cancelAtPeriodEnd": false,
  });

  res.status(200).json({ success: true, message: "Subscription reactivated successfully!" });
});

// ─── Get Billing History ──────────────────────────────────────────────────────
exports.getBillingHistory = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select("plan status billingCycle price payments currentPeriodStart currentPeriodEnd afripay.transactionId createdAt");

  res.status(200).json({
    success: true,
    results: subscriptions.length,
    data: { subscriptions },
  });
});

// ─── AfriPay IPN / Server-to-Server Notification ─────────────────────────────
// POST /subscriptions/ipn  (configure this URL in AfriPay dashboard)
exports.handleIPN = asyncHandler(async (req, res) => {
  const body = req.body;
  logger.info("AfriPay IPN received:", JSON.stringify(body));

  const parsed = afripay.parseCallbackStatus(body);
  const verification = afripay.verifyCallback(body);

  if (!verification.valid) {
    logger.warn(`IPN verification failed: ${verification.reason}`);
    return res.status(400).json({ received: false, reason: verification.reason });
  }

  const { userId, planId } = verification.decoded;
  const subscription = await Subscription.findOne({
    user: userId,
    "afripay.clientToken": parsed.clientToken,
  });

  if (!subscription) {
    logger.warn(`IPN: No subscription found for token ${parsed.clientToken}`);
    return res.status(200).json({ received: true, note: "No subscription found" });
  }

  if (parsed.succeeded && subscription.status !== "active") {
    subscription.status = "active";
    subscription.afripay.transactionId = parsed.transactionId;
    subscription.afripay.callbackReceivedAt = new Date();
    subscription.payments[0].status = "succeeded";
    subscription.payments[0].transactionId = parsed.transactionId;
    subscription.payments[0].paidAt = new Date();
    await subscription.save();

    await User.findByIdAndUpdate(userId, {
      "subscription.plan": planId,
      "subscription.status": "active",
      "subscription.currentPeriodStart": subscription.currentPeriodStart,
      "subscription.currentPeriodEnd": subscription.currentPeriodEnd,
    });

    const user = await User.findById(userId);
    sendSubscriptionConfirmEmail(user, PLANS[planId].name, subscription.currentPeriodEnd)
      .catch((e) => logger.warn(`IPN email error: ${e.message}`));

    logger.info(`IPN: Subscription activated for user=${userId} plan=${planId} txn=${parsed.transactionId}`);
  } else if (parsed.failed && subscription.status === "pending") {
    subscription.status = "failed";
    subscription.payments[0].status = "failed";
    await subscription.save();
    logger.info(`IPN: Payment failed for user=${userId} plan=${planId}`);
  }

  // AfriPay expects a 200 response to acknowledge IPN
  res.status(200).json({ received: true });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a ready-to-submit HTML form for AfriPay checkout.
 * The frontend can inject this into a page or auto-submit it.
 */
function buildAfriPayHtmlForm(checkout) {
  const fields = checkout.fields;
  const hiddenInputs = Object.entries(fields)
    .map(([name, value]) => `  <input type="hidden" name="${name}" value="${value}">`)
    .join("\n");

  return `<form action="${checkout.checkoutUrl}" method="post" id="afripayform">
${hiddenInputs}
  <p>
    <input
      type="image"
      src="https://www.afripay.africa/logos/pay_with_afripay.png"
      alt="Pay with AfriPay"
      onclick="document.getElementById('afripayform').submit();"
    >
  </p>
</form>`;
}

exports.PLANS = PLANS;
