import { LearningLoop } from "@/components/memory/LearningLoop";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit/Misc";
import { DemoBadge, SourceBadge } from "@/components/ui-kit/Status";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/services";
import type { MemoryRecord, MemoryType } from "@/types/incident-iq";
import { formatDate, formatNumber } from "@/utils/format";
import { cn } from "@/lib/utils";
import { BrainCircuit, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const TABS: { key: "all" | MemoryType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "incident_resolution", label: "Incidents" },
  { key: "runbook", label: "Runbooks" },
  { key: "postmortem", label: "Postmortems" },
  { key: "pattern", label: "Patterns" },
  { key: "decision", label: "Decisions" },
];

const TIERS = [
  {
    key: "hot" as const,
    name: "HOT",
    desc: "Current context",
    items: ["Current incident", "Live logs", "Current investigation"],
    tint: "border-critical/30",
    text: "text-critical",
  },
  {
    key: "warm" as const,
    name: "WARM",
    desc: "Recent operational memory",
    items: ["Recent incidents", "Recent deployments", "Recent fixes"],
    tint: "border-warning/30",
    text: "text-warning",
  },
  {
    key: "cold" as const,
    name: "COLD",
    desc: "Historical memory",
    items: ["Older incidents", "Past resolutions", "Historical patterns"],
    tint: "border-info/30",
    text: "text-info",
  },
  {
    key: "curated" as const,
    name: "CURATED",
    desc: "Trusted knowledge",
    items: ["Runbooks", "Postmortems", "Architecture documentation"],
    tint: "border-memory/30",
    text: "text-memory",
  },
];

export default function MemoryPage() {
  const { data, isLoading } = useAsyncData(() => api.searchMemory(" "), []);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const openMemoryDrawer = useAppStore((s) => s.openMemoryDrawer);
  const metrics = useAppStore((s) => s.metrics);

  const memories = data ?? [];
  const filtered = memories.filter((m) => tab === "all" || m.type === tab);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Memory Overview"
        description="Everything IncidentIQ has learned from your infrastructure."
        actions={
          <Button asChild className="gap-1.5 bg-memory text-white hover:bg-memory/90">
            <Link to="/memory/search">
              <Search className="size-4" /> Search memory
            </Link>
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric label="Total memories" value={formatNumber(metrics.memoriesTotal)} accent="text-memory" />
        <Metric label="Incident memories" value={formatNumber(1842)} />
        <Metric label="Runbooks indexed" value="86" />
        <Metric label="Postmortems" value="324" />
        <Metric label="Retrievals" value={formatNumber(18291)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DemoBadge />
        <span className="text-[11px] text-faint">
          Counts are synthetic demo values · new memories this session:{" "}
          <span className="font-semibold text-memory">{metrics.newMemoriesThisSession}</span>
        </span>
      </div>

      {/* Tiers */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TIERS.map((t) => (
          <Card key={t.key} className={cn("border", t.tint)}>
            <CardContent className="p-4">
              <p className={cn("text-xs font-bold tracking-widest", t.text)}>{t.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
              <ul className="mt-3 space-y-1">
                {t.items.map((i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <span className={cn("size-1 rounded-full", t.text.replace("text-", "bg-"))} />
                    {i}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning loop */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-center text-lg font-bold tracking-tight">The Learning Loop</h2>
          <p className="mx-auto mt-1 max-w-md text-center text-xs text-muted-foreground">
            Incident → Memory → Learning → Better response
          </p>
          <LearningLoop variant="hero" className="mt-5" />
        </CardContent>
      </Card>

      {/* Memory list */}
      <Card className="gap-0 p-0">
        <div className="flex flex-wrap items-center gap-1 border-b border-border px-4 py-2.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                tab === t.key
                  ? "bg-memory/15 text-memory"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="divide-y divide-border/50">
          {isLoading && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Loading memory…
            </p>
          )}
          {filtered.map((m) => (
            <MemoryRow key={m.id} memory={m} onOpen={() => openMemoryDrawer(m.id)} />
          ))}
          {!isLoading && filtered.length === 0 && (
            <div className="px-4 py-12 text-center">
              <BrainCircuit className="mx-auto size-6 text-faint" />
              <p className="mt-2 text-sm font-medium">No memories in this category yet</p>
              <p className="text-xs text-muted-foreground">
                Resolve your first incident to start building operational memory.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card className="gap-1 rounded-lg px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">{label}</span>
      <span className={cn("tnum text-xl font-bold", accent ?? "text-foreground")}>{value}</span>
    </Card>
  );
}

function MemoryRow({ memory, onOpen }: { memory: MemoryRecord; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
    >
      <span className="font-mono text-[11px] font-semibold text-memory">{memory.id}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{memory.title}</span>
      <SourceBadge source={memory.source} />
      <span className="hidden text-xs text-muted-foreground sm:block">{memory.service}</span>
      <span className="hidden w-24 text-right text-[11px] text-faint md:block">
        {formatDate(memory.createdAt)}
      </span>
      {typeof memory.relevance === "number" && (
        <span className="tnum w-16 text-right text-xs font-semibold text-memory">
          {memory.relevance}%
        </span>
      )}
    </button>
  );
}
