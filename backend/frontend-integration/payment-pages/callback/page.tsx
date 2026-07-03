// frontend-integration/payment-pages/callback/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop this at: src/app/payment/callback/page.tsx in your Next.js frontend.
// AfriPay redirects the user here after checkout with query params.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

type PaymentState = "checking" | "success" | "failed" | "pending";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<PaymentState>("checking");
  const [plan, setPlan] = useState<string>("");
  const [txnId, setTxnId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const status = searchParams.get("status") || "";
    const token = searchParams.get("token") || searchParams.get("client_token") || "";
    const txn = searchParams.get("transaction_id") || searchParams.get("txn_id") || "";
    const planId = searchParams.get("plan") || "";

    setTxnId(txn);
    setPlan(planId);

    const successStatuses = ["success", "completed", "paid", "approved"];
    const failedStatuses = ["failed", "cancelled", "rejected", "error"];

    if (successStatuses.includes(status.toLowerCase())) {
      setState("success");
    } else if (failedStatuses.includes(status.toLowerCase())) {
      setState("failed");
      setError(status);
    } else if (token) {
      // Poll backend for status
      pollStatus(token);
    } else {
      setState("pending");
    }
  }, [searchParams]);

  const pollStatus = async (token: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/status/${token}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (data.success && data.data?.isActive) {
        setPlan(data.data.plan || "");
        setState("success");
      } else if (data.data?.status === "failed") {
        setState("failed");
      } else {
        setState("pending");
      }
    } catch {
      setState("pending");
    }
  };

  const screens: Record<PaymentState, React.ReactNode> = {
    checking: (
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mx-auto mb-6" />
        <h2 className="font-display text-3xl tracking-wider mb-2">Verifying Payment</h2>
        <p className="text-text-muted text-sm">Please wait while we confirm your payment with AfriPay...</p>
      </div>
    ),

    success: (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-6 text-4xl">
          ✓
        </div>
        <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
          ✦ Payment Successful
        </div>
        <h2 className="font-display text-4xl tracking-wider mb-3 uppercase">
          Welcome to CineMax {plan && plan.charAt(0).toUpperCase() + plan.slice(1)}!
        </h2>
        <p className="text-text-muted text-sm mb-2">Your subscription is now active.</p>
        {txnId && (
          <p className="text-text-muted text-xs mb-8">
            Transaction ID: <span className="text-text-secondary font-mono">{txnId}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-8 py-3.5 bg-brand-red text-white rounded-xl font-bold text-sm hover:bg-brand-red-dark transition-all"
          >
            ▶ Start Watching
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-bg-tertiary border border-border text-text-secondary rounded-xl font-medium text-sm hover:text-text-primary transition-all"
          >
            View Dashboard
          </Link>
        </div>
      </motion.div>
    ),

    failed: (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-6 text-4xl">
          ✕
        </div>
        <h2 className="font-display text-4xl tracking-wider mb-3 uppercase text-brand-red">
          Payment Failed
        </h2>
        <p className="text-text-muted text-sm mb-2">
          Your payment could not be processed. You have not been charged.
        </p>
        {error && (
          <p className="text-text-muted text-xs mb-8">
            Reason: <span className="text-red-400 font-mono">{error}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pricing"
            className="px-8 py-3.5 bg-brand-gold text-black rounded-xl font-bold text-sm hover:bg-brand-gold-dark transition-all"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="px-8 py-3.5 bg-bg-tertiary border border-border text-text-secondary rounded-xl font-medium text-sm hover:text-text-primary transition-all"
          >
            Go Home
          </Link>
        </div>
      </motion.div>
    ),

    pending: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-brand-gold/10 border-2 border-brand-gold/30 flex items-center justify-center mx-auto mb-6 text-4xl">
          ⏳
        </div>
        <h2 className="font-display text-4xl tracking-wider mb-3 uppercase">Payment Pending</h2>
        <p className="text-text-muted text-sm mb-8 max-w-sm mx-auto">
          Your payment is being processed. This may take a few minutes. Check your dashboard for updates.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-brand-gold text-black rounded-xl font-bold text-sm hover:bg-brand-gold-dark transition-all"
          >
            Check Dashboard
          </Link>
          <Link
            href="/"
            className="px-8 py-3.5 bg-bg-tertiary border border-border text-text-secondary rounded-xl font-medium text-sm hover:text-text-primary transition-all"
          >
            Go Home
          </Link>
        </div>
      </motion.div>
    ),
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-red/5 to-transparent pointer-events-none" />
      <div className="relative w-full max-w-md bg-bg-secondary border border-border rounded-2xl p-10 shadow-2xl">
        <div className="text-center mb-8">
          <span className="font-display text-3xl tracking-widest text-brand-red">
            CINE<span className="text-brand-gold">MAX</span>
          </span>
        </div>
        {screens[state]}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
