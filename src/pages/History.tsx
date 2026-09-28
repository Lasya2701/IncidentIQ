import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit/Misc";
import { SeverityBadge } from "@/components/ui-kit/Status";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import type { Incident } from "@/types/incident-iq";
import { formatDateShort, formatMinutes } from "@/utils/format";
import { BrainCircuit, Check, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface HistoryRow {
  id: string;
  title: string;
  service: string;
  severity: Incident["severity"];
  rootCause: string;
  resolution: string;
  durationMinutes: number;
  date: string;
  memoryAdded: boolean;
}

const HISTORY: HistoryRow[] = [
  { id: "INC-00172", title: "Payment API 503 Errors", service: "Payment API", severity: "critical", rootCause: "Database connection exhaustion", resolution: "Pool 50 → 100", durationMinutes: 11, date: "2026-06-18", memoryAdded: true },
  { id: "INC-00145", title: "Payment Service Unavailable", service: "Payment API", severity: "critical", rootCause: "Connection saturation", resolution: "Pool tuning + restart", durationMinutes: 18, date: "2026-05-02", memoryAdded: true },
  { id: "INC-00118", title: "Payment 503 storm (restart-only response)", service: "Payment API", severity: "critical", rootCause: "Database connection exhaustion", resolution: "Restart only — recurred", durationMinutes: 42, date: "2026-01-20", memoryAdded: true },
  { id: "INC-00091", title: "Payment API Timeout Spike", service: "Payment API", severity: "high", rootCause: "Pool config drift", resolution: "Pool config update", durationMinutes: 27, date: "2026-02-11", memoryAdded: true },
  { id: "INC-00088", title: "Auth latency burst", service: "Authentication Service", severity: "high", rootCause: "Verification burst vs JWKS cache", resolution: "JWKS pre-warm", durationMinutes: 22, date: "2026-07-30", memoryAdded: true },
  { id: "INC-00077", title: "Redis miss-rate wave", service: "Redis", severity: "medium", rootCause: "Synchronized TTL expiry", resolution: "TTL jitter", durationMinutes: 15, date: "2025-11-05", memoryAdded: true },
  { id: "INC-00101", title: "Order Service 5xx after rollout", service: "Order Service", severity: "high", rootCause: "Checkout regression", resolution: "Rollback", durationMinutes: 14, date: "2026-03-19", memoryAdded: true },
  { id: "INC-00058", title: "Notification worker CrashLoopBackOff", service: "Notification Service", severity: "medium", rootCause: "Missing config mount", resolution: "Config restored", durationMinutes: 12, date: "2026-01-08", memoryAdded: true },
  { id: "INC-00204", title: "Gateway upstream timeouts", service: "API Gateway", severity: "medium", rootCause: "Downstream saturation", resolution: "Retry budget lowered", durationMinutes: 19, date: "2026-08-12", memoryAdded: true },
  { id: "INC-00195", title: "Authentication slowness", service: "Authentication Service", severity: "medium", rootCause: "Campaign traffic", resolution: "Pre-warm checklist", durationMinutes: 40, date: "2026-07-31", memoryAdded: true },
];

export default function HistoryPage() {
  const liveQ = useAsyncData(() => api.getIncidents(), []);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"all" | Incident["severity"]>("all");
  const [service, setService] = useState("all");

  const rows = useMemo(() => {
    const resolvedLive: HistoryRow[] = (liveQ.data ?? [])
      .filter((i) => i.status === "resolved")
      .map((i) => ({
        id: i.id,
        title: i.title,
        service: i.service,
        severity: i.severity,
        rootCause: i.rootCause ?? "—",
        resolution: i.resolution ?? "—",
        durationMinutes: 12,
        date: i.detectedAt.slice(0, 10),
        memoryAdded: true,
      }));
    let all = [...resolvedLive, ...HISTORY];
    if (severity !== "all") all = all.filter((r) => r.severity === severity);
    if (service !== "all") all = all.filter((r) => r.service === service);
    const q = query.trim().toLowerCase();
    if (q) {
      all = all.filter((r) =>
        `${r.id} ${r.title} ${r.rootCause} ${r.service}`.toLowerCase().includes(q),
      );
    }
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [liveQ.data, query, severity, service]);

  const services = Array.from(new Set(HISTORY.map((h) => h.service)));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Incident History"
        description="Every resolved incident with its root cause and whether its knowledge was added to Hindsight."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search historical incidents…"
            aria-label="Search history"
            className="h-9 w-64 pl-8"
          />
        </div>
        <select
          aria-label="Filter by severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as typeof severity)}
          className="h-9 rounded-md border border-border bg-card px-2 text-xs capitalize text-muted-foreground"
        >
          {["all", "critical", "high", "medium", "low"].map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All severities" : s}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-2 text-xs text-muted-foreground"
        >
          <option value="all">All services</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-faint">{rows.length} records · synthetic</span>
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-faint">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-3 py-3 font-medium">Title</th>
                <th className="px-3 py-3 font-medium">Service</th>
                <th className="px-3 py-3 font-medium">Severity</th>
                <th className="px-3 py-3 font-medium">Root cause</th>
                <th className="px-3 py-3 font-medium">Resolution</th>
                <th className="px-3 py-3 font-medium">Duration</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Memory</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id + r.date} className="border-b border-border/40 transition-colors last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs text-memory">{r.id}</td>
                  <td className="px-3 py-3 font-medium">{r.title}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.service}</td>
                  <td className="px-3 py-3"><SeverityBadge severity={r.severity} /></td>
                  <td className="px-3 py-3 text-xs text-critical/90">{r.rootCause}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{r.resolution}</td>
                  <td className="tnum px-3 py-3 text-xs">{formatMinutes(r.durationMinutes)}</td>
                  <td className="tnum px-3 py-3 font-mono text-[11px] text-faint">
                    {formatDateShort(r.date)}
                  </td>
                  <td className="px-3 py-3">
                    {r.memoryAdded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-memory">
                        <BrainCircuit className="size-3.5" /> ✓ Added to Hindsight
                      </span>
                    ) : (
                      <span className="text-[11px] text-faint">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="flex items-center gap-1.5 text-[11px] text-faint">
        <Check className="size-3 text-success" />
        Negative outcomes (like INC-00118) are kept deliberately — they stop repeated mistakes.
      </p>
    </div>
  );
}
