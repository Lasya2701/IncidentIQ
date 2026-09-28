import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  IncidentStatus,
  MemorySource,
  RunbookResult,
  Severity,
  ServiceHealthStatus,
} from "@/types/incident-iq";
import { titleCase } from "@/utils/format";
import { BrainCircuit, Database, FileText, BookOpen, Layers } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Severity                                                            */
/* ------------------------------------------------------------------ */

const severityStyles: Record<Severity, string> = {
  critical: "bg-critical/15 text-critical border-critical/40",
  high: "bg-warning/15 text-warning border-warning/40",
  medium: "bg-info/15 text-info border-info/40",
  low: "bg-faint/15 text-faint border-faint/30",
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-semibold uppercase tracking-wide", severityStyles[severity], className)}
    >
      {severity}
    </Badge>
  );
}

export function severityTextClass(severity: Severity): string {
  return severityStyles[severity].split(" ").find((c) => c.startsWith("text-")) ?? "";
}

/* ------------------------------------------------------------------ */
/* Incident status                                                     */
/* ------------------------------------------------------------------ */

const statusStyles: Record<IncidentStatus, string> = {
  investigating: "bg-warning/10 text-warning border-warning/30",
  ai_diagnosing: "bg-ai/10 text-ai border-ai/30",
  acknowledged: "bg-info/10 text-info border-info/30",
  monitoring: "bg-memory/10 text-memory border-memory/30",
  resolved: "bg-success/10 text-success border-success/30",
};

const statusLabels: Record<IncidentStatus, string> = {
  investigating: "Investigating",
  ai_diagnosing: "AI Diagnosing",
  acknowledged: "Acknowledged",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export function StatusBadge({
  status,
  className,
}: {
  status: IncidentStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {statusLabels[status]}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Health                                                              */
/* ------------------------------------------------------------------ */

const healthStyles: Record<ServiceHealthStatus, { dot: string; text: string }> = {
  healthy: { dot: "bg-success", text: "text-success" },
  warning: { dot: "bg-warning", text: "text-warning" },
  critical: { dot: "bg-critical", text: "text-critical" },
};

export function StatDot({
  health,
  className,
}: {
  health: ServiceHealthStatus;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex size-2", className)}>
      <span className={cn("absolute inset-0 rounded-full", healthStyles[health].dot)} />
      {health !== "healthy" && (
        <span
          className={cn(
            "absolute inset-0 rounded-full opacity-60",
            healthStyles[health].dot,
            "animate-ping",
          )}
        />
      )}
    </span>
  );
}

export function HealthLabel({ health }: { health: ServiceHealthStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <StatDot health={health} />
      <span className={cn("capitalize", healthStyles[health].text)}>{health}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Memory source badges                                                */
/* ------------------------------------------------------------------ */

const sourceStyles: Record<MemorySource, string> = {
  hindsight: "bg-memory/10 text-memory border-memory/30",
  session: "bg-info/10 text-info border-info/30",
  postmortem: "bg-success/10 text-success border-success/30",
  runbook: "bg-warning/10 text-warning border-warning/30",
  knowledge_base: "bg-faint/10 text-faint border-faint/30",
  created: "bg-ai/10 text-ai border-ai/30",
};

const sourceLabels: Record<MemorySource, string> = {
  hindsight: "Hindsight",
  session: "Session",
  postmortem: "Postmortem",
  runbook: "Runbook",
  knowledge_base: "Knowledge Base",
  created: "New",
};

const sourceIcons: Record<MemorySource, React.ReactNode> = {
  hindsight: <BrainCircuit className="size-3" />,
  session: <Layers className="size-3" />,
  postmortem: <FileText className="size-3" />,
  runbook: <BookOpen className="size-3" />,
  knowledge_base: <Database className="size-3" />,
  created: <BrainCircuit className="size-3" />,
};

export function SourceBadge({
  source,
  className,
}: {
  source: MemorySource;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("gap-1", sourceStyles[source], className)}>
      {sourceIcons[source]}
      {sourceLabels[source]}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Runbook outcome                                                     */
/* ------------------------------------------------------------------ */

const outcomeStyles: Record<RunbookResult, string> = {
  resolved: "bg-success/10 text-success border-success/30",
  partial: "bg-warning/10 text-warning border-warning/30",
  failed: "bg-critical/10 text-critical border-critical/30",
};

const outcomeLabels: Record<RunbookResult, string> = {
  resolved: "Worked",
  partial: "Partial",
  failed: "Failed",
};

export function RunbookOutcomeBadge({
  result,
  className,
}: {
  result: RunbookResult;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(outcomeStyles[result], className)}>
      {result === "resolved" ? "✓" : result === "partial" ? "~" : "✕"} {outcomeLabels[result]}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Demo data badge (honesty)                                           */
/* ------------------------------------------------------------------ */

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      title="All values on this page are synthetic demo data"
      className={cn("border-faint/30 bg-faint/10 text-[10px] text-faint", className)}
    >
      Demo data
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Relevance meter (labelled "Demo relevance")                         */
/* ------------------------------------------------------------------ */

export function RelevanceMeter({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-memory transition-all duration-300"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="tnum text-xs font-semibold text-memory">{score}%</span>
    </div>
  );
}

export function relevanceLabel(score: number): string {
  return `Demo relevance ${score}%`;
}

/* ------------------------------------------------------------------ */
/* Memory match badge for incident rows                                */
/* ------------------------------------------------------------------ */

export function MemoryBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-faint", className)}>
        <BrainCircuit className="size-3.5" /> no matches
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-memory/30 bg-memory/10 px-2 py-0.5 text-xs font-medium text-memory",
        className,
      )}
    >
      <BrainCircuit className="size-3.5" />
      {count} {count === 1 ? "memory" : "memories"}
    </span>
  );
}

export { titleCase };
