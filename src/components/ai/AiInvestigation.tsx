import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui-kit/Misc";
import { cn } from "@/lib/utils";
import { api } from "@/services";
import { notify, useAppStore } from "@/store/useAppStore";
import type { Diagnosis } from "@/types/incident-iq";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleAlert,
  FileSearch,
  GitCompareArrows,
  ListChecks,
  Loader2,
  MessagesSquare,
  Network,
  ScrollText,
  Search,
  Stethoscope,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Reasoning steps                                                     */
/* ------------------------------------------------------------------ */

interface ReasonStep {
  label: string;
  icon: LucideIcon;
  detail: string;
  memoryTouched?: boolean;
}

const REASON_STEPS: ReasonStep[] = [
  { label: "Parsed incident", icon: FileSearch, detail: "Symptoms, service and impact extracted from the alert." },
  { label: "Analyzed logs", icon: ScrollText, detail: "Streamed logs correlated with the 503 spike window." },
  { label: "Identified symptoms", icon: ListChecks, detail: "Pool saturation + 503s + DB utilization rising together." },
  { label: "Checked dependencies", icon: Network, detail: "Redis healthy; PostgreSQL connection pressure detected." },
  { label: "Searched Hindsight", icon: Search, detail: "Embedded incident and queried memory (retain/recall/reflect).", memoryTouched: true },
  { label: "Retrieved similar incidents", icon: BrainCircuit, detail: "4 historical incidents matched (top: INC-00172, 92%).", memoryTouched: true },
  { label: "Compared historical resolutions", icon: GitCompareArrows, detail: "Pool increase worked; restart-only failed (INC-00118).", memoryTouched: true },
  { label: "Checked runbooks", icon: Wrench, detail: "Database Connection Pool Exhaustion — resolved 5 of 6." },
  { label: "Generated diagnosis", icon: Stethoscope, detail: "Root cause selected with supporting evidence." },
];

const STEP_MS = 420;

function useReasoningAnimation(active: boolean) {
  const [stepIndex, setStepIndex] = useState(-1);
  const done = stepIndex >= REASON_STEPS.length;
  useEffect(() => {
    if (!active) {
      setStepIndex(-1);
      return;
    }
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setStepIndex(i);
      if (i >= REASON_STEPS.length) clearInterval(t);
    }, STEP_MS);
    return () => clearInterval(t);
  }, [active]);
  return { stepIndex, done };
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export type InvestigationState = "idle" | "running" | "complete" | "error";

export function AiInvestigation({
  incidentId,
  state,
  onStateChange,
  onDiagnosed,
}: {
  incidentId: string;
  state: InvestigationState;
  onStateChange: (s: InvestigationState) => void;
  onDiagnosed?: (d: Diagnosis) => void;
}) {
  const [diagnosis, setDiagnosis] = useState<Diagnosis | undefined>(undefined);
  const [expanded, setExpanded] = useState<number | undefined>(undefined);
  const setAiPhase = useAppStore((s) => s.setAiPhase);
  const { stepIndex, done } = useReasoningAnimation(state === "running");
  const diagnosedRef = useRef(false);

  // Sync: when diagnosis arrives, wait for animation to finish, then complete.
  useEffect(() => {
    if (state !== "running" || !diagnosis) return;
    if (done && !diagnosedRef.current) {
      diagnosedRef.current = true;
      const t = setTimeout(() => {
        onStateChange("complete");
        onDiagnosed?.(diagnosis);
        setAiPhase(incidentId, "diagnosed");
        notify("ai", "Diagnosis completed", `Root cause identified for ${incidentId}.`);
      }, 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, state, diagnosis]);

  const run = async () => {
    setDiagnosis(undefined);
    diagnosedRef.current = false;
    onStateChange("running");
    setAiPhase(incidentId, "analyzing");
    try {
      const d = await api.runDiagnosis(incidentId);
      setDiagnosis(d);
    } catch {
      onStateChange("error");
      setAiPhase(incidentId, "llm_error");
    }
  };

  // External drivers (e.g. the demo script) can set state to "running" without
  // invoking run(); fetch the diagnosis so the animation has a result to show.
  const fetchRef = useRef(false);
  useEffect(() => {
    if (state === "running" && !fetchRef.current) {
      fetchRef.current = true;
      void (async () => {
        try {
          const d = await api.runDiagnosis(incidentId);
          setDiagnosis(d);
        } catch {
          fetchRef.current = false;
          onStateChange("error");
          setAiPhase(incidentId, "llm_error");
        }
      })();
    }
    if (state !== "running") {
      fetchRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, incidentId]);

  return (
    <Card className="hairline-top gap-0 border-ai/25 bg-card p-0">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-ai to-memory text-white shadow-sm">
            <Bot className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-tight">AI Diagnosis</h2>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Powered by Hindsight Memory
              <BrainCircuit className="size-3.5 text-memory" />
            </p>
          </div>
        </div>
        {state === "complete" ? (
          <Badge className="border-success/30 bg-success/10 text-success" variant="outline">
            <Check className="size-3.5" /> Diagnosis Complete
          </Badge>
        ) : state === "running" ? (
          <Badge className="border-ai/30 bg-ai/10 text-ai" variant="outline">
            <Loader2 className="size-3.5 animate-spin" /> Analyzing…
          </Badge>
        ) : (
          <Button
            onClick={run}
            className="gap-2 bg-ai text-white hover:bg-ai/90"
            size="sm"
          >
            <Bot className="size-4" />
            {state === "error" ? "Retry AI Diagnosis" : "Run AI Diagnosis"}
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5">
        {/* Reasoning steps */}
        {(state === "running" || state === "complete") && (
          <ol className="mb-4 space-y-1" aria-label="AI reasoning steps">
            {REASON_STEPS.map((s, i) => {
              const status =
                state === "complete" || i < stepIndex
                  ? "done"
                  : i === stepIndex
                    ? "active"
                    : "pending";
              return (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === i ? undefined : i)}
                    aria-expanded={expanded === i}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                      status === "active" && "bg-ai/[0.08]",
                      status === "pending" && "opacity-40",
                      "hover:bg-secondary/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border",
                        status === "done" && "border-success/40 bg-success/10 text-success",
                        status === "active" && "border-ai/40 bg-ai/10 text-ai",
                        status === "pending" && "border-border bg-secondary text-faint",
                      )}
                    >
                      {status === "done" ? (
                        <Check className="size-3" />
                      ) : status === "active" ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <s.icon className="size-3" />
                      )}
                    </span>
                    <span className="text-[13px] font-medium text-foreground">
                      {i + 1}. {s.label}
                    </span>
                    {s.memoryTouched && (
                      <span className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-memory/30 bg-memory/10 px-1.5 text-[9px] font-semibold uppercase tracking-wide text-memory">
                        <BrainCircuit className="size-2.5" /> memory
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "ml-auto size-3.5 text-faint transition-transform",
                        expanded === i && "rotate-180",
                      )}
                    />
                  </button>
                  {expanded === i && (
                    <p className="mb-1 ml-[2.75rem] rounded-md bg-bg-secondary px-3 py-2 text-xs text-muted-foreground">
                      {s.detail}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {state === "idle" && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium text-foreground">
              AI hasn't investigated this incident yet.
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              Running a diagnosis analyzes live logs, searches Hindsight for similar
              incidents, compares historical resolutions, then generates a
              recommendation you can audit.
            </p>
          </div>
        )}

        {state === "error" && (
          <ErrorState
            title="AI diagnosis temporarily unavailable"
            body="You can still inspect logs, timelines and runbooks while the AI provider recovers."
            onRetry={run}
          />
        )}

        {state === "running" && !diagnosis && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <p className="text-center text-xs text-muted-foreground">
              Comparing historical patterns…
            </p>
          </div>
        )}

        {/* Diagnosis result */}
        <AnimatePresence>
          {state === "complete" && diagnosis && (
            <motion.div
              key="diag"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="rounded-lg border border-critical/25 bg-critical/[0.06] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-critical">
                  Most likely root cause
                </p>
                <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
                  {diagnosis.rootCause}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      diagnosis.confidenceLabel === "high" &&
                        "border-success/30 bg-success/10 text-success",
                      diagnosis.confidenceLabel === "moderate" &&
                        "border-warning/30 bg-warning/10 text-warning",
                      diagnosis.confidenceLabel === "low" &&
                        "border-faint/30 bg-faint/10 text-faint",
                    )}
                  >
                    Confidence: {diagnosis.confidenceLabel}
                  </Badge>
                  <span className="text-[10px] text-faint">demo assessment, not a validated score</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
                  Evidence
                </p>
                <ul className="mt-2 space-y-1.5">
                  {diagnosis.evidence.map((e) => (
                    <li key={e.text} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                      <span className="text-muted-foreground">{e.text}</span>
                      <span className="ml-auto shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-faint">
                        {e.origin.replace("_", " ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-memory/25 bg-memory/[0.06] p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-memory">
                  <BrainCircuit className="size-3.5" /> Historical context used
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <span className="text-muted-foreground">
                    <span className="tnum font-bold text-foreground">{diagnosis.historicalContext.incidents}</span> historical incidents
                  </span>
                  <span className="text-muted-foreground">
                    <span className="tnum font-bold text-foreground">{diagnosis.historicalContext.runbooks}</span> runbooks
                  </span>
                  <span className="text-muted-foreground">
                    <span className="tnum font-bold text-foreground">{diagnosis.historicalContext.postmortems}</span> postmortem
                  </span>
                </div>
              </div>

              {diagnosis.negativeMemoryId && (
                <div className="rounded-lg border border-critical/25 bg-critical/[0.05] p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-critical">
                    <CircleAlert className="size-3.5" /> Tried before, didn't help
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    INC-00118: restarting the service alone gave temporary relief and the
                    incident recurred within 20 minutes. The remediation list pairs the
                    restart with a pool increase instead.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-faint">
                <MessagesSquare className="size-3" />
                Every AI conclusion is explainable: recommendation → why → evidence →
                historical context → related memory.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
