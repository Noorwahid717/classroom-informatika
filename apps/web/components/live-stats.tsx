import { Suspense } from "react";
import { StatsSkeleton } from "@classroom/ui/stats-skeleton";
import { getStats } from "../server-actions/get-stats";

export async function LiveStats() {
  const stats = await getStats();
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-4">
      {stats.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="text-3xl font-bold text-card-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function LiveStatsFallback() {
  return (
    <Suspense fallback={<StatsSkeleton />}> 
      <StatsSkeleton />
    </Suspense>
  );
}
