import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/services";
import type { Runbook } from "@/types/incident-iq";
import { useAsyncData } from "@/hooks/useAsyncData";
import { BookOpen, Eye, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";

export function RunbookCard({ runbookId }: { runbookId: string }) {
  const { data, isLoading } = useAsyncData(() => api.getRunbook(runbookId), [runbookId]);

  if (isLoading || !data) {
    return (
      <Card className="p-5">
        <Skeleton className="h-24 w-full rounded-lg" />
      </Card>
    );
  }

  return <RunbookCardBody runbook={data} />;
}

function RunbookCardBody({ runbook }: { runbook: Runbook }) {
  const pct = Math.round((runbook.resolvedCount / runbook.attemptedCount) * 100);
  return (
    <Card className="hairline-top gap-0 border-info/25 p-0">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-info/10 text-info">
            <BookOpen className="size-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
              Recommended runbook
            </p>
            <h2 className="text-base font-semibold tracking-tight">{runbook.title}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="tnum text-lg font-bold text-success">
            Resolved {runbook.resolvedCount} of {runbook.attemptedCount}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-faint">
            {pct}% effectiveness (demo)
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
        <RunbookSection title="When to use" items={runbook.symptoms} />
        <RunbookSection title="Diagnostics" items={runbook.diagnosticSteps} />
        <RunbookSection title="Remediation" items={runbook.remediation} numbered />
        <RunbookSection title="Verification" items={runbook.verification} check />
      </CardContent>
      <div className="flex flex-wrap items-center gap-2 border-t border-border/70 px-5 py-3">
        <Button asChild size="sm" className="gap-1.5">
          <Link to={`/runbooks?focus=${runbook.id}`}>
            <BookOpen className="size-3.5" /> Open Runbook
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to={`/memory/similar?runbook=${runbook.id}`}>
            <Eye className="size-3.5" /> View Related Incidents
          </Link>
        </Button>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-faint">
          <ShieldCheck className="size-3.5 text-success" />
          Success history available in memory
        </span>
      </div>
    </Card>
  );
}

function RunbookSection({
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
              <span className="tnum mt-0.5 flex size-4 shrink-0 items-center justify-center rounded bg-secondary text-[9px] font-bold text-muted-foreground">
                {i + 1}
              </span>
            ) : check ? (
              <Wrench className="mt-0.5 size-3 shrink-0 text-success" />
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
