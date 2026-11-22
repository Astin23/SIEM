import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type: "card" | "table" | "list";
}

export function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  if (type === "card") {
    return (
      <div className="rounded-xl border border-border/50 bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-5 w-1/3 bg-muted/60" />
        <Skeleton className="h-10 w-24 bg-muted/60" />
        <Skeleton className="h-4 w-1/2 bg-muted/60" />
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full bg-muted/60" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full bg-muted/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Skeleton className="h-16 w-full bg-muted/60" />
      <Skeleton className="h-16 w-full bg-muted/60" />
      <Skeleton className="h-16 w-full bg-muted/60" />
    </div>
  );
}
