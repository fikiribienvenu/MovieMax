// src/models/Subscription.model.js
"use strict";

const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["basic", "premium", "annual"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "cancelled", "expired", "past_due", "failed"],
      default: "pending",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    price: {
      amount: { type: Number, required: true },
      currency: { type: String, default: "RWF" },
    },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    cancelledAt: Date,
    afripay: {
      clientToken: { type: String, index: true },
      transactionId: { type: String, sparse: true },
      checkoutUrl: String,
      appId: String,
      callbackReceivedAt: Date,
      rawCallback: { type: Map, of: String },
    },
    payments: [
      {
        amount: Number,
        currency: { type: String, default: "RWF" },
        status: {
          type: String,
          enum: ["succeeded", "failed", "pending", "refunded"],
          default: "pending",
        },
        gateway: { type: String, default: "afripay" },
        transactionId: String,
        paidAt: { type: Date, default: Date.now },
        invoiceId: String,
        metadata: { type: Map, of: String },
      },
    ],
    trialStart: Date,
    trialEnd: Date,
    metadata: { type: Map, of: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

subscriptionSchema.virtual("isActive").get(function () {
  return this.status === "active" && this.currentPeriodEnd > new Date();
});

subscriptionSchema.virtual("daysRemaining").get(function () {
  const diff = this.currentPeriodEnd - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

subscriptionSchema.virtual("priceFormatted").get(function () {
  return `${this.price.currency} ${this.price.amount.toLocaleString()}`;
});

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ "afripay.clientToken": 1 }, { sparse: true });
subscriptionSchema.index({ "afripay.transactionId": 1 }, { sparse: true });
subscriptionSchema.index({ createdAt: -1 });

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
