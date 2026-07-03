// src/utils/jwt.js
"use strict";

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_COOKIE_EXPIRES_IN = parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7;

/**
 * Sign a JWT token
 */
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Create token and set cookie on response
 */
const createSendToken = (user, statusCode, res, message = "Success") => {
  const token = signToken({ id: user._id, role: user.role });

  const cookieOptions = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  };

  res.cookie("jwt", token, cookieOptions);

  // Don't send password in response
  const safeUser = user.toSafeObject ? user.toSafeObject() : user;

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    data: { user: safeUser },
  });
};

/**
 * Clear the auth cookie
 */
const clearTokenCookie = (res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
};

module.exports = { signToken, verifyToken, createSendToken, clearTokenCookie };
