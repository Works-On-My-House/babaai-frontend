export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-white/60 bg-white/60 p-5 backdrop-blur-sm"
        >
          <div className="mb-3 h-5 w-2/3 rounded-lg bg-stone-200" />
          <div className="mb-2 h-4 w-1/3 rounded bg-stone-200" />
          <div className="h-4 w-1/2 rounded bg-stone-200" />
        </div>
      ))}
    </div>
  );
}
