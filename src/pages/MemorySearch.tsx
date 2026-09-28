import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui-kit/Misc";
import { SourceBadge } from "@/components/ui-kit/Status";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import { useAppStore } from "@/store/useAppStore";
import type { MemorySearchResult, ServiceNode } from "@/types/incident-iq";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";
import { BrainCircuit, Check, Loader2, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const EXAMPLES = [
  "Have we seen database connection exhaustion before?",
  "What caused the last payment outage?",
  "Which runbook fixed this issue?",
  "What happened during the last Redis outage?",
  "Which fixes worked previously?",
];

export default function MemorySearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<MemorySearchResult[] | undefined>(undefined);
  const [service, setService] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const openMemoryDrawer = useAppStore((s) => s.openMemoryDrawer);
  const servicesQ = useAsyncData(() => api.getServices(), []);

  const run = async (q: string) => {
    setSubmitted(q);
    setQuery(q);
    setSearching(true);
    setError(null);
    try {
      const [res] = await Promise.all([
        api.searchMemory(q),
        new Promise((r) => setTimeout(r, 900)),
      ]);
      setResults(res as MemorySearchResult[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Initial example query preloaded once.
  useEffect(() => {
    run(EXAMPLES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const services = servicesQ.data ?? [];
  const filtered = (results ?? []).filter(
    (r) => service === "all" || r.memory.service === service,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Memory Search"
        description="Ask your operational memory a question. Results are ranked by demo relevance with the reasons each memory was retrieved."
      />

      <Card className="border-memory/25">
        <CardContent className="p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) run(query);
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <BrainCircuit className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-memory" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask your operational memory…"
                aria-label="Search memory"
                className="h-11 border-memory/30 bg-bg-secondary pl-9 text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={searching}
              className="h-11 gap-1.5 bg-memory text-white hover:bg-memory/90"
            >
              {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Search Hindsight
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => run(ex)}
                className="rounded-full border border-border bg-bg-secondary px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-memory/40 hover:text-foreground"
              >
                {ex}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-faint">Service:</span>
            <button
              type="button"
              onClick={() => setService("all")}
              className={cn(
                "rounded-md border px-2 py-0.5",
                service === "all" ? "border-memory/40 bg-memory/10 text-memory" : "border-border text-muted-foreground",
              )}
            >
              All
            </button>
            {services.map((s: ServiceNode) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setService(s.name)}
                className={cn(
                  "rounded-md border px-2 py-0.5",
                  service === s.name ? "border-memory/40 bg-memory/10 text-memory" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {searching && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-memory">
            <Sparkles className="size-4 animate-pulse" /> Searching Hindsight…
          </p>
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      )}

      {error && (
        <Card className="border-warning/30">
          <CardContent className="p-5 text-sm text-warning">
            Hindsight memory temporarily unavailable — {error}. Try again.
          </CardContent>
        </Card>
      )}

      {!searching && results && (
        <>
          <p className="text-xs text-muted-foreground">
            {filtered.length} results for{" "}
            <span className="font-medium text-foreground">“{submitted}”</span> · demo relevance
            scores are synthetic
          </p>
          <div className="space-y-2">
            {filtered.map((r) => (
              <Card key={r.memory.id} className="gap-0 p-0 transition-colors hover:border-memory/40">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-memory">
                      {r.memory.incidentRef ?? r.memory.id}
                    </span>
                    <SourceBadge source={r.memory.source} />
                    <span className="text-xs text-muted-foreground">{r.memory.service}</span>
                    <span className="text-[11px] text-faint">{formatDate(r.memory.createdAt)}</span>
                    <span className="ml-auto text-right">
                      <span className="block text-[9px] uppercase tracking-wider text-faint">
                        Demo relevance
                      </span>
                      <span className="tnum text-sm font-bold text-memory">{r.relevance}%</span>
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold">{r.memory.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="font-medium text-critical">Root cause:</span>{" "}
                    {r.memory.rootCause}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <ul className="flex flex-wrap gap-x-3 gap-y-1">
                      {r.reasons.map((reason) => (
                        <li key={reason} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Check className="size-3 text-success" /> {reason}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 border-memory/30 text-xs text-memory"
                      onClick={() => openMemoryDrawer(r.memory.id)}
                    >
                      View memory
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-10 text-center">
                <BrainCircuit className="mx-auto size-6 text-faint" />
                <p className="mt-2 text-sm font-medium">No memories found</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                  Resolve your first incident to start building IncidentIQ's operational
                  memory.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
