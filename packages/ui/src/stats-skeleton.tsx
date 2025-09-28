export function StatsSkeleton() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border border-border bg-muted/30 p-4">
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="mt-3 h-8 w-24 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
