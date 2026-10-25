import * as React from "react";
import { cn } from "@jobrio/utils/utils";

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("skeleton-shimmer rounded-lg bg-surface-container-high/60", className)}
    {...props}
  />
);

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
    ))}
  </div>
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-2xl p-6 space-y-4", className)}>
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonStat = () => (
  <div className="rounded-2xl p-6 space-y-3">
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-2 w-1/3" />
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 py-3">
    <Skeleton className="w-8 h-8 rounded-full" />
    <Skeleton className="h-3 flex-1" />
    <Skeleton className="h-3 w-16" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const SkeletonTable = ({
  rows = 5,
  columns,
  header = false,
  className,
}: {
  rows?: number;
  columns?: (string | number)[];
  header?: boolean;
  className?: string;
}) => {
  const cols = columns ?? ["2fr", "1fr", "1fr", "1fr"];
  const template = cols.map((c) => (typeof c === "number" ? `${c}px` : c)).join(" ");
  return (
    <div className={cn("w-full", className)}>
      {header && (
        <div className="grid gap-4 px-4 py-3" style={{ gridTemplateColumns: template }}>
          {cols.map((_, i) => (
            <Skeleton key={i} className="h-3 w-2/3" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4 px-4 py-3.5" style={{ gridTemplateColumns: template }}>
          {cols.map((_, c) => (
            <Skeleton key={c} className={cn("h-3", c === 0 ? "w-5/6" : "w-1/2")} />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonImage — exact-size gray placeholder that holds the image's aspect
 * ratio (no layout shift) and cross-fades to the real image once decoded.
 */
export const SkeletonImage = ({
  src,
  alt = "",
  aspectRatio = "16 / 9",
  className,
  imgClassName,
  ...props
}: {
  src?: string;
  alt?: string;
  aspectRatio?: string;
  className?: string;
  imgClassName?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">) => {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl", className)}
      style={{ aspectRatio }}
      {...props}
    >
      {!loaded && <Skeleton className="absolute inset-0 h-full w-full rounded-[inherit]" />}
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
    </div>
  );
};

/** Chart widget placeholder: title, plot area with bars, axis labels. */
export const SkeletonChart = ({ bars = 7, className }: { bars?: number; className?: string }) => (
  <div className={cn("space-y-4", className)}>
    <Skeleton className="h-3 w-1/3" />
    <div className="flex h-40 items-end gap-3">
      {Array.from({ length: bars }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-lg"
          style={{ height: `${35 + ((i * 37) % 60)}%` }}
        />
      ))}
    </div>
    <div className="flex gap-3">
      {Array.from({ length: bars }).map((_, i) => (
        <Skeleton key={i} className="h-2 flex-1" />
      ))}
    </div>
  </div>
);

/**
 * SkeletonBoundary — one place to express the skeleton → content → error
 * mapping. On error the skeleton is dropped immediately for the fallback.
 */
export const SkeletonBoundary = ({
  loading,
  error,
  skeleton,
  errorFallback,
  children,
}: {
  loading: boolean;
  error?: unknown;
  skeleton: React.ReactNode;
  errorFallback?: React.ReactNode;
  children: React.ReactNode;
}) => {
  if (error) return <>{errorFallback ?? null}</>;
  if (loading) return <>{skeleton}</>;
  return <>{children}</>;
};
