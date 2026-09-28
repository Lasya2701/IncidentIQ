import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MemoryBadge,
  SeverityBadge,
  StatusBadge,
} from "@/components/ui-kit/Status";
import { PageHeader } from "@/components/ui-kit/Misc";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import { notify } from "@/store/useAppStore";
import type { Incident, Severity } from "@/types/incident-iq";
import { formatNumber, shortTime, titleCase } from "@/utils/format";
import {
  ArrowUpDown,
  BookOpen,
  BrainCircuit,
  CircleCheck,
  Eye,
  Hand,
  MoreHorizontal,
  Search,
  Siren,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

type SortKey = "severity" | "detectedAt" | "memoryMatches";
const SEV_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export default function IncidentsPage() {
  const { data, isLoading } = useAsyncData(() => api.getIncidents(), []);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"all" | Severity>("all");
  const [sortKey, setSortKey] = useState<SortKey>("severity");
  const [asc, setAsc] = useState(true);
  const navigate = useNavigate();

  const incidents = useMemo(() => {
    let list = (data ?? []).filter((i) => i.status !== "resolved");
    if (severity !== "all") list = list.filter((i) => i.severity === severity);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((i) =>
        `${i.id} ${i.title} ${i.service} ${i.assignee}`.toLowerCase().includes(q),
      );
    }
    const dir = asc ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === "severity") return (SEV_ORDER[a.severity] - SEV_ORDER[b.severity]) * dir;
      if (sortKey === "memoryMatches") return (a.memoryMatches - b.memoryMatches) * dir;
      return (
        (new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime()) * dir
      );
    });
  }, [data, query, severity, sortKey, asc]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setAsc((a) => !a);
    else {
      setSortKey(k);
      setAsc(true);
    }
  };

  const act = (inc: Incident, action: string) => {
    notify("ai", action, `${inc.id} — ${action} recorded.`);
    toast(`${action} — ${inc.id}`);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Active Incidents"
        description="Every open incident with its memory context. Select one to open the investigation workspace."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents…"
            aria-label="Search incidents"
            className="h-9 w-64 pl-8"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5" role="group" aria-label="Severity filter">
          {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              aria-pressed={severity === s}
              className={`rounded-md px-2 py-1 text-xs font-medium capitalize transition-colors ${
                severity === s ? "bg-secondary text-foreground" : "text-faint hover:text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-faint">
          {incidents.length} incidents · data is synthetic
        </span>
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-faint">
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-3 py-3 font-medium">Incident</th>
                <th className="px-3 py-3 font-medium">Service</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => toggleSort("detectedAt")}
                  >
                    Detected <ArrowUpDown className="size-3" />
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">AI</th>
                <th className="px-3 py-3 font-medium">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => toggleSort("memoryMatches")}
                  >
                    Memory <ArrowUpDown className="size-3" />
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">Assignee</th>
                <th className="px-3 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Loading incidents…
                  </td>
                </tr>
              )}
              {!isLoading && incidents.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <CircleCheck className="mx-auto size-6 text-success" />
                    <p className="mt-2 text-sm font-medium">No active incidents</p>
                    <p className="text-xs text-muted-foreground">
                      All monitored services are currently healthy.
                    </p>
                  </td>
                </tr>
              )}
              {incidents.map((inc) => (
                <tr
                  key={inc.id}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/workspace?incident=${inc.id}`)}
                  onClick={() => navigate(`/workspace?incident=${inc.id}`)}
                  className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-secondary/40"
                >
                  <td className="px-4 py-3"><SeverityBadge severity={inc.severity} /></td>
                  <td className="px-3 py-3">
                    <span className="block font-mono text-[10px] text-faint">{inc.id}</span>
                    <span className="font-medium text-foreground">{inc.title}</span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{inc.service}</td>
                  <td className="px-3 py-3"><StatusBadge status={inc.status} /></td>
                  <td className="tnum px-3 py-3 font-mono text-xs text-muted-foreground">
                    {shortTime(inc.detectedAt)}
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-ai">
                      <Sparkles className="size-3.5" />
                      {inc.status === "ai_diagnosing" ? "Diagnosing" : "Ready"}
                    </span>
                  </td>
                  <td className="px-3 py-3"><MemoryBadge count={inc.memoryMatches} /></td>
                  <td className="px-3 py-3 text-muted-foreground">{inc.assignee}</td>
                  <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Actions for ${inc.id}`}
                          className="rounded p-1 text-faint hover:bg-secondary hover:text-foreground"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onSelect={() => navigate(`/workspace?incident=${inc.id}`)}>
                          <Eye /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => act(inc, "Diagnose with AI")}>
                          <BrainCircuit /> Diagnose with AI
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => navigate("/memory/similar")}>
                          <Search /> Search similar incidents
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => navigate("/runbooks")}>
                          <BookOpen /> Open runbook
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => act(inc, "Assign")}>
                          <UserPlus /> Assign
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => act(inc, "Acknowledge")}>
                          <Hand /> Acknowledge
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => act(inc, "Resolve")}>
                          <CircleCheck /> Resolve
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-[11px] text-faint">
        Showing {incidents.length} of {formatNumber(1842)} historical incidents ·{" "}
        <Link to="/history" className="underline hover:text-foreground">
          view full history
        </Link>
      </p>
    </div>
  );
}

export { Siren, titleCase };
