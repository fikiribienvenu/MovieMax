// src/app/pricing/page.tsx
"use client";

import { motion } from "framer-motion";
import { Shield, Zap, RefreshCw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingCard from "@/components/ui/PricingCard";
import { plans } from "@/lib/data";

const perks = [
  { icon: <Shield className="w-5 h-5 text-brand-gold" />, title: "Secure Payment", desc: "256-bit SSL encryption on all transactions" },
  { icon: <Zap className="w-5 h-5 text-brand-gold" />, title: "Instant Access", desc: "Start streaming immediately after subscribing" },
  { icon: <RefreshCw className="w-5 h-5 text-brand-gold" />, title: "Cancel Anytime", desc: "No contracts, no commitments, no fees" },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <div className="relative pt-24 pb-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-red/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-red/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-xs font-bold px-4 py-2 rounded-full mb-5 tracking-wider uppercase">
                ✦ Flexible Plans
              </div>
              <h1 className="font-display text-[clamp(48px,7vw,88px)] leading-none tracking-wider uppercase text-text-primary mb-4">
                Choose Your{" "}
                <span className="text-brand-red">Plan</span>
              </h1>
              <p className="text-text-secondary text-lg max-w-xl mx-auto">
                Unlimited movies, shows, and originals. Watch on any device. Cancel anytime.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Plans */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <PricingCard key={plan.id} plan={plan} index={i} />
            ))}
          </div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-14 max-w-3xl mx-auto"
          >
            {perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
                  {perk.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{perk.title}</p>
                  <p className="text-xs text-text-muted">{perk.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <p className="text-center text-text-muted text-xs mt-10">
            This is a demo — no real payment is processed. All features are simulated.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-border">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="font-display text-3xl tracking-wider uppercase text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. No cancellation fees, no questions asked." },
                { q: "What devices can I watch on?", a: "IWACUFLIX works on any device — phones, tablets, laptops, smart TVs, and gaming consoles." },
                { q: "Is there a free trial?", a: "New members get their first 7 days free on the Premium plan. No credit card required to start." },
                { q: "Can I download movies offline?", a: "Premium and Annual plan subscribers can download content to watch offline on mobile devices." },
                { q: "How many screens at once?", a: "Basic: 1 screen. Premium: 4 screens. Annual: 6 screens simultaneously." },
                { q: "What quality is available?", a: "Basic offers HD 720p. Premium and Annual offer 4K Ultra HD with Dolby Atmos audio." },
              ].map((faq, i) => (
                <div key={i} className="bg-bg-secondary border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-sm text-text-primary mb-2">{faq.q}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
