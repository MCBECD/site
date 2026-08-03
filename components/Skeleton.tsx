export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--color-bg-tertiary)] ${className}`}
      aria-hidden="true"
    />
  );
}

export function DocSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-3 p-6" aria-label="Loading content">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="p-4 rounded-lg border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 shrink-0 rounded" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="w-4 h-4 shrink-0 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
