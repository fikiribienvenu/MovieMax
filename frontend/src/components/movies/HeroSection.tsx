// src/components/movies/HeroSection.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import { Movie } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface HeroSectionProps {
  movie: Movie;
}

export default function HeroSection({ movie }: HeroSectionProps) {
  const { isSubscribed } = useAuth();

  return (
    <div className="relative h-[88vh] min-h-[560px] flex items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={movie.backdropUrl}
          alt={movie.title}
          fill
          priority
          className="object-cover object-top brightness-[0.35]"
          sizes="100vw"
        />
      </div>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 md:pb-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-bold px-3 py-1.5 rounded-full mb-4 tracking-wider uppercase"
          >
            <Star className="w-3 h-3 fill-brand-gold" />
            Featured Film
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-display text-[clamp(48px,8vw,96px)] leading-[0.92] tracking-wider uppercase text-text-primary mb-4"
          >
            {movie.title}
          </motion.h1>

          {/* Meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 mb-4"
          >
            <div className="flex items-center gap-1.5 text-brand-gold font-bold">
              <Star className="w-4 h-4 fill-brand-gold" />
              <span>{movie.rating}</span>
            </div>
            <span className="text-text-secondary text-sm">{movie.year}</span>
            <span className="text-text-secondary text-sm">{movie.duration}</span>
            <span className="text-text-secondary text-sm">{movie.genre}</span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-text-secondary text-base leading-relaxed mb-8 max-w-xl"
          >
            {movie.description}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href={`/movies/${movie.id}`}
              className="flex items-center gap-2 px-7 py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-lg"
            >
              <Play className="w-4 h-4 fill-black" />
              {isSubscribed ? "Watch Now" : "Watch Trailer"}
            </Link>
            <Link
              href={`/movies/${movie.id}`}
              className="flex items-center gap-2 px-7 py-3.5 bg-white/12 text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-white/20 active:scale-95 transition-all duration-200 backdrop-blur-sm"
            >
              <Info className="w-4 h-4" />
              More Info
            </Link>
            {!isSubscribed && (
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-7 py-3.5 bg-brand-gold text-black rounded-xl font-bold text-sm hover:bg-brand-gold-dark active:scale-95 transition-all duration-200"
              >
                ✦ Subscribe to Watch
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
