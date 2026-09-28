import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import type { Incident } from "@/types/incident-iq";
import { ArrowDown, GitCommitHorizontal, TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DeploymentCorrelation({ incident }: { incident: Incident }) {
  const { data, isLoading } = useAsyncData(() => api.getDeployments(), []);
  if (!incident.possibleDeploymentCorrelation) return null;

  const dep = data?.find((d) => d.version === incident.possibleDeploymentCorrelation);

  return (
    <Card className="gap-0 border-warning/25 p-0">
      <CardHeader className="flex-row items-center gap-2 border-b border-border/70 px-5 py-3">
        <GitCommitHorizontal className="size-4 text-warning" />
        <p className="text-sm font-semibold">Possible deployment correlation</p>
        <span className="ml-auto rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
          Possible correlation — not confirmed cause
        </span>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading || !dep ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-md border border-warning/30 bg-warning/10 px-2 py-1 font-mono text-xs font-semibold text-warning">
                {dep.version}
              </span>
              <span className="text-muted-foreground">{dep.deployedAtLabel} · {dep.author}</span>
            </div>
            <ArrowDown className="ml-3 size-3 text-faint" />
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground">
                8 minutes later
              </span>
              <span className="text-muted-foreground">HTTP 503 spike began</span>
            </div>
            <ArrowDown className="ml-3 size-3 text-faint" />
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-md border border-critical/25 bg-critical/10 px-2 py-1 text-xs text-critical">
                <TriangleAlert className="mr-1 inline size-3" />
                DB connection acquisitions rose
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {dep.correlationNote}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
