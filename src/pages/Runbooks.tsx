import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui-kit/Misc";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import type { Runbook } from "@/types/incident-iq";
import { formatDateShort } from "@/utils/format";
import { cn } from "@/lib/utils";
import { BookOpen, Check, Search, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

const CATEGORIES = [
  "All",
  "Database",
  "API",
  "Authentication",
  "Networking",
  "Caching",
  "Deployment",
  "Kubernetes",
  "Infrastructure",
] as const;

export default function RunbooksPage() {
  const { data, isLoading } = useAsyncData(() => api.getRunbooks(), []);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");
  const [params] = useSearchParams();
  const focusId = params.get("focus");

  const runbooks = useMemo(() => {
    let list = data ?? [];
    if (category !== "All") list = list.filter((r) => r.category === category);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => `${r.title} ${r.description}`.toLowerCase().includes(q));
    return list;
  }, [data, category, query]);

  const focused = runbooks.find((r) => r.id === focusId) ?? (data ?? []).find((r) => r.id === focusId);

  useEffect(() => {
    if (focused) {
      document.getElementById(`rb-${focused.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focused]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Runbook Library"
        description="Searchable operational runbooks with their real track record — which incidents they resolved, partially helped, or failed."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search runbooks…"
            aria-label="Search runbooks"
            className="h-9 w-60 pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                category === c
                  ? "border-info/40 bg-info/10 text-info"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading runbooks…</p>}

      <div className="space-y-3">
        {runbooks.map((rb) => (
          <RunbookFullCard key={rb.id} runbook={rb} focused={rb.id === focusId} />
        ))}
      </div>
    </div>
  );
}

function RunbookFullCard({ runbook, focused }: { runbook: Runbook; focused: boolean }) {
  const [open, setOpen] = useState(focused);
  const pct = Math.round((runbook.resolvedCount / runbook.attemptedCount) * 100);
  const failed = runbook.outcomes.filter((o) => o.result === "failed");

  return (
    <Card
      id={`rb-${runbook.id}`}
      className={cn("gap-0 scroll-mt-24 p-0 transition-shadow", focused && "ring-1 ring-info/40")}
    >
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-info/10 text-info">
            <BookOpen className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold">{runbook.title}</h2>
              <Badge variant="outline" className="border-border text-[10px] text-faint">
                {runbook.category}
              </Badge>
            </div>
            <p className="mt-0.5 max-w-xl text-xs text-muted-foreground">{runbook.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="tnum text-base font-bold text-success">
            Resolved {runbook.resolvedCount} of {runbook.attemptedCount}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-faint">
            {pct}% effectiveness (demo) · updated {formatDateShort(runbook.lastUpdated)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 pt-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="text-xs font-medium text-info hover:underline"
        >
          {open ? "Hide full runbook" : "Show full runbook (symptoms, diagnostics, remediation, rollback)"}
        </button>

        {open && (
          <div className="mt-3 grid gap-4 rounded-lg border border-border bg-bg-secondary/50 p-4 sm:grid-cols-2">
            <Section title="Symptoms" items={runbook.symptoms} />
            <Section title="Prerequisites" items={runbook.prerequisites} />
            <Section title="Diagnostic steps" items={runbook.diagnosticSteps} numbered />
            <Section title="Remediation" items={runbook.remediation} numbered />
            <Section title="Rollback" items={runbook.rollback} />
            <Section title="Verification" items={runbook.verification} check />
            <div className="sm:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
                Outcome ledger
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {runbook.outcomes.map((o) => (
                  <li
                    key={o.incidentId + o.result}
                    className={cn(
                      "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]",
                      o.result === "resolved" && "border-success/30 bg-success/10 text-success",
                      o.result === "partial" && "border-warning/30 bg-warning/10 text-warning",
                      o.result === "failed" && "border-critical/30 bg-critical/10 text-critical",
                    )}
                  >
                    {o.incidentId}: {o.result}
                    {o.note ? ` — ${o.note}` : ""}
                  </li>
                ))}
              </ul>
              {failed.length > 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-critical">
                  <TriangleAlert className="size-3" />
                  Failed attempts are retained as negative memory so they aren't repeated.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
                Related incidents
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {runbook.relatedIncidentIds.map((id) => (
                  <span key={id} className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  items,
  numbered,
  check,
}: {
  title: string;
  items: string[];
  numbered?: boolean;
  check?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            {numbered ? (
              <span className="tnum mt-0.5 flex size-4 shrink-0 items-center justify-center rounded bg-secondary text-[9px] font-bold">
                {i + 1}
              </span>
            ) : check ? (
              <Check className="mt-0.5 size-3 shrink-0 text-success" />
            ) : (
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-faint" />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
