// src/components/layout/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User, LogOut, LayoutDashboard, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const { isLoggedIn, isSubscribed, user, plan, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Browse" },
    { href: "/pricing", label: "Plans" },
    { href: "/dashboard", label: "My List", protected: true },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-bg-primary/95 backdrop-blur-xl border-b border-border/50 shadow-xl"
            : "bg-gradient-to-b from-bg-primary/80 to-transparent"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="font-display text-3xl tracking-widest text-brand-red">
                CINE<span className="text-brand-gold">MAX</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {navLinks.map((link) => {
                if (link.protected && !isLoggedIn) return null;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-text-primary bg-white/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/6"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center gap-2 bg-bg-tertiary border border-border rounded-lg px-3 w-64 transition-all duration-200 focus-within:border-brand-red/50">
              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
              <form onSubmit={handleSearch} className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full bg-transparent py-2 text-sm text-text-primary placeholder-text-muted outline-none font-body"
                />
              </form>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mobile search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/8 transition-all"
              >
                <Search className="w-5 h-5" />
              </button>

              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-red to-orange-500 flex items-center justify-center text-sm font-bold border-2 border-brand-gold/70 group-hover:border-brand-gold transition-all">
                      {getInitials(user?.name || "U")}
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-56 bg-bg-secondary border border-border rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="font-semibold text-sm text-text-primary truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-text-muted truncate">{user?.email}</p>
                          {isSubscribed && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-brand-gold font-medium">
                              <Crown className="w-3 h-3" />
                              {plan?.charAt(0).toUpperCase() + (plan?.slice(1) || "")} Member
                            </span>
                          )}
                        </div>
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/pricing"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                          >
                            <Crown className="w-4 h-4" />
                            {isSubscribed ? "Manage Plan" : "Subscribe"}
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="hidden sm:block px-4 py-2 rounded-lg text-sm font-semibold text-text-secondary border border-border hover:text-text-primary hover:border-text-muted transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand-red text-white hover:bg-brand-red-dark transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/8 transition-all"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-3 bg-bg-secondary">
                <Search className="w-4 h-4 text-text-muted" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies, directors, actors..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none font-body"
                />
                <button type="submit" className="text-brand-red text-sm font-semibold">
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border overflow-hidden bg-bg-secondary"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map((link) => {
                  if (link.protected && !isLoggedIn) return null;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                    >
                      {link.label}
                    </Link>
                  );
                })}
                {!isLoggedIn && (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Overlay for dropdowns */}
      {(profileOpen || mobileOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setProfileOpen(false);
            setMobileOpen(false);
          }}
        />
      )}
    </>
  );
}
