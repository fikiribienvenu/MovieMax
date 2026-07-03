// src/app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Film } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    signup(data.name, data.email);
    router.push("/pricing");
    setLoading(false);
  };

  const fields = [
    {
      key: "name",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      icon: <User className="w-4 h-4 text-text-muted" />,
      error: errors.name?.message,
      extra: null,
    },
    {
      key: "email",
      label: "Email Address",
      type: "email",
      placeholder: "you@example.com",
      icon: <Mail className="w-4 h-4 text-text-muted" />,
      error: errors.email?.message,
      extra: null,
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px]"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-display text-4xl tracking-widest text-brand-red">
              CINE<span className="text-brand-gold">MAX</span>
            </span>
          </Link>
          <p className="text-text-muted text-sm mt-2">Start watching in minutes</p>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-8 shadow-2xl">
          <h1 className="font-display text-3xl tracking-wider uppercase text-center mb-6">
            Create Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  {...register("name")}
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-bg-tertiary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-red/60 transition-colors font-body"
                />
              </div>
              {errors.name && <p className="text-brand-red text-xs mt-1.5">{errors.name.message}</p>}
            </div>

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
              {errors.email && <p className="text-brand-red text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="w-full bg-bg-tertiary border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-red/60 transition-colors font-body"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-brand-red text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  {...register("confirmPassword")}
                  type={showPass2 ? "text" : "password"}
                  placeholder="Repeat your password"
                  className="w-full bg-bg-tertiary border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand-red/60 transition-colors font-body"
                />
                <button type="button" onClick={() => setShowPass2(!showPass2)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showPass2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-brand-red text-xs mt-1.5">{errors.confirmPassword.message}</p>}
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
                  Creating account...
                </span>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button className="w-full py-3 bg-bg-tertiary border border-border rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:border-text-muted transition-all flex items-center justify-center gap-2">
            <Film className="w-4 h-4" />
            Continue with Google
          </button>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-gold font-semibold hover:text-brand-gold-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
