// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Film } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900)); // Simulate API call
    const user: User = {
      id: "user-1",
      name: data.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email: data.email,
      createdAt: new Date().toISOString(),
    };
    login(user);
    router.push("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-display text-4xl tracking-widest text-brand-red">
              CINE<span className="text-brand-gold">MAX</span>
            </span>
          </Link>
          <p className="text-text-muted text-sm mt-2">Your premium movie destination</p>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-8 shadow-2xl">
          <h1 className="font-display text-3xl tracking-wider uppercase text-center mb-6">
            Welcome Back
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-bg-tertiary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-red/60 transition-colors font-body"
                />
              </div>
              {errors.email && (
                <p className="text-brand-red text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-brand-gold hover:text-brand-gold-dark transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full bg-bg-tertiary border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-red/60 transition-colors font-body"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-brand-red text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-red text-white rounded-xl font-bold text-sm hover:bg-brand-red-dark active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social */}
          <button className="w-full py-3 bg-bg-tertiary border border-border rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:border-text-muted transition-all flex items-center justify-center gap-2">
            <Film className="w-4 h-4" />
            Continue with Google
          </button>

          {/* Switch */}
          <p className="text-center text-sm text-text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-brand-gold font-semibold hover:text-brand-gold-dark transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
