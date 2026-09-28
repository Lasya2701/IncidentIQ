import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit/Misc";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import { notify } from "@/store/useAppStore";
import type { Postmortem } from "@/types/incident-iq";
import { formatDate } from "@/utils/format";
import { BrainCircuit, Check, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PostmortemsPage() {
  const { data, isLoading } = useAsyncData(() => api.getPostmortems(), []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Postmortem Library"
        description="Blameless postmortems linked to their incidents. Saving a postmortem extracts lessons into Hindsight as new memory."
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading postmortems…</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {(data ?? []).map((pm) => (
          <PostmortemCard key={pm.id} pm={pm} />
        ))}
      </div>
    </div>
  );
}

function PostmortemCard({ pm }: { pm: Postmortem }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(pm.addedToMemory);

  const addToMemory = async () => {
    setAdding(true);
    // Simulate the extraction sequence
    await new Promise((r) => setTimeout(r, 800));
    notify("memory", "Postmortem memory created", `Lessons from ${pm.incidentId} stored.`);
    toast.success("Added to Hindsight Memory ✓", {
      description: "Root cause, resolution and lessons extracted as new memory.",
    });
    setAdded(true);
    setAdding(false);
  };

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b border-border/70 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <FileText className="size-4 text-success" />
          <h2 className="text-sm font-semibold">{pm.title}</h2>
          <Badge variant="outline" className="border-border font-mono text-[10px] text-faint">
            {pm.incidentId}
          </Badge>
          {added && (
            <Badge variant="outline" className="ml-auto border-memory/30 bg-memory/10 text-memory">
              <BrainCircuit className="size-3" /> Added to Hindsight Memory ✓
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Created {formatDate(pm.createdAt)}</p>
      </CardHeader>
      <CardContent className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        <Field label="Impact" body={pm.impact} />
        <Field label="Root cause" body={pm.rootCause} critical />
        <div className="sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Timeline</p>
          <ul className="mt-1.5 space-y-1">
            {pm.timeline.map((t) => (
              <li key={t.time + t.event} className="flex gap-2 text-xs text-muted-foreground">
                <span className="tnum font-mono text-faint">{t.time}</span> {t.event}
              </li>
            ))}
          </ul>
        </div>
        <Field label="Resolution" body={pm.resolution} />
        <Field label="Contributing factors" body={pm.contributingFactors.join("; ")} />
        <Field label="Preventive actions" body={pm.preventiveActions.join("; ")} />
        <Field label="Lessons learned" body={pm.lessonsLearned.join("; ")} />
        <div className="sm:col-span-2 flex items-center justify-between border-t border-border/60 pt-3">
          {!added ? (
            <Button
              size="sm"
              onClick={addToMemory}
              disabled={adding}
              className="gap-1.5 bg-memory text-white hover:bg-memory/90"
            >
              <BrainCircuit className="size-3.5" />
              {adding ? "Extracting knowledge…" : "Add to Memory"}
            </Button>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-success">
              <Check className="size-3.5" /> Knowledge stored and searchable in Memory.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  body,
  critical,
}: {
  label: string;
  body: string;
  critical?: boolean;
}) {
  return (
    <div>
      <p className={critical ? "text-[11px] font-semibold uppercase tracking-wider text-critical" : "text-[11px] font-semibold uppercase tracking-wider text-faint"}>
        {label}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
