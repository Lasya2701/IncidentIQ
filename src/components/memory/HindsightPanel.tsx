import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui-kit/Misc";
import { MemoryMatchCard } from "@/components/memory/MemoryMatchCard";
import { api } from "@/services";
import { useAppStore } from "@/store/useAppStore";
import type { SimilarMatch } from "@/types/incident-iq";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, BrainCircuit, Search, Siren } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type HindsightStage =
  | "idle"
  | "searching"
  | "scanned"
  | "candidates"
  | "relevant"
  | "pattern"
  | "done"
  | "error";

const STAGE_COPY: Record<Exclude<HindsightStage, "idle" | "done" | "error">, string> = {
  searching: "Searching historical memory…",
  scanned: "12,482 memories scanned",
  candidates: "23 candidates",
  relevant: "4 highly relevant memories",
  pattern: "Pattern identified: database connection exhaustion",
};

const STAGE_ORDER: Exclude<HindsightStage, "idle" | "done" | "error">[] = [
  "searching",
  "scanned",
  "candidates",
  "relevant",
  "pattern",
];

/**
 * Drives the retrieval animation through its stages.
 * External `stage` prop can override (used by the demo controller).
 */
export function HindsightPanel({
  incidentId,
  stage: stageProp,
  matches: matchesProp,
  loading: loadingProp,
  onSelect,
  compact = false,
}: {
  incidentId: string;
  /** When provided, the panel renders this stage instead of self-driving. */
  stage?: HindsightStage;
  matches?: SimilarMatch[];
  loading?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}) {
  const selfDrive = stageProp === undefined;
  const [selfStage, setSelfStage] = useState<HindsightStage>(selfDrive ? "idle" : (stageProp as HindsightStage));
  const [matches, setMatches] = useState<SimilarMatch[] | undefined>(matchesProp);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bumpRetrievals = useAppStore((s) => s.bumpRetrievals);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = () => {
    clearTimers();
    setError(null);
    setLoading(true);
    setSelfStage("searching");
    bumpRetrievals();

    const stageDelays = [600, 500, 450, 500, 450];
    let elapsed = 0;
    STAGE_ORDER.forEach((s, i) => {
      elapsed += stageDelays[i];
      timers.current.push(
        setTimeout(() => {
          setSelfStage(s);
        }, elapsed),
      );
    });

    api
      .getSimilarIncidents(incidentId)
      .then((result) => {
        timers.current.push(
          setTimeout(() => {
            setMatches(result);
            setLoading(false);
            setSelfStage("done");
          }, elapsed + 300),
        );
      })
      .catch((err: Error) => {
        clearTimers();
        setLoading(false);
        setError(err.message);
        setSelfStage("error");
      });
  };

  useEffect(() => {
    if (selfDrive && incidentId) run();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId]);

  const stage = selfDrive ? selfStage : (stageProp as HindsightStage);
  const shownMatches = selfDrive ? matches : matchesProp;
  const shownLoading = selfDrive ? loading : (loadingProp ?? false);
  const done = stage === "done" && !!shownMatches?.length;
  const isFlowStage = STAGE_ORDER.includes(stage as never);

  return (
    <Card className="hairline-top gap-0 overflow-hidden border-memory/25 bg-gradient-to-b from-memory/[0.07] to-card p-0">
      <CardHeader className="flex-row items-center justify-between gap-3 border-b border-memory/20 bg-memory/[0.06] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-memory to-ai text-white shadow-sm">
            <BrainCircuit className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Hindsight Memory
            </h2>
            <p className="text-xs text-muted-foreground">
              What has IncidentIQ seen before?
            </p>
          </div>
        </div>
        {done && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-memory/30 bg-memory/10 px-2.5 py-1 text-xs font-medium text-memory">
            <Siren className="size-3.5" />
            {shownMatches!.length} similar incidents found
          </span>
        )}
        {selfDrive && (stage === "error" || (isFlowStage && stage !== "pattern")) && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-memory/30 text-xs text-memory"
            onClick={run}
          >
            Re-run search
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5">
        {/* Retrieval flow */}
        {(stage !== "idle" || shownLoading) && (
          <div className="mb-4 rounded-lg border border-border bg-bg-secondary/60 p-3">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <AnimatePresence mode="wait">
                {isFlowStage && (
                  <motion.div
                    key={stage}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex flex-col items-center gap-1"
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 text-sm font-medium",
                        stage === "pattern" ? "text-memory" : "text-muted-foreground",
                      )}
                    >
                      {stage === "searching" && (
                        <Search className="size-3.5 animate-pulse text-memory" />
                      )}
                      {STAGE_COPY[stage as Exclude<HindsightStage, "idle" | "done" | "error">]}
                    </span>
                    {stage !== "pattern" && <ArrowDown className="size-3 text-faint" />}
                  </motion.div>
                )}
                {stage === "error" && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium text-warning"
                  >
                    Hindsight unavailable — continuing without historical context
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {stage === "error" && (
          <ErrorState
            title="Hindsight memory temporarily unavailable"
            body="AI diagnosis can continue without historical context. Retry to search memory again."
            onRetry={run}
          />
        )}

        {shownLoading && !isFlowStage && (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        )}

        {shownLoading && isFlowStage && (
          <div className="mt-1 space-y-2" aria-label="Searching historical memory">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Flow indicator while searching */}
        {isFlowStage && (
          <div className="mb-3 flex items-center justify-center gap-1.5" aria-hidden>
            {STAGE_ORDER.map((s, i) => {
              const idx = STAGE_ORDER.indexOf(stage as never);
              const active = i <= idx;
              return (
                <span
                  key={s}
                  className={cn(
                    "h-1 w-10 rounded-full transition-colors duration-300",
                    active ? "bg-memory" : "bg-secondary",
                  )}
                />
              );
            })}
          </div>
        )}

        {done && shownMatches && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn("space-y-3", compact && "space-y-2")}
          >
            {shownMatches.map((match, i) => (
              <motion.div
                key={match.memory.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut", delay: i * 0.08 }}
              >
                <MemoryMatchCard
                  match={match}
                  defaultOpen={i === 0 && !compact}
                  highlight={i === 0}
                />
              </motion.div>
            ))}
            {!compact && onSelect && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={onSelect}
              >
                Open Similar Incidents page →
              </Button>
            )}
          </motion.div>
        )}

        {stage === "done" && !shownLoading && shownMatches?.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium text-foreground">No similar incidents found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This appears to be a new failure pattern. Once resolved, IncidentIQ can
              remember this incident for future use.
            </p>
          </div>
        )}

        {stage === "idle" && !shownLoading && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Run AI diagnosis to search historical memory.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
