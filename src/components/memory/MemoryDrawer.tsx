import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SourceBadge } from "@/components/ui-kit/Status";
import { api } from "@/services";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/format";
import { useAsyncData } from "@/hooks/useAsyncData";
import { BookOpen, FileText, Link2, Siren } from "lucide-react";
import { Link } from "react-router";

function Section({
  title,
  items,
  empty,
}: {
  title: string;
  items?: string[];
  empty?: string;
}) {
  if (!items || items.length === 0) {
    return empty ? (
      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-faint">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{empty}</p>
      </div>
    ) : null;
  }
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-faint">{title}</h4>
      <ul className="mt-1.5 space-y-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-memory/60" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MemoryDrawer({ id }: { id: string }) {
  const closeMemoryDrawer = useAppStore((s) => s.closeMemoryDrawer);

  const { data, isLoading } = useAsyncData(() => api.getMemory(id), [id]);

  return (
    <Sheet open onOpenChange={(open) => !open && closeMemoryDrawer()}>
      <SheetContent className="w-full overflow-y-auto bg-bg-secondary sm:max-w-lg">
        <SheetHeader className="pb-0">
          <div className="flex items-center gap-2">
            {data && <SourceBadge source={data.source} />}
            {data?.sessionCreated && (
              <span className="rounded-full border border-ai/30 bg-ai/10 px-2 py-0.5 text-[10px] font-medium text-ai">
                Created this session
              </span>
            )}
          </div>
          <SheetTitle className="text-base leading-snug">
            {isLoading ? (
              <Skeleton className="h-5 w-64" />
            ) : (
              <>
                <span className="font-mono text-xs text-faint">{id}</span>
                <span className="mt-1 block">{data?.title ?? "Memory not found"}</span>
              </>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">Memory details</SheetDescription>
        </SheetHeader>

        {data && (
          <div className="space-y-5 px-4 pb-8">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border bg-card p-4 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-faint">Source</dt>
                <dd className="mt-0.5 font-medium">
                  {data.incidentRef ? `Incident ${data.incidentRef}` : titleize(data.type)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-faint">Created</dt>
                <dd className="mt-0.5 font-medium">{formatDate(data.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-faint">Service</dt>
                <dd className="mt-0.5 font-medium">{data.service}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-faint">Type</dt>
                <dd className="mt-0.5 font-medium capitalize">
                  {data.type.replace(/_/g, " ")}
                  {typeof data.relevance === "number" && (
                    <span className="ml-1 text-xs text-faint">
                      · demo relevance {data.relevance}%
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="space-y-5">
              <Section title="Symptoms" items={data.symptoms} />
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-faint">
                  Root Cause
                </h4>
                <p className="mt-1 rounded-md border border-critical/20 bg-critical/5 px-3 py-2 text-sm font-medium text-foreground">
                  {data.rootCause}
                </p>
              </div>
              <Section title="Investigation" items={data.investigation} />
              <Section title="Resolution" items={data.resolution} />
              <Section title="Outcome" items={data.outcome ? [data.outcome] : undefined} />
              {data.negativeFindings && data.negativeFindings.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-critical">
                    Tried before, didn't help
                  </h4>
                  <ul className="mt-1.5 space-y-1">
                    {data.negativeFindings.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-critical/90">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-critical" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Section title="Lessons Learned" items={data.lessons} />
            </div>

            {(data.relatedMemoryIds?.length ||
              data.relatedRunbookIds?.length ||
              data.relatedPostmortemIds?.length) && (
              <>
                <Separator />
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-faint">
                    Related
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.relatedMemoryIds?.map((mid) => (
                      <RelatedLink key={mid} to="/memory" icon={<Link2 className="size-3" />} label={mid} />
                    ))}
                    {data.relatedRunbookIds?.map((rid) => (
                      <RelatedLink key={rid} to={`/runbooks?focus=${rid}`} icon={<BookOpen className="size-3" />} label="Runbook" />
                    ))}
                    {data.relatedPostmortemIds?.map((pid) => (
                      <RelatedLink key={pid} to={`/postmortems?focus=${pid}`} icon={<FileText className="size-3" />} label="Postmortem" />
                    ))}
                    {data.incidentRef && (
                      <RelatedLink
                        to={`/workspace?incident=${data.incidentRef}`}
                        icon={<Siren className="size-3" />}
                        label={data.incidentRef}
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            <p className="text-[10px] text-faint">
              Demo relevance scores are synthetic and not experimentally validated.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function RelatedLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-memory/40 hover:text-foreground"
    >
      {icon}
      {label}
    </Link>
  );
}

function titleize(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
