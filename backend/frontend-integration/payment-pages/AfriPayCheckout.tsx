// frontend-integration/payment-pages/AfriPayCheckout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop this component anywhere in your Next.js frontend.
// It calls the backend, gets AfriPay form fields, then auto-submits.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Shield, Zap, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Plan = "basic" | "premium" | "annual";

interface AfriPayFields {
  amount: string;
  currency: string;
  comment: string;
  client_token: string;
  return_url: string;
  app_id: string;
  app_secret: string;
}

interface CheckoutData {
  checkoutUrl: string;
  fields: AfriPayFields;
  clientToken: string;
  priceFormatted: string;
  planName: string;
}

export default function AfriPayCheckout({ plan }: { plan: Plan }) {
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"confirm" | "redirecting">("confirm");
  const formRef = useRef<HTMLFormElement>(null);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  // Auto-submit the form once we have checkout data
  useEffect(() => {
    if (checkoutData && formRef.current) {
      // Give the UI a moment to show the "redirecting" step before submitting
      const timer = setTimeout(() => {
        formRef.current?.submit();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [checkoutData]);

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      router.push("/auth/signup");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/initiate`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to initiate payment.");
      }

      const { afripay, planName, priceFormatted } = data.data;
      setCheckoutData({
        checkoutUrl: afripay.checkoutUrl,
        fields: afripay.fields,
        clientToken: afripay.clientToken,
        planName,
        priceFormatted,
      });
      setStep("redirecting");

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const planLabels: Record<Plan, { name: string; color: string; icon: React.ReactNode }> = {
    basic:   { name: "Basic",          color: "text-text-primary",  icon: <Shield className="w-4 h-4" /> },
    premium: { name: "Premium",        color: "text-brand-gold",    icon: <Crown className="w-4 h-4" /> },
    annual:  { name: "Annual Premium", color: "text-brand-red",     icon: <Zap className="w-4 h-4" /> },
  };
  const label = planLabels[plan];

  return (
    <div>
      <AnimatePresence mode="wait">
        {step === "confirm" && (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                plan === "premium"
                  ? "bg-brand-gold text-black hover:bg-brand-gold-dark"
                  : plan === "annual"
                  ? "bg-brand-red text-white hover:bg-brand-red-dark"
                  : "bg-bg-elevated border border-border text-text-primary hover:border-text-muted"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Preparing checkout...
                </>
              ) : (
                <>
                  {label.icon}
                  Pay with AfriPay
                </>
              )}
            </button>
          </motion.div>
        )}

        {step === "redirecting" && checkoutData && (
          <motion.div
            key="redirecting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-2"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-4 h-4 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
              <span className="text-sm text-text-secondary font-medium">
                Redirecting to AfriPay...
              </span>
            </div>
            <p className="text-xs text-text-muted">
              You are being redirected to complete your <span className={label.color}>{checkoutData.planName}</span> subscription
              of <strong className="text-text-primary">{checkoutData.priceFormatted}</strong>
            </p>

            {/* Hidden AfriPay form — auto-submitted by useEffect */}
            <form
              ref={formRef}
              action={checkoutData.checkoutUrl}
              method="post"
              id="afripayform"
              style={{ display: "none" }}
            >
              {Object.entries(checkoutData.fields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
            </form>

            {/* Fallback manual submit */}
            <button
              onClick={() => formRef.current?.submit()}
              className="mt-4 text-xs text-brand-gold underline hover:text-brand-gold-dark"
            >
              Click here if not redirected automatically
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AfriPay trust badge */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <img
          src="https://www.afripay.africa/logos/pay_with_afripay.png"
          alt="Secured by AfriPay"
          className="h-6 opacity-60 hover:opacity-100 transition-opacity"
        />
        <span className="text-xs text-text-muted">Secure payment via AfriPay</span>
      </div>
    </div>
  );
}
