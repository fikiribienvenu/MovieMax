// src/app/payment/pending/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";

function PendingContent() {
  const params = useSearchParams();
  const router = useRouter();
  const txn = params.get("txn");
  const { user, isSubscribed } = useAuth();
  const { refreshSubscription } = useAuthStore();
  const [checking, setChecking] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Auto-poll every 30 seconds to check if admin approved
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshSubscription();
      setPollCount((c) => c + 1);
    }, 30_000); // every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // If subscription becomes active (admin approved), redirect to success
  useEffect(() => {
    if (isSubscribed) {
      router.replace("/dashboard");
    }
  }, [isSubscribed]);

  const handleManualCheck = async () => {
    setChecking(true);
    await refreshSubscription();
    setChecking(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-bg-card border border-border rounded-2xl p-8 text-center space-y-6"
      >
        {/* Icon */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-400" />
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/20 animate-ping" />
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Payment Received!
          </h1>
          <p className="text-text-muted text-sm leading-relaxed">
            Your payment is awaiting confirmation from our team.
            Your subscription will activate automatically once approved.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-bg-elevated border border-border rounded-xl p-4 text-left space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span className="text-text-secondary">Payment submitted successfully</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <span className="text-text-secondary">
              Waiting for admin to confirm payment receipt
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <RefreshCw className={`w-4 h-4 text-text-muted mt-0.5 flex-shrink-0 ${pollCount > 0 ? "text-brand-gold" : ""}`} />
            <span className="text-text-muted">
              Checking for approval automatically every 30 seconds
              {pollCount > 0 && (
                <span className="text-brand-gold ml-1">(checked {pollCount}×)</span>
              )}
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Mail className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
            <span className="text-text-muted">
              Confirmation email will be sent to{" "}
              <span className="text-brand-gold">{user?.email || "your email"}</span>
            </span>
          </div>
        </div>

        {/* Transaction ID */}
        {txn && txn !== "null" && (
          <div className="bg-bg-elevated rounded-lg px-4 py-3 text-left">
            <p className="text-xs text-text-muted mb-1">Transaction Reference</p>
            <p className="text-xs font-mono text-text-secondary break-all">{txn}</p>
          </div>
        )}

        {/* Warning */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-400/80">
            ⚠️ Please do not make another payment while this one is pending.
          </p>
        </div>

        {/* Manual check button */}
        <button
          onClick={handleManualCheck}
          disabled={checking}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-brand-gold text-black hover:bg-brand-gold-dark disabled:opacity-60 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Checking..." : "Check Approval Status"}
        </button>

        <Link
          href="/"
          className="block w-full py-2.5 text-xs text-text-muted hover:text-text-secondary transition-colors text-center"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center text-text-muted text-sm">
          Loading...
        </div>
      }>
        <PendingContent />
      </Suspense>
    </>
  );
}