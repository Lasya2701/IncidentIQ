import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit/Misc";
import { DemoBadge, HealthLabel, SourceBadge, SeverityBadge } from "@/components/ui-kit/Status";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import { useAppStore } from "@/store/useAppStore";
import type { Deployment, Incident, Runbook, ServiceNode } from "@/types/incident-iq";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BookOpen, Database, Globe, Network, Server } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

type SvcData = { name: string; sub: string; kind: ServiceNode["kind"] } & Record<string, unknown>;

type SvcFlowNode = Node<SvcData, "svc">;

function ServiceNodeView({ data, selected }: NodeProps<SvcFlowNode>) {
  const tint: Record<ServiceNode["kind"], string> = {
    gateway: "border-info/50 bg-info/10 text-info",
    api: "border-ai/40 bg-ai/10 text-ai",
    database: "border-warning/40 bg-warning/10 text-warning",
    cache: "border-critical/40 bg-critical/10 text-critical",
    infra: "border-border bg-secondary text-muted-foreground",
  };
  const Icon =
    data.kind === "gateway" ? Globe : data.kind === "database" ? Database : Server;
  return (
    <div
      className={`flex min-w-[150px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${tint[data.kind]} ${
        selected ? "ring-2 ring-info/40" : ""
      }`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate">{data.name}</span>
        <span className="block truncate text-[10px] font-normal opacity-70">{data.sub}</span>
      </span>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { svc: ServiceNodeView };

export default function ServicesPage() {
  const servicesQ = useAsyncData(() => api.getServices(), []);
  const incidentsQ = useAsyncData(() => api.getIncidents(), []);
  const runbooksQ = useAsyncData(() => api.getRunbooks(), []);
  const deploymentsQ = useAsyncData(() => api.getDeployments(), []);
  const memoriesQ = useAsyncData(() => api.searchMemory(" "), []);
  const openMemoryDrawer = useAppStore((s) => s.openMemoryDrawer);
  const [selectedId, setSelectedId] = useState("payment-api");

  const services = servicesQ.data ?? [];
  const selected = services.find((s) => s.id === selectedId);

  const nodes = useMemo<SvcFlowNode[]>(
    () =>
      services.map((s) => ({
        id: s.id,
        type: "svc",
        position: positions[s.id] ?? { x: 250, y: 250 },
        data: {
          name: s.name,
          sub: s.health === "healthy" ? "healthy" : s.health === "warning" ? "degraded" : "critical",
          kind: s.kind,
        },
      })),
    [services],
  );

  const edges = useMemo<Edge[]>(
    () =>
      services.flatMap((s) =>
        s.dependsOn.map((d) => ({
          id: `${d}->${s.id}`,
          source: d,
          target: s.id,
          animated: services.find((x) => x.id === s.id)?.health !== "healthy",
          style: {
            stroke:
              services.find((x) => x.id === s.id)?.health === "critical"
                ? "#EF4444"
                : services.find((x) => x.id === s.id)?.health === "warning"
                  ? "#F59E0B"
                  : "#2a3547",
          },
        })),
      ),
    [services],
  );

  useEffect(() => {
    if (!selected && services.length) setSelectedId(services[0].id);
  }, [selected, services]);

  const svcIncidents = (incidentsQ.data ?? []).filter(
    (i) => i.service === selected?.name && i.status !== "resolved",
  );
  const svcRunbooks = (runbooksQ.data ?? []).filter((r) => selected?.runbookIds.includes(r.id));
  const svcDeployments = (deploymentsQ.data ?? []).filter((d) => d.service === selected?.id);
  const svcMemories = (memoriesQ.data ?? [])
    .map((r) => r.memory)
    .filter((m) => selected?.memoryIds.includes(m.id));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Service Map"
        description="Live dependency topology with health status. Click a service to inspect its incidents, deployments and memory."
        actions={<DemoBadge />}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="h-[520px] gap-0 overflow-hidden p-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            minZoom={0.5}
            className="bg-bg-secondary"
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#1a2331" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </Card>

        <Card className="gap-0 self-start p-0">
          {selected && (
            <>
              <CardHeader className="border-b border-border/70 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Network className="size-4 text-info" />
                  <p className="text-sm font-semibold">{selected.name}</p>
                  <span className="ml-auto"><HealthLabel health={selected.health} /></span>
                </div>
                <p className="text-xs text-muted-foreground">{selected.description}</p>
              </CardHeader>
              <CardContent className="space-y-4 px-5 py-4">
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Latency <span className="tnum font-semibold text-foreground">{selected.latencyMs}ms</span></span>
                  <span>Errors <span className="tnum font-semibold text-foreground">{selected.errorRate}</span></span>
                  <span>Uptime <span className="tnum font-semibold text-foreground">{selected.uptime}</span></span>
                </div>

                <Section title={`Active incidents (${svcIncidents.length})`}>
                  {svcIncidents.length === 0 && <Empty />}
                  {svcIncidents.map((i: Incident) => (
                    <Link
                      key={i.id}
                      to={`/workspace?incident=${i.id}`}
                      className="flex items-center gap-2 rounded-md border border-border bg-bg-secondary/40 px-2.5 py-1.5 text-xs transition-colors hover:border-critical/40"
                    >
                      <SeverityBadge severity={i.severity} className="scale-90" />
                      <span className="truncate">{i.title}</span>
                    </Link>
                  ))}
                </Section>

                <Section title={`Dependencies (${selected.dependsOn.length})`}>
                  {selected.dependsOn.length === 0 && <Empty />}
                  {selected.dependsOn.map((d) => (
                    <span key={d} className="rounded-md border border-border bg-bg-secondary/40 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                      {services.find((s) => s.id === d)?.name ?? d}
                    </span>
                  ))}
                </Section>

                <Section title={`Deployments (${svcDeployments.length})`}>
                  {svcDeployments.length === 0 && <Empty />}
                  {svcDeployments.map((d: Deployment) => (
                    <div key={d.id} className="rounded-md border border-border bg-bg-secondary/40 px-2.5 py-1.5 text-xs">
                      <span className="font-mono font-semibold text-warning">{d.version}</span>
                      <span className="ml-2 text-muted-foreground">{d.deployedAtLabel}</span>
                      {d.correlatedIncidentId && (
                        <span className="mt-0.5 block text-[10px] text-warning">
                          Possible correlation: {d.correlatedIncidentId}
                        </span>
                      )}
                    </div>
                  ))}
                </Section>

                <Section title={`Memories (${svcMemories.length})`}>
                  {svcMemories.length === 0 && <Empty />}
                  {svcMemories.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => openMemoryDrawer(m.id)}
                      className="flex w-full items-center gap-2 rounded-md border border-border bg-bg-secondary/40 px-2.5 py-1.5 text-left text-xs transition-colors hover:border-memory/40"
                    >
                      <span className="font-mono font-semibold text-memory">{m.id}</span>
                      <span className="truncate">{m.title}</span>
                      <SourceBadge source={m.source} className="ml-auto scale-90" />
                    </button>
                  ))}
                </Section>

                <Section title={`Runbooks (${svcRunbooks.length})`}>
                  {svcRunbooks.length === 0 && <Empty />}
                  {svcRunbooks.map((r: Runbook) => (
                    <Link
                      key={r.id}
                      to={`/runbooks?focus=${r.id}`}
                      className="flex items-center gap-2 rounded-md border border-border bg-bg-secondary/40 px-2.5 py-1.5 text-xs transition-colors hover:border-info/40"
                    >
                      <BookOpen className="size-3.5 text-info" />
                      <span className="truncate">{r.title}</span>
                      <span className="tnum ml-auto font-semibold text-success">
                        {r.resolvedCount}/{r.attemptedCount}
                      </span>
                    </Link>
                  ))}
                </Section>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">{title}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Empty() {
  return <span className="text-xs text-faint">None</span>;
}

const positions: Record<string, { x: number; y: number }> = {
  "api-gateway": { x: 250, y: 20 },
  authentication: { x: 60, y: 160 },
  "payment-api": { x: 400, y: 160 },
  "user-db": { x: 60, y: 300 },
  postgres: { x: 400, y: 300 },
  redis: { x: 560, y: 420 },
  kubernetes: { x: 120, y: 440 },
};
