// src/components/movies/MovieCard.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Play, Lock, Plus, Check } from "lucide-react";
import { Movie } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const { isSubscribed, isInWatchlist, addToWatchlist, removeFromWatchlist, isLoggedIn } =
    useAuth();
  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative"
    >
      <Link href={`/movies/${movie.id}`}>
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-brand-gold/30 group-hover:shadow-card-hover group-hover:-translate-y-1.5">
          {/* Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={movie.poster}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />

            {/* Badge */}
            {movie.badge === "new" && (
              <div className="absolute top-2 left-2 bg-brand-red text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide z-10">
                NEW
              </div>
            )}

            {/* Watchlist button */}
            {isLoggedIn && (
              <button
                onClick={handleWatchlistToggle}
                className={cn(
                  "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 opacity-0 group-hover:opacity-100",
                  inWatchlist
                    ? "bg-brand-gold text-black"
                    : "bg-black/60 backdrop-blur-sm text-white border border-white/20 hover:bg-brand-gold hover:text-black hover:border-transparent"
                )}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
              <button className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-100 transition-colors">
                <Play className="w-3.5 h-3.5 fill-black" />
                Watch Trailer
              </button>
              {isSubscribed ? (
                <button className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-brand-red text-white text-xs font-bold hover:bg-brand-red-dark transition-colors">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Watch Now
                </button>
              ) : (
                <Link
                  href="/pricing"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-brand-gold text-black text-xs font-bold hover:bg-brand-gold-dark transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Subscribe
                </Link>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-semibold text-sm text-text-primary truncate mb-1.5">
              {movie.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-brand-gold">
                <Star className="w-3 h-3 fill-brand-gold" />
                <span className="text-xs font-bold">{movie.rating}</span>
              </div>
              <span className="text-[10px] text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full">
                {movie.category}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
