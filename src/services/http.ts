import type {
  MemoryProvider,
  NewMemoryInput,
  NewPostmortemInput,
} from "@/services/provider";
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
 * HTTP provider stub — to be wired to the real Backend API + Memory Sidecar.
 *
 *   Frontend → Backend API → Memory Sidecar → Hindsight (retain / recall / reflect)
 *
 * The frontend never talks to Hindsight directly; this provider will call the
 * backend API which fronts the Memory Sidecar.
 */
export class HindsightHttpProvider implements MemoryProvider {
  // TODO: read base URL from import.meta.env.VITE_IIQ_API_URL
  // TODO: attach auth headers / session handling
  // TODO: map HTTP errors to typed failures incl. "hindsight unavailable"

  private async notImplemented(): Promise<never> {
    throw new Error("HindsightHttpProvider: not implemented yet");
  }

  getIncidents(): Promise<Incident[]> {
    return this.notImplemented();
  }
  getIncident(_id: string): Promise<Incident | undefined> {
    return this.notImplemented();
  }
  getTimeline(_incidentId: string): Promise<TimelineEvent[]> {
    return this.notImplemented();
  }
  getLogs(_incidentId: string): Promise<LogLine[]> {
    return this.notImplemented();
  }
  runDiagnosis(_incidentId: string): Promise<Diagnosis> {
    return this.notImplemented();
  }
  getRemediation(_incidentId: string): Promise<RemediationStep[]> {
    return this.notImplemented();
  }
  getSimilarIncidents(_incidentId: string): Promise<SimilarMatch[]> {
    return this.notImplemented();
  }
  searchMemory(_query: string): Promise<MemorySearchResult[]> {
    return this.notImplemented();
  }
  getMemory(_id: string): Promise<MemoryRecord | undefined> {
    return this.notImplemented();
  }
  getRunbooks(): Promise<Runbook[]> {
    return this.notImplemented();
  }
  getRunbook(_id: string): Promise<Runbook | undefined> {
    return this.notImplemented();
  }
  getPostmortems(): Promise<Postmortem[]> {
    return this.notImplemented();
  }
  getPostmortem(_id: string): Promise<Postmortem | undefined> {
    return this.notImplemented();
  }
  getServices(): Promise<ServiceNode[]> {
    return this.notImplemented();
  }
  getServiceHealth(_id: string): Promise<ServiceNode | undefined> {
    return this.notImplemented();
  }
  getDeployments(): Promise<Deployment[]> {
    return this.notImplemented();
  }
  getSystemHealth(): Promise<SystemHealthEntry[]> {
    return this.notImplemented();
  }
  resolveIncident(_incidentId: string): Promise<Incident> {
    return this.notImplemented();
  }
  createMemory(_input: NewMemoryInput): Promise<MemoryRecord> {
    return this.notImplemented();
  }
  createPostmortem(_input: NewPostmortemInput): Promise<Postmortem> {
    return this.notImplemented();
  }
  askAssistant(_incidentId: string, _question: string): Promise<AssistantAnswer> {
    return this.notImplemented();
  }
  ensureDemoSecondIncident(): Promise<Incident> {
    return this.notImplemented();
  }
}
