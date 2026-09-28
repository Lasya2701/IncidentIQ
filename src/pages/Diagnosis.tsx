import { AiInvestigation, type InvestigationState } from "@/components/ai/AiInvestigation";
import { RemediationList } from "@/components/ai/RemediationList";
import { WhyThisPanel } from "@/components/ai/WhyThisPanel";
import { WithVsWithoutMemory } from "@/components/memory/WithVsWithoutMemory";
import { HindsightPanel } from "@/components/memory/HindsightPanel";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui-kit/Misc";
import { SeverityBadge } from "@/components/ui-kit/Status";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import type { Incident } from "@/types/incident-iq";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSearchParams } from "react-router";

export default function DiagnosisPage() {
  const [params, setParams] = useSearchParams();
  const { data } = useAsyncData(() => api.getIncidents(), []);
  const [state, setState] = useState<InvestigationState>("idle");
  const [runKey, setRunKey] = useState(0);

  const incidents = (data ?? []).filter((i) => i.status !== "resolved");
  const selectedId = params.get("incident") ?? incidents[0]?.id ?? "INC-00241";
  const selected: Incident | undefined = incidents.find((i) => i.id === selectedId);

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Diagnosis"
        description="Run a memory-aware investigation against any active incident. Reasoning steps are expandable and every conclusion cites its evidence."
      />

      <div className="flex flex-wrap gap-1.5">
        {incidents.map((inc) => (
          <button
            key={inc.id}
            type="button"
            onClick={() => {
              setParams({ incident: inc.id });
              setState("idle");
              setRunKey((k) => k + 1);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
              inc.id === selectedId
                ? "border-ai/40 bg-ai/10 text-ai"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <SeverityBadge severity={inc.severity} className="scale-90" />
            {inc.id}
          </button>
        ))}
      </div>

      {selected && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <AiInvestigation
              key={runKey}
              incidentId={selected.id}
              state={state}
              onStateChange={setState}
            />
            <WhyThisPanel />
          </div>
          <div className="space-y-4">
            <HindsightPanel incidentId={selected.id} compact />
          </div>
        </div>
      )}

      {selected && (
        <>
          <RemediationList
            incidentId={selected.id}
            visible={state === "complete"}
            medianResolutionMinutes={selected.medianResolutionMinutes}
          />
          <WithVsWithoutMemory />
        </>
      )}

      {!selected && (
        <Button onClick={() => setState("running")} disabled={state === "running"}>
          Run diagnosis
        </Button>
      )}
    </div>
  );
}
