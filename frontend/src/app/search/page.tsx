// src/app/search/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MovieGrid from "@/components/movies/MovieGrid";
import MovieSkeleton from "@/components/movies/MovieSkeleton";
import CategoryFilter from "@/components/movies/CategoryFilter";
import { searchMovies } from "@/lib/data";
import { Category, Movie } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [sortBy, setSortBy] = useState<"rating" | "year" | "title">("rating");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const perform = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 300)); // Simulate search delay
      let found = searchMovies(query, activeCategory);
      found = [...found].sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "year") return b.year - a.year;
        return a.title.localeCompare(b.title);
      });
      setResults(found);
      setLoading(false);
    };
    perform();
  }, [query, activeCategory, sortBy]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="font-display text-4xl tracking-wider uppercase mb-2">
              Browse <span className="text-brand-red">Movies</span>
            </h1>
            <p className="text-text-muted text-sm">Discover your next favourite film</p>
          </motion.div>

          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex items-center gap-3 flex-1 bg-bg-secondary border border-border rounded-xl px-4 focus-within:border-brand-red/50 transition-colors">
              <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, directors, actors..."
                className="flex-1 bg-transparent py-3.5 text-sm text-text-primary placeholder-text-muted outline-none font-body"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-text-muted hover:text-text-primary text-xs transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 bg-bg-secondary border border-border rounded-xl px-4 py-2.5">
              <SlidersHorizontal className="w-4 h-4 text-text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-sm text-text-secondary outline-none cursor-pointer font-body"
              >
                <option value="rating">Top Rated</option>
                <option value="year">Newest First</option>
                <option value="title">A–Z</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
          </div>

          {/* Results Count */}
          {!loading && (
            <p className="text-sm text-text-muted mb-5">
              {results.length > 0
                ? `${results.length} movie${results.length !== 1 ? "s" : ""} found${query ? ` for "${query}"` : ""}`
                : ""}
            </p>
          )}

          {/* Results */}
          {loading ? (
            <MovieSkeleton count={12} />
          ) : results.length > 0 ? (
            <MovieGrid movies={results} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="font-display text-2xl tracking-wider mb-2">No results found</h3>
              <p className="text-text-muted text-sm max-w-xs">
                {query
                  ? `No movies match "${query}". Try a different search or category.`
                  : "No movies in this category yet."}
              </p>
              <button
                onClick={() => { setQuery(""); setActiveCategory("all"); }}
                className="mt-5 px-5 py-2.5 bg-brand-red text-white rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
      <SearchContent />
    </Suspense>
  );
}
