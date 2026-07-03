// src/app/movies/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Star, Clock, Calendar, Lock, Plus, Check, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MovieGrid from "@/components/movies/MovieGrid";
import { getMovieById, movies } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";

export default function MovieDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  const movie = getMovieById(id);
  const { isSubscribed, isLoggedIn, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();

  if (!movie) return notFound();

  const inWatchlist = isInWatchlist(movie.id);
  const related = movies.filter((m) => m.category === movie.category && m.id !== movie.id).slice(0, 6);

  const handleWatchlist = () => {
    if (!isLoggedIn) return;
    if (inWatchlist) removeFromWatchlist(movie.id);
    else addToWatchlist(movie.id);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Backdrop */}
        <div className="relative h-[55vh] min-h-[360px] overflow-hidden">
          <Image
            src={movie.backdropUrl}
            alt={movie.title}
            fill
            priority
            className="object-cover object-top brightness-[0.28]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-bg-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/60 to-transparent" />

          {/* Back button */}
          <div className="absolute top-20 left-0 right-0 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>

        {/* Detail Content */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">

            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:block"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-border shadow-card">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Title */}
              <h1 className="font-display text-[clamp(36px,5vw,68px)] leading-none tracking-wider uppercase text-text-primary mb-4">
                {movie.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-xs font-semibold rounded-full">
                  <Star className="w-3 h-3 fill-brand-gold" /> {movie.rating}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary border border-border text-text-secondary text-xs font-medium rounded-full">
                  <Calendar className="w-3 h-3" /> {movie.year}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary border border-border text-text-secondary text-xs font-medium rounded-full">
                  <Clock className="w-3 h-3" /> {movie.duration}
                </span>
                {movie.genre.split(" · ").map((g) => (
                  <span key={g} className="px-3 py-1.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-medium rounded-full">
                    {g}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-text-secondary text-base leading-relaxed mb-6 max-w-2xl">
                {movie.description}
              </p>

              {/* Director & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-widest font-semibold mb-1">Director</p>
                  <p className="text-sm text-text-primary font-medium">{movie.director}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-widest font-semibold mb-1">Cast</p>
                  <p className="text-sm text-text-primary font-medium">{movie.cast.slice(0, 3).join(", ")}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-10">
                {isSubscribed ? (
                  <button className="flex items-center gap-2 px-7 py-3.5 bg-brand-red text-white rounded-xl font-bold text-sm hover:bg-brand-red-dark active:scale-95 transition-all shadow-red">
                    <Play className="w-4 h-4 fill-white" />
                    Watch Full Movie
                  </button>
                ) : (
                  <Link
                    href="/pricing"
                    className="flex items-center gap-2 px-7 py-3.5 bg-brand-gold text-black rounded-xl font-bold text-sm hover:bg-brand-gold-dark active:scale-95 transition-all shadow-gold"
                  >
                    ✦ Subscribe to Watch
                  </Link>
                )}

                {isLoggedIn && (
                  <button
                    onClick={handleWatchlist}
                    className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm border transition-all active:scale-95 ${
                      inWatchlist
                        ? "bg-brand-gold/15 border-brand-gold/40 text-brand-gold"
                        : "bg-bg-tertiary border-border text-text-secondary hover:text-text-primary hover:border-text-muted"
                    }`}
                  >
                    {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {inWatchlist ? "In My List" : "Add to List"}
                  </button>
                )}
              </div>

              {/* Video Player / Trailer Area */}
              <div className="rounded-2xl overflow-hidden border border-border bg-bg-tertiary aspect-video relative">
                {isSubscribed ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-brand-red/20 border-2 border-brand-red flex items-center justify-center cursor-pointer hover:bg-brand-red group transition-all">
                      <Play className="w-8 h-8 fill-brand-red group-hover:fill-white text-brand-red group-hover:text-white ml-1 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-text-secondary text-sm font-medium">Full Movie Available</p>
                      <p className="text-text-muted text-xs mt-1">4K · Dolby Audio · CC Available</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Trailer Preview */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-[72px] h-[72px] rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all mx-auto mb-3">
                          <Play className="w-8 h-8 fill-white text-white ml-1" />
                        </div>
                        <p className="text-text-secondary text-sm">Trailer Preview</p>
                      </div>
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 rounded-2xl">
                      <div className="w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-brand-gold" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-display text-2xl tracking-wider mb-1">Full Movie Locked</h3>
                        <p className="text-text-muted text-sm max-w-xs">
                          Subscribe to unlock this and thousands of movies in 4K Ultra HD.
                        </p>
                      </div>
                      <Link
                        href="/pricing"
                        className="flex items-center gap-2 px-7 py-3 bg-brand-gold text-black rounded-xl font-bold text-sm hover:bg-brand-gold-dark active:scale-95 transition-all shadow-gold"
                      >
                        ✦ Subscribe Now — From $8/mo
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Related Movies */}
          {related.length > 0 && (
            <div className="mt-16">
              <MovieGrid title={`More ${movie.category} Movies`} movies={related} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
