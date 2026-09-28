import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-kit/Misc";
import { SeverityBadge } from "@/components/ui-kit/Status";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import type { Incident, TimelineEvent } from "@/types/incident-iq";
import { shortTime } from "@/utils/format";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function TimelinePage() {
  const incidentsQ = useAsyncData(() => api.getIncidents(), []);
  const [expandedId, setExpandedId] = useState<string | undefined>("INC-00241");
  const navigate = useNavigate();
  const incidents = (incidentsQ.data ?? []).filter((i) => i.status !== "resolved");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Incident Timeline"
        description="Chronological view across active incidents. Expand one to see its event-by-event investigation trail."
      />

      <div className="space-y-2">
        {incidents.map((inc) => (
          <IncidentRow
            key={inc.id}
            incident={inc}
            expanded={expandedId === inc.id}
            onToggle={() => setExpandedId(expandedId === inc.id ? undefined : inc.id)}
            onOpen={() => navigate(`/workspace?incident=${inc.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function IncidentRow({
  incident,
  expanded,
  onToggle,
  onOpen,
}: {
  incident: Incident;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const timelineQ = useAsyncData(
    () => (expanded ? api.getTimeline(incident.id) : Promise.resolve<TimelineEvent[]>([])),
    [expanded, incident.id],
  );

  return (
    <Card className="gap-0 p-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
      >
        <SeverityBadge severity={incident.severity} />
        <span className="font-mono text-xs text-faint">{incident.id}</span>
        <span className="font-medium">{incident.title}</span>
        <span className="ml-auto text-xs text-faint">
          detected {shortTime(incident.detectedAt)}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-border/60 px-5 py-4">
          <IncidentTimeline events={timelineQ.data ?? []} />
          <button
            type="button"
            onClick={onOpen}
            className="mt-3 text-xs text-memory underline-offset-2 hover:underline"
          >
            Open workspace →
          </button>
        </div>
      )}
    </Card>
  );
}
