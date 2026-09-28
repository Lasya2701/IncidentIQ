import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit/Misc";
import { HealthLabel, SourceBadge } from "@/components/ui-kit/Status";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import { useAppStore } from "@/store/useAppStore";
import type { Postmortem, Runbook, ServiceNode } from "@/types/incident-iq";
import { cn } from "@/lib/utils";
import { BookOpen, BrainCircuit, FileText } from "lucide-react";
import { useState } from "react";

export default function ServiceKnowledgePage() {
  const servicesQ = useAsyncData(() => api.getServices(), []);
  const runbooksQ = useAsyncData(() => api.getRunbooks(), []);
  const pmsQ = useAsyncData(() => api.getPostmortems(), []);
  const memoriesQ = useAsyncData(() => api.searchMemory(" "), []);
  const [selectedId, setSelectedId] = useState("payment-api");
  const openMemoryDrawer = useAppStore((s) => s.openMemoryDrawer);

  const services = servicesQ.data ?? [];
  const selected = services.find((s) => s.id === selectedId);
  const runbooks = (runbooksQ.data ?? []).filter((r) => selected?.runbookIds.includes(r.id));
  const pms = (pmsQ.data ?? []).filter((p) => selected?.postmortemIds.includes(p.id));
  const memories = (memoriesQ.data ?? [])
    .map((r) => r.memory)
    .filter((m) => selected?.memoryIds.includes(m.id));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Service Knowledge"
        description="What IncidentIQ knows about each service — its memories, runbooks and postmortems in one place."
      />

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Card className="gap-0 self-start p-0">
          <CardHeader className="border-b border-border/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Services
            </p>
          </CardHeader>
          <ul className="divide-y divide-border/50">
            {services.map((s: ServiceNode) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  aria-pressed={selectedId === s.id}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors",
                    selectedId === s.id ? "bg-secondary" : "hover:bg-secondary/40",
                  )}
                >
                  <span className={cn("truncate", selectedId === s.id && "font-semibold")}>
                    {s.name}
                  </span>
                  <HealthLabel health={s.health} />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-4">
          {selected && (
            <>
              <Card>
                <CardHeader>
                  <p className="text-sm font-semibold">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.description}</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Latency: <span className="tnum font-semibold text-foreground">{selected.latencyMs}ms</span></span>
                  <span>Error rate: <span className="tnum font-semibold text-foreground">{selected.errorRate}</span></span>
                  <span>Uptime: <span className="tnum font-semibold text-foreground">{selected.uptime}</span></span>
                  <span>
                    Dependencies:{" "}
                    <span className="text-foreground">
                      {selected.dependsOn.length ? selected.dependsOn.join(", ") : "none"}
                    </span>
                  </span>
                </CardContent>
              </Card>

              <KnowledgeSection
                icon={<BrainCircuit className="size-4 text-memory" />}
                title={`Memories (${memories.length})`}
              >
                {memories.length === 0 && <Empty text="No memories for this service yet." />}
                {memories.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => openMemoryDrawer(m.id)}
                    className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-border bg-bg-secondary/40 px-3 py-2 text-left text-xs transition-colors hover:border-memory/40"
                  >
                    <span className="font-mono font-semibold text-memory">{m.id}</span>
                    <span className="truncate">{m.title}</span>
                    <SourceBadge source={m.source} className="ml-auto scale-90" />
                  </button>
                ))}
              </KnowledgeSection>

              <KnowledgeSection
                icon={<BookOpen className="size-4 text-info" />}
                title={`Runbooks (${runbooks.length})`}
              >
                {runbooks.length === 0 && <Empty text="No runbooks linked to this service." />}
                {runbooks.map((r: Runbook) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-bg-secondary/40 px-3 py-2 text-xs"
                  >
                    <span className="font-medium">{r.title}</span>
                    <span className="tnum ml-auto font-semibold text-success">
                      Resolved {r.resolvedCount}/{r.attemptedCount}
                    </span>
                  </div>
                ))}
              </KnowledgeSection>

              <KnowledgeSection
                icon={<FileText className="size-4 text-success" />}
                title={`Postmortems (${pms.length})`}
              >
                {pms.length === 0 && <Empty text="No postmortems for this service." />}
                {pms.map((p: Postmortem) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-border bg-bg-secondary/40 px-3 py-2 text-xs"
                  >
                    <p className="font-medium">{p.title}</p>
                    <p className="mt-0.5 text-muted-foreground">{p.rootCause}</p>
                  </div>
                ))}
              </KnowledgeSection>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function KnowledgeSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 p-0">
      <CardHeader className="flex-row items-center gap-2 border-b border-border/70 px-4 py-3">
        {icon}
        <p className="text-sm font-semibold">{title}</p>
      </CardHeader>
      <CardContent className="space-y-2 p-4">{children}</CardContent>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs text-faint">{text}</p>;
}
