import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader, FlowDiagram } from "@/components/ui-kit/Misc";
import { DemoBadge, StatDot } from "@/components/ui-kit/Status";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import { pipelineStages } from "@/data/system";
import type { PipelineStage, SystemComponentStatus, SystemHealthEntry } from "@/types/incident-iq";
import { ArrowRight, BrainCircuit, CircleCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<SystemComponentStatus, "healthy" | "warning" | "critical"> = {
  connected: "healthy",
  degraded: "warning",
  down: "critical",
};

export default function SystemHealthPage() {
  const { data, isLoading } = useAsyncData(() => api.getSystemHealth(), []);
  const entries = data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="System Health"
        description="Status of the memory architecture components behind IncidentIQ."
        actions={<DemoBadge />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Checking components…</p>}
        {entries.map((h) => (
          <HealthRow key={h.id} entry={h} />
        ))}
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader className="pb-0">
          <p className="text-sm font-semibold">Memory pipeline</p>
          <p className="text-xs text-muted-foreground">
            Per-stage health of how operational knowledge flows into Hindsight.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-stretch gap-1.5">
            {pipelineStages.map((s, i) => (
              <span key={s.id} className="flex items-center gap-1.5">
                <StageCard stage={s} />
                {i < pipelineStages.length - 1 && <ArrowRight className="size-3 text-faint" />}
              </span>
            ))}
          </div>
          <FlowDiagram
            steps={["Session", "Archive", "Extract", "Index", "Hindsight", "Retrieve", "Context injection", "AI agent"]}
            className="text-[10px]"
          />
        </CardContent>
      </Card>

      {/* Architecture */}
      <Card className="border-memory/25">
        <CardHeader className="pb-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <BrainCircuit className="size-4 text-memory" /> Intended production architecture
          </p>
          <p className="text-xs text-muted-foreground">
            The frontend never talks to Hindsight directly — this is the seam the
            HindsightHttpProvider will implement.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border bg-bg-secondary/50 p-4">
            {["Frontend", "Backend API", "Memory Sidecar", "Hindsight (retain / recall / reflect)", "gbrain", "PostgreSQL"].map(
              (step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs font-medium",
                      step.startsWith("Hindsight")
                        ? "border-memory/40 bg-memory/10 text-memory"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {step}
                  </span>
                  {i < arr.length - 1 && <ArrowRight className="size-3.5 text-faint" />}
                </span>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HealthRow({ entry }: { entry: SystemHealthEntry }) {
  const health = STATUS_DOT[entry.status];
  return (
    <Card className="gap-2 rounded-lg px-4 py-3.5">
      <div className="flex items-center gap-2">
        <StatDot health={health} />
        <p className="text-sm font-semibold">{entry.name}</p>
        <span
          className={cn(
            "ml-auto rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
            entry.status === "connected" && "border-success/30 bg-success/10 text-success",
            entry.status === "degraded" && "border-warning/30 bg-warning/10 text-warning",
            entry.status === "down" && "border-critical/30 bg-critical/10 text-critical",
          )}
        >
          {entry.status}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">{entry.role}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-faint">
        <span>Latency: <span className="tnum font-semibold text-muted-foreground">{entry.latencyMs}ms</span></span>
        <span>Last checked: {entry.lastChecked}</span>
        <span>v{entry.version}</span>
      </div>
    </Card>
  );
}

function StageCard({ stage }: { stage: PipelineStage }) {
  return (
    <span
      className={cn(
        "min-w-[104px] rounded-lg border px-2.5 py-2",
        stage.status === "connected" && "border-border bg-card",
        stage.status === "degraded" && "border-warning/40 bg-warning/5",
        stage.status === "down" && "border-critical/40 bg-critical/5",
      )}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
        {stage.status === "connected" ? (
          <CircleCheck className="size-3 text-success" />
        ) : (
          <TriangleAlert className="size-3 text-warning" />
        )}
        {stage.name}
      </span>
      <span className="tnum mt-0.5 block text-[10px] text-faint">
        {stage.latencyMs}ms · {stage.errors24h} err/24h
      </span>
    </span>
  );
}
