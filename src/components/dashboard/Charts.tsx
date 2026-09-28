import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DemoBadge } from "@/components/ui-kit/Status";
import { memoryImpactCompare, severityDistribution, trendData } from "@/data/system";
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
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Severity donut                                                      */
/* ------------------------------------------------------------------ */

export function SeverityDonut({ className }: { className?: string }) {
  const total = severityDistribution.reduce((a, s) => a + s.value, 0);
  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader className="flex-row items-center justify-between pb-0">
        <div>
          <p className="text-sm font-semibold">Severity distribution</p>
          <p className="text-xs text-muted-foreground">Active incidents by severity</p>
        </div>
        <DemoBadge />
      </CardHeader>
      <CardContent>
        <div className="relative h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="85%"
                paddingAngle={3}
                strokeWidth={0}
              >
                {severityDistribution.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <ReTooltip
                contentStyle={{
                  background: "#0B1018",
                  border: "1px solid #222C3A",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#F8FAFC",
                }}
                formatter={(value, name) => [
                  `${value} incidents (${Math.round((Number(value) / total) * 100)}%)`,
                  name as string,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="tnum text-3xl font-bold">{total}</span>
            <span className="text-[10px] uppercase tracking-wider text-faint">incidents</span>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {severityDistribution.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs">
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              <span className="text-muted-foreground">{s.name}</span>
              <span className="tnum ml-auto font-semibold text-foreground">{s.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Trend line                                                          */
/* ------------------------------------------------------------------ */

export function TrendChart({ className }: { className?: string }) {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const data = useMemo(() => trendData.slice(-range), [range]);

  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 pb-0">
        <div>
          <p className="text-sm font-semibold">Incident trend</p>
          <p className="text-xs text-muted-foreground">
            Total, resolved and critical incidents per day
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge />
          <div className="flex rounded-md border border-border p-0.5" role="group" aria-label="Range">
            {([7, 30, 90] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={cn(
                  "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                  range === r
                    ? "bg-secondary text-foreground"
                    : "text-faint hover:text-muted-foreground",
                )}
              >
                {r}D
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="#1a2331" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 10 }}
                tickFormatter={(d: string) => d.slice(5)}
                tickLine={false}
                axisLine={{ stroke: "#222C3A" }}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
              <ReTooltip
                contentStyle={{
                  background: "#0B1018",
                  border: "1px solid #222C3A",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#F8FAFC",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                iconType="plainline"
                iconSize={14}
              />
              <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#22C55E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="critical" name="Critical" stroke="#EF4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Memory impact comparison                                            */
/* ------------------------------------------------------------------ */

export function MemoryImpactChart({ className }: { className?: string }) {
  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 pb-0">
        <div>
          <p className="text-sm font-semibold">Impact of persistent memory</p>
          <p className="text-xs text-muted-foreground">
            Simulated comparison — demo data, not measured results
          </p>
        </div>
        <DemoBadge />
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memoryImpactCompare} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="#1a2331" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#222C3A" }}
                interval={0}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
              <ReTooltip
                cursor={{ fill: "rgba(139,92,246,0.06)" }}
                contentStyle={{
                  background: "#0B1018",
                  border: "1px solid #222C3A",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#F8FAFC",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} iconType="circle" iconSize={8} />
              <Bar dataKey="without" name="Without memory" fill="#3f4a5c" radius={[3, 3, 0, 0]} />
              <Bar dataKey="with" name="With Hindsight memory" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-center text-[10px] text-faint">
          Relevant context retrieved: {formatNumber(4)} memories · diagnostic steps reused: 5 ·
          synthetic values
        </p>
      </CardContent>
    </Card>
  );
}
