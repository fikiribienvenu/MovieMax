// src/utils/email.js
"use strict";

const nodemailer = require("nodemailer");
const logger = require("./logger");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const templates = {
  welcome: (name) => ({
    subject: "Welcome to CineMax! 🎬",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden">
        <div style="background:#e50914;padding:32px;text-align:center">
          <h1 style="font-size:36px;letter-spacing:4px;margin:0;color:#fff">CINE<span style="color:#f5c518">MAX</span></h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#f5c518">Welcome, ${name}! 🎬</h2>
          <p style="color:#b3b3cc;line-height:1.6">Your CineMax account is ready. Start exploring thousands of movies in stunning 4K Ultra HD.</p>
          <a href="${process.env.CLIENT_URL}/pricing" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#e50914;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
            Choose Your Plan →
          </a>
          <p style="color:#6b6b85;font-size:12px;margin-top:24px">If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: "Reset Your CineMax Password 🔑",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden">
        <div style="background:#e50914;padding:32px;text-align:center">
          <h1 style="font-size:36px;letter-spacing:4px;margin:0;color:#fff">CINE<span style="color:#f5c518">MAX</span></h1>
        </div>
        <div style="padding:32px">
          <h2>Hi ${name},</h2>
          <p style="color:#b3b3cc;line-height:1.6">You requested a password reset. Click the button below to create a new password. This link expires in <strong style="color:#f5c518">10 minutes</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#f5c518;color:#000;border-radius:8px;text-decoration:none;font-weight:bold">
            Reset Password →
          </a>
          <p style="color:#6b6b85;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
        </div>
      </div>
    `,
  }),

  subscriptionConfirm: (name, plan, endDate) => ({
    subject: `CineMax ${plan} Plan Activated! ✦`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden">
        <div style="background:#f5c518;padding:32px;text-align:center">
          <h1 style="font-size:36px;letter-spacing:4px;margin:0;color:#000">CINE<span style="color:#e50914">MAX</span></h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#f5c518">✦ ${plan} Plan Activated!</h2>
          <p style="color:#b3b3cc;line-height:1.6">Hi ${name}, your <strong>${plan}</strong> subscription is now active. Enjoy unlimited movies in 4K Ultra HD!</p>
          <p style="color:#b3b3cc">Your plan renews on: <strong style="color:#fff">${new Date(endDate).toLocaleDateString()}</strong></p>
          <a href="${process.env.CLIENT_URL}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#e50914;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
            Start Watching →
          </a>
        </div>
      </div>
    `,
  }),
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER) {
      logger.warn("Email not configured — skipping email send");
      return { skipped: true };
    }
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "CineMax <noreply@cinemax.com>",
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email send failed: ${err.message}`);
    throw err;
  }
};

const sendWelcomeEmail = (user) => {
  const tpl = templates.welcome(user.name);
  return sendEmail({ to: user.email, ...tpl });
};

const sendPasswordResetEmail = (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
  const tpl = templates.passwordReset(user.name, resetUrl);
  return sendEmail({ to: user.email, ...tpl });
};

const sendSubscriptionConfirmEmail = (user, plan, endDate) => {
  const tpl = templates.subscriptionConfirm(user.name, plan, endDate);
  return sendEmail({ to: user.email, ...tpl });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSubscriptionConfirmEmail,
};
