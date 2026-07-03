// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero skeleton */}
      <div className="h-[88vh] skeleton opacity-30" />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {[1, 2].map((s) => (
          <div key={s}>
            <div className="h-7 skeleton rounded-lg w-48 mb-5" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border">
                  <div className="aspect-[2/3] skeleton" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 skeleton rounded-full w-3/4" />
                    <div className="h-2.5 skeleton rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
