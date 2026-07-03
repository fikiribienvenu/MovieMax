// src/components/movies/MovieSkeleton.tsx
export default function MovieSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-border">
          <div className="aspect-[2/3] skeleton" />
          <div className="p-3 space-y-2">
            <div className="h-3 skeleton rounded-full w-3/4" />
            <div className="h-2.5 skeleton rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
