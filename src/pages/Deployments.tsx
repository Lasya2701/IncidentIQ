import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit/Misc";
import { DemoBadge } from "@/components/ui-kit/Status";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import { GitCommitHorizontal, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeploymentsPage() {
  const { data, isLoading } = useAsyncData(() => api.getDeployments(), []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Deployments"
        description="Recent releases with possible incident correlations. Correlation is investigated, never assumed to be cause."
        actions={<DemoBadge />}
      />

      <div className="relative space-y-4 pl-6">
        <span className="absolute inset-y-2 left-2 w-px bg-border" aria-hidden />
        {isLoading && <p className="text-sm text-muted-foreground">Loading deployments…</p>}
        {(data ?? []).map((d) => (
          <div key={d.id} className="relative">
            <span className="absolute -left-[1.35rem] top-4 flex size-5 items-center justify-center rounded-full border border-warning/40 bg-warning/10 text-warning">
              <GitCommitHorizontal className="size-3" />
            </span>
            <Card className={cn("gap-0", d.correlatedIncidentId && "border-warning/30")}>
              <CardHeader className="flex-row flex-wrap items-center gap-2 px-5 py-3.5">
                <span className="rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 font-mono text-xs font-bold text-warning">
                  {d.version}
                </span>
                <span className="text-sm font-medium">{d.service}</span>
                <span className="text-xs text-faint">{d.deployedAtLabel} · {d.author}</span>
                {d.correlatedIncidentId && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                    <TriangleAlert className="size-3" /> Possible correlation
                  </span>
                )}
              </CardHeader>
              <CardContent className="px-5 pb-4 pt-0">
                <p className="text-xs text-muted-foreground">{d.note}</p>
                {d.correlationNote && (
                  <p className="mt-2 rounded-md border border-border bg-bg-secondary px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                    {d.correlationNote}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
