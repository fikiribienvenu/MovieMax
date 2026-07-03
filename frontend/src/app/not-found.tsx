// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-[120px] leading-none text-brand-red opacity-20 select-none">404</h1>
        <h2 className="font-display text-4xl tracking-wider uppercase -mt-6 mb-3">Page Not Found</h2>
        <p className="text-text-muted text-sm mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-brand-red text-white rounded-xl text-sm font-bold hover:bg-brand-red-dark transition-all"
          >
            Back to Home
          </Link>
          <Link
            href="/search"
            className="px-6 py-3 bg-bg-secondary border border-border text-text-secondary rounded-xl text-sm font-medium hover:text-text-primary transition-all"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    </div>
  );
}
