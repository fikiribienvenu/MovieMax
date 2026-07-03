// src/components/ui/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Lock } from "lucide-react";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({
  children,
  requireSubscription = false,
}: ProtectedRouteProps) {
  const { isLoggedIn, isSubscribed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-text-muted" />
          </div>
          <h2 className="font-display text-3xl tracking-wider mb-2">Access Denied</h2>
          <p className="text-text-muted text-sm mb-6">Please sign in to continue.</p>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-brand-red text-white rounded-xl text-sm font-bold hover:bg-brand-red-dark transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (requireSubscription && !isSubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-4 border border-brand-gold/20">
            <Lock className="w-7 h-7 text-brand-gold" />
          </div>
          <h2 className="font-display text-3xl tracking-wider mb-2">Subscription Required</h2>
          <p className="text-text-muted text-sm mb-6">
            Subscribe to unlock full movie access, 4K streaming, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pricing"
              className="px-6 py-3 bg-brand-gold text-black rounded-xl text-sm font-bold hover:bg-brand-gold-dark transition-all"
            >
              ✦ View Plans
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-bg-tertiary border border-border text-text-secondary rounded-xl text-sm font-medium hover:text-text-primary transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
