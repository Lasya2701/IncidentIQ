import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { SimilarMatch } from "@/types/incident-iq";
import { formatDate } from "@/utils/format";
import {
  BrainCircuit,
  Check,
  ChevronDown,
  CircleX,
  Clock,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { RunbookOutcomeBadge, SourceBadge } from "@/components/ui-kit/Status";

export function MemoryMatchCard({
  match,
  defaultOpen = false,
  highlight = false,
}: {
  match: SimilarMatch;
  defaultOpen?: boolean;
  highlight?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const openMemoryDrawer = useAppStore((s) => s.openMemoryDrawer);
  const m = match.memory;

  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden border-border/80 bg-card p-0 transition-colors",
        highlight
          ? "border-memory/50 ring-1 ring-memory/30"
          : "hover:border-memory/30",
      )}
    >
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-memory">{m.incidentRef ?? m.id}</span>
          <SourceBadge source={m.source} />
          {m.runbookOutcome && <RunbookOutcomeBadge result={m.runbookOutcome} />}
          {m.sessionCreated && (
            <Badge variant="outline" className="border-ai/30 bg-ai/10 text-ai">
              <Clock className="size-3" /> created moments ago
            </Badge>
          )}
          <span className="ml-auto text-right">
            <span className="block text-[9px] uppercase tracking-wider text-faint">
              Demo relevance
            </span>
            <span className="tnum text-sm font-bold text-memory">{match.score}%</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-2 flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="text-sm font-semibold text-foreground">{m.title}</span>
          <ChevronDown
            className={cn("size-4 shrink-0 text-faint transition-transform duration-200", open && "rotate-180")}
          />
        </button>

        <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-md border border-critical/20 bg-critical/5 px-2.5 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-critical/80">
              Root cause
            </span>
            <p className="mt-0.5 font-medium text-foreground">{m.rootCause}</p>
          </div>
          <div className="rounded-md border border-success/20 bg-success/5 px-2.5 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-success/80">
              Resolution
            </span>
            <p className="mt-0.5 font-medium text-foreground">{m.resolution[0]}</p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-faint">
          <span className="inline-flex items-center gap-1">
            <Wrench className="size-3" /> {m.service}
          </span>
          {m.incidentRef && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> resolved in 11 min
            </span>
          )}
          <span>{formatDate(m.createdAt)}</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 border-memory/30 text-xs text-memory hover:bg-memory/10"
            onClick={() => openMemoryDrawer(m.id)}
          >
            <BrainCircuit className="size-3.5" /> View memory
          </Button>
          {!open && (
            <span className="text-[11px] text-faint">Expand for why this matched</span>
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-bg-secondary px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
            Why this memory?
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {match.reasons.map((r) => (
              <li key={r} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Check className="mt-0.5 size-3 shrink-0 text-success" />
                {r}
              </li>
            ))}
          </ul>
          {m.negativeFindings && m.negativeFindings.length > 0 && (
            <div className="mt-3 rounded-md border border-critical/25 bg-critical/5 p-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-critical">
                <CircleX className="size-3" /> Tried before, didn't help
              </p>
              <ul className="mt-1.5 space-y-1">
                {m.negativeFindings.map((f) => (
                  <li key={f} className="text-xs text-critical/90">
                    ✕ {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {m.lessons && m.lessons.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
                Lessons learned
              </p>
              <ul className="mt-1.5 space-y-1">
                {m.lessons.map((l) => (
                  <li key={l} className="text-xs text-muted-foreground">
                    • {l}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
