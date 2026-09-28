import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit/Misc";
import { DemoBadge } from "@/components/ui-kit/Status";
import {
  memoryGrowthData,
  memoryTypeDistribution,
  resolutionTimeData,
  retrievalFreqData,
  rootCauseDistribution,
  serviceReliability,
  topPatterns,
  topRunbookUsage,
  trendData,
} from "@/data/system";
import { formatNumber } from "@/utils/format";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link, useLocation } from "react-router";

const TOOLTIP_STYLE = {
  background: "#0B1018",
  border: "1px solid #222C3A",
  borderRadius: 8,
  fontSize: 12,
  color: "#F8FAFC",
} as const;

const TABS = [
  { key: "incidents", label: "Incident Analytics", to: "/analytics/incidents" },
  { key: "resolution", label: "Resolution Analytics", to: "/analytics/resolution" },
  { key: "memory", label: "Memory Analytics", to: "/analytics/memory" },
] as const;

export default function AnalyticsPage({ tab }: { tab: "incidents" | "resolution" | "memory" }) {
  const location = useLocation();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Operational trends across incidents, resolutions and memory. All series are synthetic demo data."
      />

      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border p-1" role="tablist">
        {TABS.map((t) => (
          <Link
            key={t.key}
            to={t.to}
            role="tab"
            aria-selected={location.pathname === t.to}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              location.pathname === t.to
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
        <span className="ml-auto pr-2"><DemoBadge /></span>
      </div>

      {tab === "incidents" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Incidents over time (90d)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#1a2331" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} tickLine={false} axisLine={{ stroke: "#222C3A" }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="critical" name="Critical" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Root cause distribution">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rootCauseDistribution} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 30 }}>
                <CartesianGrid stroke="#1a2331" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {rootCauseDistribution.map((r) => (
                    <Cell key={r.name} fill={r.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Service reliability (30d uptime %, demo)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceReliability} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#1a2331" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9 }} interval={0} tickLine={false} axisLine={{ stroke: "#222C3A" }} />
                <YAxis domain={[99, 100]} tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(34,197,94,0.06)" }} />
                <Bar dataKey="uptime" name="Uptime %" fill="#22C55E" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Most common incident patterns">
            <PatternList />
          </ChartCard>
        </div>
      )}

      {tab === "resolution" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid grid-cols-3 gap-3 lg:col-span-2">
            <Stat label="Avg resolution" value="18m 42s" />
            <Stat label="MTTA" value="3m 12s" />
            <Stat label="MTTR" value="18m 42s" />
          </div>
          <ChartCard title="Average resolution time by week (minutes)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionTimeData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#1a2331" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#222C3A" }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                <Bar dataKey="minutes" name="Minutes" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Most reused runbooks">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRunbookUsage} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 30 }}>
                <CartesianGrid stroke="#1a2331" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(139,92,246,0.06)" }} />
                <Bar dataKey="uses" name="Uses" fill="#8B5CF6" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {tab === "memory" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid grid-cols-3 gap-3 lg:col-span-2">
            <Stat label="Total memories" value={formatNumber(12482)} accent="text-memory" />
            <Stat label="Retrievals (30d)" value={formatNumber(3890)} />
            <Stat label="Successful retrievals" value="94.7%" accent="text-success" />
          </div>
          <ChartCard title="Memory growth">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memoryGrowthData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid stroke="#1a2331" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#222C3A" }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} domain={["dataMin - 500", "dataMax + 500"]} />
                <ReTooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="memories" name="Memories" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Retrieval frequency by week">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retrievalFreqData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#1a2331" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#222C3A" }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(139,92,246,0.06)" }} />
                <Bar dataKey="retrievals" name="Retrievals" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Memory type distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={memoryTypeDistribution} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={3} strokeWidth={0}>
                  {memoryTypeDistribution.map((m) => (
                    <Cell key={m.name} fill={m.color} />
                  ))}
                </Pie>
                <ReTooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top retrieved incident patterns">
            <PatternList memory />
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="gap-0">
      <CardHeader className="flex-row items-center justify-between pb-0">
        <p className="text-sm font-semibold">{title}</p>
        <DemoBadge />
      </CardHeader>
      <CardContent className="h-60">{children}</CardContent>
    </Card>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card className="gap-1 rounded-lg px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">{label}</span>
      <span className={cn("tnum text-xl font-bold", accent ?? "text-foreground")}>{value}</span>
      <span className="text-[10px] text-faint">demo data</span>
    </Card>
  );
}

function PatternList({ memory }: { memory?: boolean }) {
  return (
    <ul className="space-y-2">
      {topPatterns.map((p, i) => (
        <li key={p.name} className="flex items-center gap-2 text-xs">
          <span className="tnum flex size-5 items-center justify-center rounded bg-secondary text-[10px] font-bold text-muted-foreground">
            {i + 1}
          </span>
          <span className="text-muted-foreground">{p.name}</span>
          <span className="tnum ml-auto font-semibold text-memory">{p.count}× {memory ? "retrieved" : "seen"}</span>
        </li>
      ))}
    </ul>
  );
}
