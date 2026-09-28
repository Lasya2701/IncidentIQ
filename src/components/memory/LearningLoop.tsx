import { cn } from "@/lib/utils";
import { ArrowRight, BrainCircuit, RefreshCw } from "lucide-react";

const LOOP = [
  "Incident",
  "Investigation",
  "AI diagnosis",
  "Memory retrieval",
  "Resolution",
  "Postmortem",
  "Memory creation",
  "Hindsight",
  "Better next response",
];

/**
 * Compact learning-loop strip: Incident → … → Better response, cycling back.
 * `variant="hero"` renders larger tiles for feature sections.
 */
export function LearningLoop({
  counts,
  variant = "strip",
  className,
}: {
  counts?: { incidents?: number; memories?: number; retrievals?: number };
  variant?: "strip" | "hero";
  className?: string;
}) {
  if (variant === "hero") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {LOOP.slice(0, 8).map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium",
                  s === "Memory creation" || s === "Hindsight"
                    ? "border-memory/40 bg-memory/10 text-memory"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {s}
              </span>
              {i < 7 && <ArrowRight className="size-3.5 text-faint" />}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="size-3.5 text-memory" />
          Hindsight feeds the next incident with better context
        </div>
        {counts && (
          <div className="flex flex-wrap items-center justify-center gap-6 pt-1 text-center">
            <LoopStat label="Incidents remembered" value={counts.incidents ?? 1842} />
            <LoopStat label="Memories in Hindsight" value={counts.memories ?? 12482} />
            <LoopStat label="Retrievals served" value={counts.retrievals ?? 18291} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {LOOP.filter((s) => !["Investigation", "Postmortem"].includes(s)).map((s, i, arr) => (
        <span key={s} className="flex items-center gap-1">
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] font-medium",
              s === "Memory retrieval" || s === "Hindsight" || s === "Memory creation"
                ? "border-memory/35 bg-memory/10 text-memory"
                : "border-border bg-secondary text-muted-foreground",
            )}
          >
            {s}
          </span>
          {i < arr.length - 1 && <ArrowRight className="size-3 text-faint" />}
        </span>
      ))}
      <RefreshCw className="ml-1 size-3 text-memory" aria-label="loops back to future incidents" />
    </div>
  );
}

function LoopStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="tnum text-lg font-bold text-foreground">{value.toLocaleString()}</p>
      <p className="text-[10px] uppercase tracking-wider text-faint">{label}</p>
    </div>
  );
}

export function MemoryAtWorkStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-memory/25 bg-memory/[0.06] px-4 py-3",
        className,
      )}
    >
      <BrainCircuit className="size-4 shrink-0 text-memory" />
      <LearningLoop variant="strip" className="min-w-0 flex-1" />
    </div>
  );
}
