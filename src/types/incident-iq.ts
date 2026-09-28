/**
 * IncidentIQ core domain types.
 * All UI consumes these types through the services layer — components never
 * import from `data/` directly.
 */

export type Severity = "critical" | "high" | "medium" | "low";

export type IncidentStatus =
  | "investigating"
  | "ai_diagnosing"
  | "acknowledged"
  | "monitoring"
  | "resolved";

export type ServiceHealthStatus = "healthy" | "warning" | "critical";

/** Memory types supported by the Hindsight store. */
export type MemoryType =
  | "incident_resolution"
  | "runbook"
  | "postmortem"
  | "pattern"
  | "decision";

export type MemorySource =
  | "hindsight"
  | "session"
  | "postmortem"
  | "runbook"
  | "knowledge_base"
  | "created";

/** How a runbook performed historically. */
export type RunbookResult = "resolved" | "partial" | "failed";

/** Per-incident runbook effectiveness record. */
export interface RunbookOutcome {
  runbookId: string;
  incidentId: string;
  result: RunbookResult;
  /** Short operator note, e.g. "temporary relief, recurred within 20 min". */
  note?: string;
}

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  /** ISO timestamp of detection. */
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  affectedUsers?: number;
  assignee: string;
  /** One-line operator-facing summary of impact. */
  summary: string;
  description?: string;
  /** Number of similar historical memories Hindsight holds for this incident. */
  memoryMatches: number;
  /** Historical median resolution time in minutes (demo). */
  medianResolutionMinutes: number;
  rootCause?: string;
  resolution?: string;
  /** Key of the scripted timeline in data (when present). */
  timelineKey?: string;
  logKey?: string;
  /** Deployments potentially correlated, labelled "possible correlation". */
  possibleDeploymentCorrelation?: string;
}

export interface MemoryRecord {
  id: string;
  title: string;
  type: MemoryType;
  source: MemorySource;
  service: string;
  /** ISO date created. */
  createdAt: string;
  severity?: Severity;
  incidentRef?: string;
  runbookRef?: string;
  postmortemRef?: string;
  symptoms: string[];
  rootCause: string;
  investigation?: string[];
  resolution: string[];
  /** What was attempted and did NOT help. */
  negativeFindings?: string[];
  outcome?: string;
  runbookOutcome?: RunbookResult;
  lessons?: string[];
  relatedMemoryIds?: string[];
  relatedRunbookIds?: string[];
  relatedPostmortemIds?: string[];
  /** Demo relevance score — never presented as validated accuracy. */
  relevance?: number;
  /** True when this record was created this session (demo step 13). */
  sessionCreated?: boolean;
  tier: "hot" | "warm" | "cold" | "curated";
}

export interface SimilarMatch {
  memory: MemoryRecord;
  /** Demo relevance 0–100. */
  score: number;
  /** Data-driven "why matched" reasons. */
  reasons: string[];
}

export interface DiagnosisEvidence {
  text: string;
  /** Where the evidence came from. */
  origin: "logs" | "metrics" | "memory" | "runbook" | "service_health";
}

export interface Diagnosis {
  incidentId: string;
  rootCause: string;
  confidenceLabel: "high" | "moderate" | "low";
  evidence: DiagnosisEvidence[];
  historicalContext: {
    incidents: number;
    runbooks: number;
    postmortems: number;
  };
  /** Memory ids used, in order of influence. */
  memoryIdsUsed: string[];
  /** Reference to a negative memory ("tried before, didn't help"). */
  negativeMemoryId?: string;
  generatedAt: string;
}

export type RemediationSource = "hindsight" | "runbook" | "ai";
export type RemediationStatus = "pending" | "in_progress" | "done";

export interface RemediationStep {
  id: string;
  action: string;
  why: string;
  source: RemediationSource;
  incidentRef?: string;
  runbookRef?: string;
  status: RemediationStatus;
  /** "worked" | "partial" | "failed" from history. */
  historicalOutcome?: RunbookResult;
  command?: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  detail?: string;
  kind:
    | "detected"
    | "log"
    | "analysis"
    | "memory_search"
    | "memory_found"
    | "diagnosis"
    | "remediation"
    | "resolution"
    | "memory_created"
    | "postmortem"
    | "deployment"
    | "ack";
}

export interface LogLine {
  id: string;
  time: string;
  level: "ERROR" | "WARN" | "INFO";
  service: string;
  message: string;
  detail?: string;
}

export interface Runbook {
  id: string;
  title: string;
  category:
    | "Database"
    | "API"
    | "Authentication"
    | "Networking"
    | "Caching"
    | "Deployment"
    | "Kubernetes"
    | "Infrastructure";
  description: string;
  symptoms: string[];
  prerequisites: string[];
  diagnosticSteps: string[];
  remediation: string[];
  rollback: string[];
  verification: string[];
  /** Effectiveness from outcomes. */
  resolvedCount: number;
  attemptedCount: number;
  outcomes: RunbookOutcome[];
  relatedIncidentIds: string[];
  lastUpdated: string;
}

export interface Postmortem {
  id: string;
  incidentId: string;
  title: string;
  impact: string;
  rootCause: string;
  timeline: { time: string; event: string }[];
  resolution: string;
  contributingFactors: string[];
  preventiveActions: string[];
  lessonsLearned: string[];
  addedToMemory: boolean;
  createdAt: string;
}

export interface ServiceNode {
  id: string;
  name: string;
  kind: "gateway" | "api" | "database" | "cache" | "infra";
  health: ServiceHealthStatus;
  /** Synthetic health detail shown on the service panel. */
  latencyMs: number;
  errorRate: string;
  uptime: string;
  dependsOn: string[];
  description: string;
  runbookIds: string[];
  memoryIds: string[];
  postmortemIds: string[];
}

export interface Deployment {
  id: string;
  version: string;
  service: string;
  deployedAt: string;
  deployedAtLabel: string;
  author: string;
  note: string;
  /** "Possible correlation" — never asserted as cause. */
  correlatedIncidentId?: string;
  correlationNote?: string;
}

export type SystemComponentStatus = "connected" | "degraded" | "down";

export interface SystemHealthEntry {
  id: string;
  name: string;
  role: string;
  status: SystemComponentStatus;
  latencyMs: number;
  lastChecked: string;
  version: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: SystemComponentStatus;
  latencyMs: number;
  lastSuccess: string;
  errors24h: number;
}

export type NotificationKind = "critical" | "memory" | "system" | "ai";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface MemorySearchResult {
  memory: MemoryRecord;
  relevance: number;
  reasons: string[];
}

export interface AssistantAnswer {
  answer: string;
  evidence: string[];
  historicalContext: string[];
  relatedMemoryId?: string;
  relatedRunbookId?: string;
}
