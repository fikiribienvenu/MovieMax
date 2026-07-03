// src/services/afripay.service.js
"use strict";

const crypto = require("crypto");
const logger = require("../utils/logger");

// ─── AfriPay Configuration ────────────────────────────────────────────────────
const AFRIPAY_CONFIG = {
  checkoutUrl: "https://www.afripay.africa/checkout/index.php",
  appId: process.env.AFRIPAY_APP_ID || "865691b289bec1a27490b54ff14e37a4",
  appSecret: process.env.AFRIPAY_APP_SECRET || "JDJ5JDEwJHF5ay5K",
  currency: process.env.AFRIPAY_CURRENCY || "RWF",
  returnBaseUrl: process.env.CLIENT_URL || "http://localhost:3000",
  webhookSecret: process.env.AFRIPAY_WEBHOOK_SECRET || "",
};

// ─── Plan Prices in RWF ───────────────────────────────────────────────────────
// 1 USD ≈ 1,300 RWF (update this rate or fetch dynamically)
const PLAN_PRICES_RWF = {
  basic: 10000,    // ~$8
  premium: 20000,  // ~$15
  annual: 130000,  // ~$99
};

/**
 * Generate a unique order/client token for a payment session.
 * Encodes: userId + planId + timestamp — used to verify the callback.
 */
const generateClientToken = (userId, planId) => {
  const payload = `${userId}:${planId}:${Date.now()}`;
  return Buffer.from(payload).toString("base64url");
};

/**
 * Decode the client token back into { userId, planId, timestamp }
 */
const decodeClientToken = (token) => {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [userId, planId, timestamp] = decoded.split(":");
    return { userId, planId, timestamp: parseInt(timestamp, 10) };
  } catch {
    return null;
  }
};

/**
 * Verify token is not expired (15-minute window)
 */
const isTokenExpired = (timestamp) => {
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  return Date.now() - timestamp > FIFTEEN_MINUTES;
};

/**
 * Build the AfriPay checkout form parameters.
 * Returns everything needed to POST to AfriPay or redirect the user.
 */
const buildCheckoutParams = ({ userId, planId, planName, comment }) => {
  const amount = PLAN_PRICES_RWF[planId];
  if (!amount) throw new Error(`No RWF price configured for plan: ${planId}`);

  const clientToken = generateClientToken(userId, planId);
  const returnUrl = `${AFRIPAY_CONFIG.returnBaseUrl}/payment/callback?token=${clientToken}`;

  return {
    checkoutUrl: AFRIPAY_CONFIG.checkoutUrl,
    fields: {
      amount: amount.toString(),
      currency: AFRIPAY_CONFIG.currency,
      comment: comment || `CineMax ${planName} Subscription`,
      client_token: clientToken,
      return_url: returnUrl,
      app_id: AFRIPAY_CONFIG.appId,
      app_secret: AFRIPAY_CONFIG.appSecret,
    },
    clientToken,
    amount,
    returnUrl,
  };
};

/**
 * Verify an AfriPay webhook/callback notification.
 * AfriPay sends payment status back to your return_url or webhook URL.
 * Validates the app_id and reconstructs integrity.
 */
const verifyCallback = (callbackData) => {
  const { app_id, client_token, status, transaction_id } = callbackData;

  // Verify the app_id matches ours
  if (app_id && app_id !== AFRIPAY_CONFIG.appId) {
    logger.warn(`AfriPay callback: app_id mismatch. Got: ${app_id}`);
    return { valid: false, reason: "app_id mismatch" };
  }

  // Decode and validate the client token
  if (!client_token) {
    return { valid: false, reason: "Missing client_token" };
  }

  const decoded = decodeClientToken(client_token);
  if (!decoded) {
    return { valid: false, reason: "Invalid client_token format" };
  }

  if (isTokenExpired(decoded.timestamp)) {
    logger.warn(`AfriPay callback: token expired for user ${decoded.userId}`);
    return { valid: false, reason: "Token expired", decoded };
  }

  return {
    valid: true,
    decoded,
    status: status || "unknown",
    transactionId: transaction_id || null,
  };
};

/**
 * Parse the payment status from AfriPay callback query params.
 * AfriPay redirects to return_url with query params like:
 *   ?status=success&transaction_id=TXN123&client_token=...&amount=10000
 */
const parseCallbackStatus = (query) => {
  const status = (query.status || "").toLowerCase();
  const succeeded = ["success", "completed", "paid", "approved"].includes(status);
  const failed = ["failed", "cancelled", "rejected", "error"].includes(status);

  return {
    raw: status,
    succeeded,
    failed,
    pending: !succeeded && !failed,
    transactionId: query.transaction_id || query.txn_id || null,
    amount: query.amount ? parseInt(query.amount, 10) : null,
    clientToken: query.client_token || query.token || null,
  };
};

module.exports = {
  AFRIPAY_CONFIG,
  PLAN_PRICES_RWF,
  generateClientToken,
  decodeClientToken,
  isTokenExpired,
  buildCheckoutParams,
  verifyCallback,
  parseCallbackStatus,
};
