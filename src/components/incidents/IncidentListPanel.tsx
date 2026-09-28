import { cn } from "@/lib/utils";
import type { Incident, Severity } from "@/types/incident-iq";
import { shortTime } from "@/utils/format";
import { MemoryBadge } from "@/components/ui-kit/Status";

const SEV_BAR: Record<Severity, string> = {
  critical: "bg-critical",
  high: "bg-warning",
  medium: "bg-info",
  low: "bg-faint",
};

export function IncidentListPanel({
  incidents,
  selectedId,
  onSelect,
  className,
}: {
  incidents: Incident[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Incidents
        </h2>
        <span className="tnum rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {incidents.length} active
        </span>
      </div>
      <ul className="max-h-[70vh] flex-1 divide-y divide-border/60 overflow-y-auto" role="listbox" aria-label="Active incidents">
        {incidents.map((inc) => {
          const selected = inc.id === selectedId;
          return (
            <li key={inc.id} role="option" aria-selected={selected}>
              <button
                type="button"
                onClick={() => onSelect(inc.id)}
                className={cn(
                  "relative w-full px-3 py-2.5 text-left transition-colors duration-150",
                  selected ? "bg-secondary" : "hover:bg-secondary/50",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-0.5",
                    SEV_BAR[inc.severity],
                    selected ? "opacity-100" : "opacity-40",
                  )}
                />
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-faint">{inc.id}</span>
                  <span
                    className={cn(
                      "ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                      inc.severity === "critical" && "bg-critical/15 text-critical",
                      inc.severity === "high" && "bg-warning/15 text-warning",
                      inc.severity === "medium" && "bg-info/15 text-info",
                      inc.severity === "low" && "bg-faint/15 text-faint",
                    )}
                  >
                    {inc.severity}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-0.5 block truncate text-[13px] font-medium",
                    selected ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {inc.title}
                </span>
                <span className="mt-1 flex items-center gap-2 text-[10px] text-faint">
                  <span className="truncate">{inc.service}</span>
                  <span>·</span>
                  <span>{shortTime(inc.detectedAt)}</span>
                  <MemoryBadge count={inc.memoryMatches} className="ml-auto scale-90" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
