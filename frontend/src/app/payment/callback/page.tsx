// src/app/payment/callback/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const FAILED_STATUSES = ["failed", "cancelled", "rejected", "error"];

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status      = (searchParams.get("status") || "").toLowerCase();
    const clientToken = searchParams.get("token") || searchParams.get("client_token") || "";
    const txnId       = searchParams.get("transaction_id") || searchParams.get("txn_id") || "";

    if (!clientToken || FAILED_STATUSES.includes(status)) {
      router.replace("/payment/failed");
      return;
    }

    // Always go to pending — admin must confirm before access is granted
    router.replace(`/payment/pending?token=${clientToken}&txn=${txnId}`);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-brand-gold animate-spin" />
        </div>
        <h1 className="text-white text-2xl font-bold mb-3">Processing Payment</h1>
        <p className="text-white/60 text-sm">Please wait...</p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-brand-gold animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}