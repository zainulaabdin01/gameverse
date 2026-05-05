import { Skeleton } from "@/components/ui/skeleton";

/** Generic page-level skeleton shown while a route is pending. */
export function PageSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Nameplate-style header skeleton */}
      <header className="border-b border-border/60 bg-surface/20">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="flex items-center justify-between border-b border-border/40 py-2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="hidden h-3 w-32 sm:block" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex flex-col items-center py-8 text-center">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-3 h-12 w-2/3 max-w-xl" />
            <Skeleton className="mt-4 h-3 w-72" />
          </div>
        </div>
      </header>

      {/* Sticky-bar skeleton */}
      <div className="border-b border-border/60 bg-background/80">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:px-8">
          <Skeleton className="h-9 w-full max-w-md rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Card grid skeleton */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
        <Skeleton className="mb-6 h-4 w-40" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
