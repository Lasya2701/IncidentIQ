import { KpiCard } from "@/components/dashboard/KpiCard";
import { MemoryImpactChart, SeverityDonut, TrendChart } from "@/components/dashboard/Charts";
import { MemoryAtWorkStrip } from "@/components/memory/LearningLoop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MemoryBadge,
  SeverityBadge,
  StatusBadge,
} from "@/components/ui-kit/Status";
import { PageHeader } from "@/components/ui-kit/Misc";
import { useAsyncData } from "@/hooks/useAsyncData";
import { Link, useNavigate } from "react-router";
import { api } from "@/services";
import { useAppStore } from "@/store/useAppStore";
import { formatNumber, shortTime } from "@/utils/format";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Clock3,
  Gauge,
  Play,
  Search,
  Server,
  Siren,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

export default function Dashboard() {
  const incidentsQ = useAsyncData(() => api.getIncidents(), []);
  const userName = useAppStore((s) => s.userName);
  const navigate = useNavigate();
  const incidents = incidentsQ.data ?? [];
  const active = incidents.filter((i) => i.status !== "resolved");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${greeting}, ${userName}`}
        description="Here's what is happening across your production environment."
        actions={
          <>
            <span className="hidden items-center gap-1.5 rounded-md border border-success/25 bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success sm:inline-flex">
              Production <span className="size-1.5 rounded-full bg-success" /> Operational
            </span>
            <Button
              className="gap-1.5 bg-memory text-white hover:bg-memory/90"
              onClick={() => navigate("/workspace?demo=1")}
            >
              <Play className="size-4" /> Launch Demo
            </Button>
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Active Incidents" value="7" context="+2 from last hour" icon={Siren} accent="text-critical" />
        <KpiCard label="Critical" value="2" context="Requires attention" icon={TriangleAlert} accent="text-critical" />
        <KpiCard label="AI Diagnoses" value="34" context="Today" icon={Sparkles} accent="text-ai" />
        <KpiCard label="Memory Retrievals" value={formatNumber(1284)} context="Today" icon={BrainCircuit} accent="text-memory" />
        <KpiCard label="Similar Incidents" value="128" context="Retrieved" icon={Search} accent="text-memory" />
        <KpiCard label="Avg Resolution Time" value="18m 42s" context="Demo rolling average" icon={Clock3} accent="text-info" />
        <KpiCard label="Memory Recall Rate" value="94.7%" context="Demo metric — not a validated measure" icon={Gauge} accent="text-memory" />
        <KpiCard label="Services Monitored" value="42" context="41 healthy" icon={Server} accent="text-success" />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SeverityDonut />
        <TrendChart className="lg:col-span-2" />
      </div>

      <MemoryImpactChart />

      <MemoryAtWorkStrip />

      {/* Active incidents mini-table */}
      <Card className="gap-0 p-0">
        <CardHeader className="flex-row items-center justify-between border-b border-border/70 px-5 py-4">
          <div>
            <p className="text-sm font-semibold">Active incidents</p>
            <p className="text-xs text-muted-foreground">
              Sorted by severity — open the workspace to investigate
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/incidents">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {incidentsQ.isLoading ? (
            <div className="space-y-2 p-5">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-faint">
                    <th className="px-5 py-2 font-medium">Severity</th>
                    <th className="px-3 py-2 font-medium">Incident</th>
                    <th className="px-3 py-2 font-medium">Service</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Detected</th>
                    <th className="px-3 py-2 font-medium">Memory</th>
                  </tr>
                </thead>
                <tbody>
                  {active.slice(0, 5).map((inc) => (
                    <tr
                      key={inc.id}
                      className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-secondary/40"
                      onClick={() => navigate(`/workspace?incident=${inc.id}`)}
                    >
                      <td className="px-5 py-2.5">
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="block font-mono text-[11px] text-faint">{inc.id}</span>
                        <Link
                          to={`/workspace?incident=${inc.id}`}
                          className="font-medium text-foreground hover:text-memory"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {inc.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{inc.service}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="tnum px-3 py-2.5 font-mono text-xs text-muted-foreground">
                        {shortTime(inc.detectedAt)}
                      </td>
                      <td className="px-3 py-2.5">
                        <MemoryBadge count={inc.memoryMatches} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        <QuickLink to="/memory" icon={BrainCircuit} title="Memory overview" body="Browse everything IncidentIQ has learned." />
        <QuickLink to="/analytics/memory" icon={BarChart3} title="Memory analytics" body="Growth, retrievals and top patterns." />
        <QuickLink to="/system" icon={Activity} title="System health" body="Hindsight, sidecar and pipeline status." />
      </div>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  title,
  body,
}: {
  to: string;
  icon: typeof BrainCircuit;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-memory/40"
    >
      <Icon className="size-4 text-memory" />
      <p className="mt-2 text-sm font-semibold group-hover:text-memory">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
    </Link>
  );
}
