import { HindsightPanel } from "@/components/memory/HindsightPanel";
import { PageHeader } from "@/components/ui-kit/Misc";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/services";
import type { SimilarMatch } from "@/types/incident-iq";
import { useState } from "react";

/**
 * Similar Incidents page — shows the retrieval for the hero incident and lets
 * the user re-run the search against other incidents.
 */
export default function SimilarIncidentsPage() {
  const incidentsQ = useAsyncData(() => api.getIncidents(), []);
  const [incidentId, setIncidentId] = useState("INC-00241");
  const [matches, setMatches] = useState<SimilarMatch[] | undefined>(undefined);
  const [runKey, setRunKey] = useState(0);
  const incidents = incidentsQ.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Similar Incidents"
        description="What Hindsight retrieves for the current incident — ranked matches with their historical root causes, resolutions and outcomes."
      />

      <div className="flex flex-wrap gap-1.5">
        {incidents.map((inc) => (
          <button
            key={inc.id}
            type="button"
            onClick={() => {
              setIncidentId(inc.id);
              setMatches(undefined);
              setRunKey((k) => k + 1);
            }}
            className={`rounded-lg border px-2.5 py-1.5 font-mono text-xs font-medium transition-colors ${
              inc.id === incidentId
                ? "border-memory/40 bg-memory/10 text-memory"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {inc.id}
          </button>
        ))}
      </div>

      <HindsightPanel
        key={runKey}
        incidentId={incidentId}
        matches={matches}
        onSelect={undefined}
      />
    </div>
  );
}
