import type {
  AssistantAnswer,
  Deployment,
  Diagnosis,
  Incident,
  LogLine,
  MemoryRecord,
  MemorySearchResult,
  Postmortem,
  RemediationStep,
  Runbook,
  ServiceNode,
  SimilarMatch,
  SystemHealthEntry,
  TimelineEvent,
} from "@/types/incident-iq";

/**
 * The single seam between UI and any memory backend.
 *
 *   Frontend → Backend API → Memory Sidecar → Hindsight (retain / recall / reflect)
 *
 * The mock implementation lives in `mock.ts`; a future `HindsightHttpProvider`
 * will swap in transparently. UI code only ever calls this interface.
 */
export interface MemoryProvider {
  getIncidents(): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
  getTimeline(incidentId: string): Promise<TimelineEvent[]>;
  getLogs(incidentId: string): Promise<LogLine[]>;

  /** Simulated AI investigation: resolves to a diagnosis after staged delay. */
  runDiagnosis(incidentId: string): Promise<Diagnosis>;
  getRemediation(incidentId: string): Promise<RemediationStep[]>;
  getSimilarIncidents(incidentId: string): Promise<SimilarMatch[]>;

  searchMemory(query: string): Promise<MemorySearchResult[]>;
  getMemory(id: string): Promise<MemoryRecord | undefined>;

  getRunbooks(): Promise<Runbook[]>;
  getRunbook(id: string): Promise<Runbook | undefined>;

  getPostmortems(): Promise<Postmortem[]>;
  getPostmortem(id: string): Promise<Postmortem | undefined>;

  getServices(): Promise<ServiceNode[]>;
  getServiceHealth(id: string): Promise<ServiceNode | undefined>;
  getDeployments(): Promise<Deployment[]>;
  getSystemHealth(): Promise<SystemHealthEntry[]>;

  resolveIncident(incidentId: string): Promise<Incident>;
  createMemory(input: NewMemoryInput): Promise<MemoryRecord>;
  createPostmortem(input: NewPostmortemInput): Promise<Postmortem>;
  askAssistant(incidentId: string, question: string): Promise<AssistantAnswer>;

  /** Demo support: injects the scripted follow-up incident (demo step 14). */
  ensureDemoSecondIncident(): Promise<Incident>;
}

/** Payload for storing a new incident memory. */
export interface NewMemoryInput {
  incidentId: string;
  title: string;
  service: string;
  symptoms: string[];
  rootCause: string;
  investigation: string[];
  resolution: string[];
  runbookId?: string;
  runbookOutcome?: "worked" | "partial" | "failed";
  outcome: string;
  preventiveActions: string[];
  lessons: string[];
  severity: Incident["severity"];
}

/** Payload for creating a postmortem. */
export interface NewPostmortemInput {
  incidentId: string;
  title: string;
  impact: string;
  rootCause: string;
  timeline: { time: string; event: string }[];
  resolution: string;
  contributingFactors: string[];
  preventiveActions: string[];
  lessonsLearned: string[];
}

/** Mode the provider is operating in. */
export type ProviderMode = "mock" | "http";
