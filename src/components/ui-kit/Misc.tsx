import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { AlertTriangle, ChevronRight, RefreshCw } from "lucide-react";

export function SectionTitle({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function InfoStat({
  label,
  value,
  className,
  valueClass,
}: {
  label: string;
  value: ReactNode;
  className?: string;
  valueClass?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-faint">{label}</div>
      <div className={cn("mt-1 truncate text-sm font-semibold text-foreground", valueClass)}>
        {value}
      </div>
    </div>
  );
}

export function SkeletonBlocks({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function ErrorState({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-8 text-center"
    >
      <AlertTriangle className="size-6 text-warning" />
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="size-3.5" /> Retry
        </Button>
      )}
    </div>
  );
}

/** Small horizontal flow diagram: steps joined by arrows. */
export function FlowDiagram({
  steps,
  className,
  activeIndex,
}: {
  steps: string[];
  className?: string;
  activeIndex?: number;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-md border px-2 py-1 text-[11px] font-medium",
              i === activeIndex
                ? "border-memory/40 bg-memory/15 text-memory"
                : "border-border bg-secondary text-muted-foreground",
            )}
          >
            {s}
          </span>
          {i < steps.length - 1 && <ChevronRight className="size-3 text-faint" />}
        </span>
      ))}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
