import { IncidentListPanel } from "@/components/incidents/IncidentListPanel";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { LogViewer } from "@/components/incidents/LogViewer";
import { DeploymentCorrelation } from "@/components/incidents/DeploymentCorrelation";
import { AiInvestigation, type InvestigationState } from "@/components/ai/AiInvestigation";
import { RemediationList } from "@/components/ai/RemediationList";
import { RunbookCard } from "@/components/ai/RunbookCard";
import { WhyThisPanel } from "@/components/ai/WhyThisPanel";
import { AssistantPanel } from "@/components/ai/AssistantPanel";
import { HindsightPanel } from "@/components/memory/HindsightPanel";
import { WithVsWithoutMemory } from "@/components/memory/WithVsWithoutMemory";
import { MemoryAtWorkStrip } from "@/components/memory/LearningLoop";
import { ResolveFlow } from "@/components/incidents/ResolveFlow";
import { CreateMemoryModal } from "@/components/incidents/CreateMemoryModal";
import { PostmortemEditor } from "@/components/incidents/PostmortemEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoBadge, SeverityBadge, StatusBadge } from "@/components/ui-kit/Status";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import { notify, useAppStore } from "@/store/useAppStore";
import type { Diagnosis, Incident } from "@/types/incident-iq";
import { formatDuration, formatNumber } from "@/utils/format";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CircleCheck,
  FileText,
  Search,
  Siren,
  Timer,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { DemoController } from "@/components/demo/DemoController";
import { useDemoRunner } from "@/hooks/useDemoRunner";

function useElapsed(incident: Incident | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!incident || incident.status === "resolved") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [incident]);
  if (!incident) return "—";
  const start = new Date(incident.detectedAt).getTime();
  if (incident.status === "resolved" && incident.resolvedAt) {
    return formatDuration((new Date(incident.resolvedAt).getTime() - start) / 1000);
  }
  return formatDuration((now - start) / 1000);
}

export default function Workspace() {
  const [params, setParams] = useSearchParams();
  const incidentsQ = useAsyncData(() => api.getIncidents(), []);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [investigation, setInvestigation] = useState<InvestigationState>("idle");
  const [showRemediation, setShowRemediation] = useState(false);
  const [hindsightKey, setHindsightKey] = useState(0);
  const [memoryModal, setMemoryModal] = useState(false);
  const [postmortemModal, setPostmortemModal] = useState(false);
  const [resolveFlow, setResolveFlow] = useState(false);
  const memoryCreated = useRef(false);
  const diagnosisRef = useRef<Diagnosis | undefined>(undefined);

  const incidentList = incidentsQ.data ?? [];
  const demoActive = params.get("demo") === "1";
  useDemoRunner(demoActive);
  const demoStep = useAppStore((s) => s.demo.step);
  const incident = useMemo(
    () => incidentList.find((i) => i.id === selectedId),
    [incidentList, selectedId],
  );
  const elapsed = useElapsed(incident);
  const setAiPhase = useAppStore((s) => s.setAiPhase);

  // Default selection: INC-00241 (hero), or ?incident= param.
  useEffect(() => {
    if (incidentsQ.isLoading || incidentList.length === 0) return;
    const fromParam = params.get("incident");
    if (fromParam && incidentList.some((i) => i.id === fromParam)) {
      setSelectedId(fromParam);
    } else if (!selectedId) {
      const hero = incidentList.find((i) => i.severity === "critical") ?? incidentList[0];
      setSelectedId(hero.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentsQ.isLoading, incidentList.length]);

  const timelineQ = useAsyncData(
    () => (selectedId ? api.getTimeline(selectedId) : Promise.resolve([])),
    [selectedId],
  );
  const logsQ = useAsyncData(
    () => (selectedId ? api.getLogs(selectedId) : Promise.resolve([])),
    [selectedId],
  );

  // Demo mode: drive the workspace panels from the scripted state machine.
  useEffect(() => {
    if (!demoActive) return;
    if (demoStep >= 2 && demoStep < 4 && investigation !== "running") {
      setInvestigation("running");
    }
    if (demoStep >= 4 && investigation === "running") {
      // Diagnosis completes as the hindsight search begins (step 4+).
      setInvestigation("complete");
      setShowRemediation(demoStep >= 9);
    }
    if (demoStep >= 9 && !showRemediation) setShowRemediation(true);
    if (demoStep === 10 && !resolveFlow) {
      // Auto-driven but real UI: open the resolve confirmation.
      setResolveFlow(true);
    }
    if (demoStep === 14) {
      // The follow-up incident appears: switch the workspace to it so judges
      // see the freshly created memory retrieved as its top match.
      void api.getIncidents().then((list) => {
        if (list.some((i) => i.id === "INC-00243")) {
          setSelectedId("INC-00243");
          setInvestigation("complete");
          setShowRemediation(false);
          setHindsightKey((k) => k + 1);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoActive, demoStep]);

  // Landing on the workspace with ?demo=1 launches the scripted run.
  useEffect(() => {
    if (demoActive && useAppStore.getState().demo.status === "idle") {
      useAppStore.getState().demoStart();
    }
  }, [demoActive]);

  const selectIncident = (id: string) => {
    setSelectedId(id);
    setInvestigation("idle");
    setShowRemediation(false);
    setHindsightKey((k) => k + 1);
    // Preserve demo mode across incident switches.
    const next = new URLSearchParams(params);
    next.set("incident", id);
    setParams(next, { replace: true });
  };

  const onDiagnosed = (d: Diagnosis) => {
    diagnosisRef.current = d;
    setShowRemediation(true);
    setAiPhase(selectedId ?? "", "diagnosed");
    if (!demoActive) {
      toast.success("Diagnosis completed", {
        description: "Root cause identified with historical context.",
      });
    }
    // Auto-trigger hindsight animation is handled by key remount of HindsightPanel run.
  };

  const onResolved = () => {
    // In demo mode the script creates the memory itself (step 12), so skip the
    // manual modal; the real flow stays available outside the demo.
    if (!demoActive) setMemoryModal(true);
    notify("memory", "Incident resolved", `${selectedId} marked resolved.`);
    // Completing the real resolve flow releases the script hold and advances
    // from "Resolve Incident" to "Incident resolved".
    if (demoActive) {
      useAppStore.getState().demoAdvance();
      useAppStore.getState().demoSetHold(false);
    }
  };

  const statusFromPhase = (): Incident["status"] => {
    if (incident?.status === "resolved") return "resolved";
    if (investigation === "running") return "ai_diagnosing";
    return incident?.status ?? "investigating";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/incidents"
          className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Back to incidents"
        >
          <ArrowLeft className="size-4" />
        </Link>
        {incident ? (
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Siren className="size-4 text-critical" />
              <span className="font-mono text-sm font-semibold text-muted-foreground">
                {incident.id}
              </span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={statusFromPhase()} />
              <DemoBadge />
            </div>
            <h1 className="mt-1 truncate text-xl font-bold tracking-tight">{incident.title}</h1>
          </div>
        ) : (
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-96" />
          </div>
        )}
      </div>

      {/* Action buttons */}
      {incident && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 bg-ai text-white hover:bg-ai/90"
            onClick={() => {
              setHindsightKey((k) => k + 1);
              setInvestigation("running");
              document.getElementById("ai-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            disabled={investigation === "running"}
          >
            <BrainCircuit className="size-4" /> Run AI Diagnosis
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-memory/40 text-memory hover:bg-memory/10"
            onClick={() => {
              setHindsightKey((k) => k + 1);
              document.getElementById("hindsight-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <Search className="size-4" /> Find Similar Incidents
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to={`/runbooks?focus=rb-db-pool`}>
              <BookOpen className="size-4" /> Open Runbook
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={incident.status === "resolved"}
            onClick={() => {
              if (incident) {
                notify("ai", "Incident acknowledged", `${incident.id} acknowledged by you.`);
                toast("Incident acknowledged");
              }
            }}
          >
            Acknowledge
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-success/40 text-success hover:bg-success/10"
            disabled={incident.status === "resolved"}
            onClick={() => setResolveFlow(true)}
          >
            <CircleCheck className="size-4" /> Resolve Incident
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPostmortemModal(true)}
          >
            <FileText className="size-4" /> Create Postmortem
          </Button>
        </div>
      )}

      {/* Summary cards */}
      {incident && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <SummaryCell label="Service" value={incident.service} />
          <SummaryCell label="Severity" value={incident.severity} valueClass="capitalize" />
          <SummaryCell label="Duration" value={elapsed} valueClass="tnum" />
          <SummaryCell
            label="Affected users"
            value={incident.affectedUsers !== undefined ? `~${formatNumber(incident.affectedUsers)}` : "—"}
            valueClass="tnum"
          />
          <SummaryCell
            label="First detected"
            value={new Date(incident.detectedAt).toLocaleTimeString("en-US", { hour12: false })}
            valueClass="tnum font-mono"
          />
          <SummaryCell
            label="Status"
            value={statusFromPhase().replace("_", " ")}
            valueClass="capitalize"
          />
        </div>
      )}

      <MemoryAtWorkStrip className="hidden lg:flex" />

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Incident list */}
        <div className="max-xl:order-2">
          {incidentsQ.isLoading ? (
            <Card className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </Card>
          ) : (
            <IncidentListPanel
              incidents={incidentList}
              selectedId={selectedId}
              onSelect={selectIncident}
              className="xl:sticky xl:top-20"
            />
          )}
        </div>

        {/* Main investigation area */}
        <div className="space-y-4">
          {incident && (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Timeline */}
                <Card className="gap-0 p-0">
                  <div className="border-b border-border/70 px-5 py-3.5">
                    <h2 className="flex items-center gap-2 text-sm font-semibold">
                      <Timer className="size-4 text-faint" /> Live timeline
                    </h2>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto p-5">
                    <IncidentTimeline events={timelineQ.data ?? []} />
                  </div>
                </Card>

                {/* Logs */}
                <div className="min-h-[380px]">
                  {logsQ.data && (
                    <LogViewer lines={logsQ.data} incidentId={incident.id} className="h-full min-h-[380px]" />
                  )}
                </div>
              </div>

              {/* AI + Hindsight row */}
              <div id="ai-panel" className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <AiInvestigation
                    incidentId={incident.id}
                    state={investigation}
                    onStateChange={setInvestigation}
                    onDiagnosed={onDiagnosed}
                  />
                  <WhyThisPanel />
                </div>
                <div id="hindsight-panel">
                  <HindsightPanel
                    key={hindsightKey}
                    incidentId={incident.id}
                    stage={
                      demoActive && demoStep >= 4 && demoStep < 6
                        ? demoStep === 4
                          ? "searching"
                          : "relevant"
                        : undefined
                    }
                  />
                </div>
              </div>

              <RemediationList
                incidentId={incident.id}
                visible={showRemediation}
                medianResolutionMinutes={incident.medianResolutionMinutes}
              />

              <RunbookCard runbookId="rb-db-pool" />

              <WithVsWithoutMemory />

              <DeploymentCorrelation incident={incident} />
            </>
          )}
        </div>
      </div>

      <AssistantPanel incidentId={selectedId ?? "INC-00241"} />
      {demoActive && <DemoController />}

      {/* Flows */}
      {incident && (
        <>
          <ResolveFlow
            open={resolveFlow}
            onClose={() => setResolveFlow(false)}
            incident={incident}
            autoConfirm={demoActive}
            onResolved={() => {
              setResolveFlow(false);
              onResolved();
            }}
          />
          <CreateMemoryModal
            open={memoryModal}
            onClose={() => setMemoryModal(false)}
            incident={incident}
            onSaved={() => {
              memoryCreated.current = true;
            }}
          />
          <PostmortemEditor
            open={postmortemModal}
            onClose={() => setPostmortemModal(false)}
            incident={incident}
          />
        </>
      )}
    </div>
  );
}

function SummaryCell({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <Card className="gap-1 rounded-lg px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">{label}</span>
      <span className={`truncate text-sm font-bold text-foreground ${valueClass ?? ""}`}>
        {value}
      </span>
    </Card>
  );
}
