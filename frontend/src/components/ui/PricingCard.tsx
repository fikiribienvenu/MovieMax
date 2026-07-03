// src/components/ui/PricingCard.tsx
"use client";

import { motion } from "framer-motion";
import { Check, X, Crown } from "lucide-react";
import { Plan } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface PricingCardProps {
  plan: Plan;
  index: number;
}

export default function PricingCard({ plan, index }: PricingCardProps) {
  const { isLoggedIn, isSubscribed, plan: currentPlan, subscribe } = useAuth();
  const router = useRouter();

  const isCurrentPlan = isSubscribed && currentPlan === plan.id;

  const handleSubscribe = () => {
    if (!isLoggedIn) {
      router.push("/auth/signup");
      return;
    }
    subscribe(plan.id);
    router.push("/dashboard");
  };

  const btnStyles = {
    basic: "bg-bg-elevated border border-border text-text-primary hover:bg-bg-card hover:border-text-muted",
    premium: "bg-brand-gold text-black hover:bg-brand-gold-dark shadow-gold",
    annual: "bg-brand-red text-white hover:bg-brand-red-dark shadow-red",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "relative bg-bg-card rounded-2xl border p-8 flex flex-col transition-all duration-300 hover:-translate-y-1",
        plan.popular
          ? "border-brand-gold shadow-gold"
          : "border-border hover:border-border/80"
      )}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-brand-gold text-black text-xs font-black px-4 py-1 rounded-full tracking-wide whitespace-nowrap">
          <Crown className="w-3 h-3" />
          MOST POPULAR
        </div>
      )}

      {/* Plan name */}
      <div className="text-xs font-bold tracking-widest uppercase text-text-muted mb-2">
        {plan.name}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-1">
        <span
          className={cn(
            "font-display text-6xl tracking-wider",
            plan.popular ? "text-brand-gold" : "text-text-primary"
          )}
        >
          ${plan.price}
        </span>
        <span className="text-text-muted text-sm font-normal">
          /{plan.id === "annual" ? "yr" : "mo"}
        </span>
      </div>
      <p className="text-sm text-text-muted mb-6">{plan.description}</p>

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs",
                feature.included
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-bg-elevated text-text-muted"
              )}
            >
              {feature.included ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
            </div>
            <span
              className={cn(
                "text-sm",
                feature.included ? "text-text-secondary" : "text-text-muted line-through"
              )}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrentPlan ? (
        <div className="w-full py-3 rounded-xl text-center text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ✓ Current Plan
        </div>
      ) : (
        <button
          onClick={handleSubscribe}
          className={cn(
            "w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95",
            btnStyles[plan.id]
          )}
        >
          {plan.popular ? `✦ Get ${plan.name}` : `Get ${plan.name}`}
        </button>
      )}
    </motion.div>
  );
}
