import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { RunbookOutcomeBadge } from "@/components/ui-kit/Status";
import { api } from "@/services";
import type { RemediationStep } from "@/types/incident-iq";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Eye,
  Sparkles,
  Timer,
} from "lucide-react";
import { useState } from "react";

export function RemediationList({
  incidentId,
  visible,
  medianResolutionMinutes = 18.7,
}: {
  incidentId: string;
  visible: boolean;
  medianResolutionMinutes?: number;
}) {
  const { data, isLoading } = useAsyncData(
    () => api.getRemediation(incidentId),
    [incidentId],
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [evidenceOpen, setEvidenceOpen] = useState<string | undefined>(undefined);
  const openMemoryDrawer = useAppStore((s) => s.openMemoryDrawer);
  const steps = data ?? [];

  if (!visible) return null;

  return (
    <Card className="hairline-top gap-0 p-0">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 border-b border-border/70 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Recommended Remediation</h2>
          <p className="text-xs text-muted-foreground">
            Ordered by historical success. Each step cites where it came from.
          </p>
        </div>
        <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
          <Timer className="size-3.5" />
          Est. time saved: ~12 min vs. median {Math.round(medianResolutionMinutes)}m (demo)
        </Badge>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        )}
        <ol className="space-y-2">
          {steps.map((step, i) => {
            const done = checked[step.id];
            const isNegative = step.historicalOutcome === "failed";
            return (
              <li
                key={step.id}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  done
                    ? "border-success/30 bg-success/[0.05]"
                    : isNegative
                      ? "border-critical/20 bg-critical/[0.04]"
                      : "border-border bg-bg-secondary/40",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "tnum flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                      done ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5">
                    <Checkbox
                      checked={done}
                      onCheckedChange={() => setChecked((c) => ({ ...c, [step.id]: !c[step.id] }))}
                      aria-label={`Mark step ${i + 1} complete`}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-sm font-semibold text-foreground",
                          done && "line-through opacity-60",
                        )}
                      >
                        {step.action}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{step.why}</span>
                      {step.command && (
                        <code className="mt-1.5 block overflow-x-auto rounded border border-border/70 bg-[#0a0f16] px-2 py-1 font-mono text-[10px] text-info">
                          $ {step.command}
                        </code>
                      )}
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <SourceChip step={step} />
                        {step.incidentRef && (
                          <button
                            type="button"
                            onClick={() => openMemoryDrawer("M-18291")}
                            className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-memory transition-colors hover:border-memory/40"
                          >
                            {step.incidentRef}
                          </button>
                        )}
                        {step.runbookRef && (
                          <span className="inline-flex items-center gap-1 rounded border border-info/25 bg-info/10 px-1.5 py-0.5 text-[10px] text-info">
                            <BookOpen className="size-3" /> Runbook
                          </span>
                        )}
                        {step.historicalOutcome && (
                          <RunbookOutcomeBadge result={step.historicalOutcome} />
                        )}
                      </span>
                    </span>
                  </label>
                  <button
                    type="button"
                    aria-label="Toggle evidence"
                    onClick={() => setEvidenceOpen(evidenceOpen === step.id ? undefined : step.id)}
                    className="rounded p-1 text-faint transition-colors hover:text-foreground"
                  >
                    <ChevronDown
                      className={cn("size-4 transition-transform", evidenceOpen === step.id && "rotate-180")}
                    />
                  </button>
                </div>
                {evidenceOpen === step.id && (
                  <div className="mt-2 ml-9 rounded-md border border-border/70 bg-card p-3 text-xs">
                    <p className="font-semibold text-foreground">Recommended because</p>
                    <p className="mt-1 text-muted-foreground">
                      Historical incidents resolved with this action:
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {["INC-00172", "INC-00145", "INC-00091"].map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => openMemoryDrawer("M-18291")}
                          className="inline-flex items-center gap-1 rounded border border-memory/30 bg-memory/10 px-1.5 py-0.5 font-mono text-[10px] text-memory"
                        >
                          <Eye className="size-2.5" /> {id}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-[11px] text-memory"
                      onClick={() => openMemoryDrawer("M-18291")}
                    >
                      View evidence →
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-faint">
          <Sparkles className="size-3 text-ai" />
          Time-saved estimate is a synthetic demo value relative to the incident's
          historical median resolution time.
        </p>
      </CardContent>
    </Card>
  );
}

function SourceChip({ step }: { step: RemediationStep }) {
  if (step.source === "hindsight") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-memory/30 bg-memory/10 px-1.5 py-0.5 text-[10px] font-medium text-memory">
        <BrainCircuit className="size-3" /> Hindsight
      </span>
    );
  }
  if (step.source === "runbook") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-info/25 bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info">
        <BookOpen className="size-3" /> Runbook
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-ai/25 bg-ai/10 px-1.5 py-0.5 text-[10px] font-medium text-ai">
      <Sparkles className="size-3" /> AI
    </span>
  );
}
