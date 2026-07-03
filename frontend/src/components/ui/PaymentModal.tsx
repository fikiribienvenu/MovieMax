// src/components/ui/PaymentModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Clock, CheckCircle, AlertCircle, Loader2, CreditCard } from "lucide-react";
import { Plan } from "@/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface PaymentModalProps {
  plan: Plan;
  onClose: () => void;
}

type Step = "confirm" | "processing" | "pending";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function PaymentModal({ plan, onClose }: PaymentModalProps) {
  const token = useAuthStore((s) => s.token);
  const [step, setStep] = useState<Step>("confirm");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const priceRWF = {
    basic: "10,000",
    premium: "18,000",
    annual: "118,800",
  }[plan.id] ?? "0";

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!token) throw new Error("Session expired. Please log out and log in again.");

      const res = await fetch(`${API}/subscriptions/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: plan.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to initiate payment.");

      const { checkoutForm } = data.data;

      // Inject AfriPay form and auto-submit
      const container = document.createElement("div");
      container.style.display = "none";
      container.innerHTML = checkoutForm;
      document.body.appendChild(container);

      const form = container.querySelector("form") as HTMLFormElement;
      if (form) {
        setStep("processing");
        setTimeout(() => form.submit(), 800);
      } else {
        throw new Error("Could not build payment form. Please try again.");
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-gold" />
              <span className="font-bold text-text-primary">Complete Payment</span>
            </div>
            {step !== "processing" && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {step === "confirm" && (
              <div className="space-y-5">
                {/* Plan Summary */}
                <div className={cn(
                  "rounded-xl p-4 border",
                  plan.popular
                    ? "bg-brand-gold/5 border-brand-gold/30"
                    : plan.id === "annual"
                    ? "bg-brand-red/5 border-brand-red/30"
                    : "bg-bg-elevated border-border"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold tracking-widest uppercase text-text-muted">
                      {plan.name} Plan
                    </span>
                    {plan.popular && (
                      <span className="text-[10px] font-black bg-brand-gold text-black px-2 py-0.5 rounded-full">
                        MOST POPULAR
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-4xl font-display tracking-wider",
                      plan.popular ? "text-brand-gold" : "text-text-primary"
                    )}>
                      ${plan.price}
                    </span>
                    <span className="text-text-muted text-sm">
                      /{plan.id === "annual" ? "yr" : "mo"}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">≈ RWF {priceRWF}</p>
                  <p className="text-xs text-text-muted mt-0.5">{plan.description}</p>
                </div>

                {/* What happens next */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">What happens next</p>
                  {[
                    { icon: <CreditCard className="w-4 h-4" />, text: "You'll be redirected to AfriPay to complete payment" },
                    { icon: <Clock className="w-4 h-4" />, text: "Our admin reviews and confirms your payment" },
                    { icon: <CheckCircle className="w-4 h-4" />, text: "Your subscription activates once confirmed" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0 text-brand-gold mt-0.5">
                        {item.icon}
                      </div>
                      <p className="text-sm text-text-secondary leading-snug">{item.text}</p>
                    </div>
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                {/* Trust badge */}
                <div className="flex items-center gap-2 text-text-muted">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs">Secured by AfriPay · 256-bit SSL encryption</span>
                </div>

                {/* CTA */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2",
                    plan.popular
                      ? "bg-brand-gold text-black hover:bg-brand-gold-dark"
                      : plan.id === "annual"
                      ? "bg-brand-red text-white hover:bg-brand-red-dark"
                      : "bg-bg-elevated border border-border text-text-primary hover:bg-bg-card",
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Preparing checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay with AfriPay
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {step === "processing" && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-text-primary mb-1">Redirecting to AfriPay...</p>
                  <p className="text-sm text-text-muted">Please do not close this window.</p>
                </div>
              </div>
            )}

            {step === "pending" && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-text-primary mb-1">Payment Under Review</p>
                  <p className="text-sm text-text-muted max-w-xs mx-auto">
                    Your payment was received. Once our admin confirms it, your subscription will activate automatically.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-bg-elevated border border-border text-text-primary hover:bg-bg-card transition-colors"
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}