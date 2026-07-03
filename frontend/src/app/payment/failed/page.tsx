// src/app/payment/failed/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

function FailedContent() {
  const params = useSearchParams();
  const reason = params.get("reason") ?? "Payment was not completed.";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-bg-card border border-border rounded-2xl p-8 text-center space-y-5"
      >
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Payment Failed</h1>
          <p className="text-text-muted text-sm">
            {decodeURIComponent(reason)}
          </p>
        </div>
        <p className="text-xs text-text-muted">
          No charges were made. You can try again or choose a different payment method.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/pricing"
            className="w-full py-3 rounded-xl text-sm font-bold bg-brand-red text-white hover:bg-brand-red-dark transition-colors text-center"
          >
            Try Again
          </Link>
          <Link href="/" className="w-full py-2.5 text-xs text-text-muted hover:text-text-secondary transition-colors text-center">
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-muted">Loading...</div>}>
        <FailedContent />
      </Suspense>
    </>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// src/app/payment/pending/page.tsx  (create as a separate file)
// ─────────────────────────────────────────────────────────────────────────────
// "use client";
//
// import { Suspense } from "react";
// import { motion } from "framer-motion";
// import { Clock } from "lucide-react";
// import Link from "next/link";
// import Navbar from "@/components/layout/Navbar";
//
// function PendingContent() {
//   return (
//     <div className="min-h-screen flex items-center justify-center px-4">
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-md w-full bg-bg-card border border-border rounded-2xl p-8 text-center space-y-5"
//       >
//         <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
//           <Clock className="w-10 h-10 text-amber-400" />
//         </div>
//         <div>
//           <h1 className="text-2xl font-bold text-text-primary mb-2">Payment Pending</h1>
//           <p className="text-text-muted text-sm">
//             Your payment is being processed. We'll notify you once it's confirmed.
//           </p>
//         </div>
//         <Link href="/dashboard" className="block w-full py-3 rounded-xl text-sm font-bold bg-brand-gold text-black text-center">
//           Go to Dashboard
//         </Link>
//       </motion.div>
//     </div>
//   );
// }
//
// export default function PaymentPendingPage() {
//   return (
//     <>
//       <Navbar />
//       <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
//         <PendingContent />
//       </Suspense>
//     </>
//   );
// }