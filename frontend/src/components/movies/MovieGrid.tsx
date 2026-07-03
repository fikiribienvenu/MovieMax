// src/components/movies/MovieGrid.tsx
import MovieCard from "./MovieCard";
import { Movie } from "@/types";

interface MovieGridProps {
  movies: Movie[];
  title?: string;
  showSeeAll?: boolean;
  seeAllHref?: string;
  emptyMessage?: string;
}

export default function MovieGrid({
  movies,
  title,
  showSeeAll,
  seeAllHref = "/search",
  emptyMessage = "No movies found.",
}: MovieGridProps) {
  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl tracking-wider uppercase text-text-primary">
            {title}
          </h2>
          {showSeeAll && (
            <a
              href={seeAllHref}
              className="text-sm text-text-muted hover:text-brand-gold transition-colors font-medium"
            >
              See all →
            </a>
          )}
        </div>
      )}

      {movies.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-text-muted text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
