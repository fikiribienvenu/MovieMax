// src/app/payment/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

function SuccessContent() {
  const params = useSearchParams();
  const plan = params.get("plan") ?? "your plan";
  const txn = params.get("txn");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-bg-card border border-border rounded-2xl p-8 text-center space-y-5"
      >
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Clock className="w-10 h-10 text-amber-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Payment Received!</h1>
          <p className="text-text-muted text-sm leading-relaxed">
            Your <span className="text-brand-gold font-semibold capitalize">{plan}</span> plan payment
            was successfully submitted to AfriPay.
          </p>
        </div>

        <div className="bg-bg-elevated border border-border rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-text-secondary">Payment submitted to AfriPay</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-text-secondary">Awaiting admin confirmation</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <CheckCircle className="w-4 h-4 text-text-muted" />
            <span>Subscription activates after confirmation</span>
          </div>
        </div>

        {txn && (
          <p className="text-xs text-text-muted">
            Transaction ID: <span className="text-text-secondary font-mono">{txn}</span>
          </p>
        )}

        <p className="text-xs text-text-muted">
          You'll receive an email once your subscription is activated. This usually takes a few minutes to a few hours.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="w-full py-3 rounded-xl text-sm font-bold bg-brand-gold text-black hover:bg-brand-gold-dark transition-colors text-center"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 text-xs text-text-muted hover:text-text-secondary transition-colors text-center"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-muted">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </>
  );
}