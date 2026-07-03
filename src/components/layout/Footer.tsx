// src/components/layout/Footer.tsx
import Link from "next/link";
import { Film, Twitter, Instagram, Youtube, Facebook } from "lucide-react";

export default function Footer() {
  const links = {
    Navigate: [
      { label: "Home", href: "/" },
      { label: "Browse Movies", href: "/search" },
      { label: "Pricing Plans", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
    Company: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Blog", href: "#" },
    ],
    Support: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  };

  return (
    <footer className="bg-bg-secondary border-t border-border mt-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/">
              <span className="font-display text-4xl tracking-widest text-brand-red">
                CINE<span className="text-brand-gold">MAX</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-text-muted leading-relaxed max-w-xs">
              The ultimate destination for premium movies and exclusive content.
              Stream anywhere, anytime in stunning 4K Ultra HD.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Twitter, Instagram, Youtube, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-bg-tertiary border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-text-muted transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-text-muted hover:text-brand-gold transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} IWACUFLIX. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Film className="w-3.5 h-3.5" />
            <span>Made with passion for movie lovers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
