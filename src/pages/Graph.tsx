import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit/Misc";
import { SourceBadge } from "@/components/ui-kit/Status";
import { useAppStore } from "@/store/useAppStore";
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
import { BrainCircuit, Database, GitBranch, Network, BookOpen, FileText, Siren } from "lucide-react";
import { useMemo, useState } from "react";

type GraphNodeData = {
  label: string;
  sub?: string;
  kind: "incident" | "service" | "db" | "memory" | "runbook" | "postmortem" | "concept";
  memoryId?: string;
} & Record<string, unknown>;

type IiqNode = Node<GraphNodeData, "iiq">;

function NodeShell({ data, selected }: NodeProps<IiqNode>) {
  const styles: Record<GraphNodeData["kind"], string> = {
    incident: "border-critical/50 bg-critical/10 text-critical",
    service: "border-info/40 bg-info/10 text-info",
    db: "border-warning/40 bg-warning/10 text-warning",
    memory: "border-memory/50 bg-memory/10 text-memory",
    runbook: "border-success/40 bg-success/10 text-success",
    postmortem: "border-success/40 bg-success/10 text-success",
    concept: "border-border bg-secondary text-muted-foreground",
  };
  const Icon =
    data.kind === "incident"
      ? Siren
      : data.kind === "service"
        ? Network
        : data.kind === "db"
          ? Database
          : data.kind === "memory"
            ? BrainCircuit
            : data.kind === "runbook"
              ? BookOpen
              : data.kind === "postmortem"
                ? FileText
                : GitBranch;

  return (
    <div
      className={`flex min-w-[140px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${styles[data.kind]} ${
        selected ? "ring-2 ring-memory/40" : ""
      }`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate">{data.label}</span>
        {data.sub && <span className="block truncate text-[10px] font-normal opacity-70">{data.sub}</span>}
      </span>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { iiq: NodeShell };

const DETAIL_COPY: Record<string, { title: string; body: string }> = {
  "INC-00241": {
    title: "INC-00241 — Payment API returning HTTP 503",
    body: "Current critical incident. The graph shows everything IncidentIQ knows about it: service dependencies, historical incidents, the runbook with the best track record, and the postmortem that documented the last occurrence.",
  },
  "Payment API": {
    title: "Payment API",
    body: "Service currently in CRITICAL state. Depends on PostgreSQL and Redis. 4 memories directly relevant; runbook rb-db-pool has resolved 5 of 6 past incidents on this service.",
  },
  PostgreSQL: {
    title: "PostgreSQL",
    body: "Primary database under connection pressure. Connection-pool exhaustion here has caused 3 of the 4 similar historical incidents.",
  },
  "Connection Pool": {
    title: "Connection Pool (concept)",
    body: "Recurring failure concept. Hindsight clusters incidents by this concept, which is why pool-related memories surface even across different services.",
  },
  "INC-00172": {
    title: "INC-00172 — closest historical match (92%)",
    body: "Same service, same 503 symptoms, same root cause. Resolved in 11 minutes by raising the connection pool. Full details in the memory drawer.",
  },
  "INC-00145": {
    title: "INC-00145 — match (87%)",
    body: "Connection saturation from long-running payout transactions. Pool tuning plus restart worked.",
  },
  "Database Runbook": {
    title: "Runbook: Database Connection Pool Exhaustion",
    body: "Resolved 5 of 6 incidents (demo effectiveness). The single failure was restart-only (INC-00118).",
  },
  "Payment Postmortem": {
    title: "Postmortem: June Payment Outage",
    body: "Documented root cause, preventive actions and lessons learned — indexed into Hindsight so the knowledge is retrievable, not just filed away.",
  },
};

export default function GraphPage() {
  const [selected, setSelected] = useState<string>("INC-00241");
  const openMemoryDrawer = useAppStore((s) => s.openMemoryDrawer);

  const nodes = useMemo<IiqNode[]>(
    () => [
      {
        id: "INC-00241",
        type: "iiq",
        position: { x: 250, y: 40 },
        data: { label: "INC-00241 · 503 spike", kind: "incident" },
      },
      {
        id: "Payment API",
        type: "iiq",
        position: { x: 100, y: 170 },
        data: { label: "Payment API", sub: "critical", kind: "service" },
      },
      {
        id: "PostgreSQL",
        type: "iiq",
        position: { x: 380, y: 170 },
        data: { label: "PostgreSQL", sub: "pool pressure", kind: "db" },
      },
      {
        id: "Connection Pool",
        type: "iiq",
        position: { x: 240, y: 300 },
        data: { label: "Connection Pool", sub: "concept", kind: "concept" },
      },
      {
        id: "INC-00172",
        type: "iiq",
        position: { x: 40, y: 420 },
        data: { label: "INC-00172", sub: "92% match", kind: "memory", memoryId: "M-18291" },
      },
      {
        id: "INC-00145",
        type: "iiq",
        position: { x: 250, y: 420 },
        data: { label: "INC-00145", sub: "87% match", kind: "memory", memoryId: "M-17944" },
      },
      {
        id: "Database Runbook",
        type: "iiq",
        position: { x: 450, y: 420 },
        data: { label: "DB Pool Runbook", sub: "5/6 resolved", kind: "runbook" },
      },
      {
        id: "Payment Postmortem",
        type: "iiq",
        position: { x: 640, y: 300 },
        data: { label: "June Outage Postmortem", kind: "postmortem" },
      },
    ],
    [],
  );

  const edges = useMemo<Edge[]>(
    () => [
      { id: "e1", source: "INC-00241", target: "Payment API", animated: true, style: { stroke: "#3B82F6" } },
      { id: "e2", source: "INC-00241", target: "PostgreSQL", animated: true, style: { stroke: "#F59E0B" } },
      { id: "e3", source: "Payment API", target: "Connection Pool", style: { stroke: "#2a3547" } },
      { id: "e4", source: "PostgreSQL", target: "Connection Pool", style: { stroke: "#2a3547" } },
      { id: "e5", source: "Connection Pool", target: "INC-00172", animated: true, style: { stroke: "#8B5CF6" } },
      { id: "e6", source: "Connection Pool", target: "INC-00145", style: { stroke: "#8B5CF6" } },
      { id: "e7", source: "Connection Pool", target: "Database Runbook", style: { stroke: "#22C55E" } },
      { id: "e8", source: "Payment API", target: "Payment Postmortem", style: { stroke: "#22C55E" } },
    ],
    [],
  );

  const detail = DETAIL_COPY[selected as keyof typeof DETAIL_COPY];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Knowledge Graph"
        description="How the current incident connects to services, concepts, historical memories, runbooks and postmortems. Click any node."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="h-[520px] gap-0 overflow-hidden p-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            onNodeClick={(_, node) => setSelected(node.id)}
            minZoom={0.5}
            className="bg-bg-secondary"
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#1a2331" />
            <Controls showInteractive={false} className="!border-border !bg-card" />
          </ReactFlow>
        </Card>

        <Card className="gap-0 self-start p-0">
          <CardContent className="p-5">
            {detail ? (
              <>
                <p className="text-sm font-semibold text-foreground">{detail.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {detail.body}
                </p>
                {selected === "INC-00172" && (
                  <button
                    type="button"
                    onClick={() => openMemoryDrawer("M-18291")}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-memory/30 bg-memory/10 px-2.5 py-1.5 text-xs font-medium text-memory"
                  >
                    <BrainCircuit className="size-3.5" /> Open memory M-18291
                  </button>
                )}
                {selected === "INC-00241" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <SourceBadge source="hindsight" />
                    <span className="text-[11px] text-faint">4 memories linked to this incident</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a node to see details.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
