import {
  deployments,
  initialIncidents,
  logStreams,
  timelines,
} from "@/data/incidents";
import { extraMemories, memories as seedMemories } from "@/data/memories";
import { postmortems as seedPostmortems } from "@/data/postmortems";
import { runbooks as seedRunbooks } from "@/data/runbooks";
import { services as seedServices } from "@/data/services";
import { systemHealth } from "@/data/system";
import type { MemoryProvider, NewMemoryInput, NewPostmortemInput } from "@/services/provider";
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
import { localId } from "@/utils/seeded";

/** Failure injection: ?fail=hindsight or ?fail=llm in the URL. */
function failureMode(): "hindsight" | "llm" | null {
  try {
    const p = new URLSearchParams(window.location.search).get("fail");
    if (p === "hindsight" || p === "llm") return p;
  } catch {
    /* noop */
  }
  return null;
}

/** Simulated network latency 150–900ms. */
function latency(min = 150, max = 900): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * In-memory mutable copies so resolve/createMemory actually mutate state for
 * the session (Memory Search finds newly created memories, runbook
 * effectiveness increments, etc.). Reset on page reload.
 */
const incidents: Incident[] = initialIncidents.map((i) => ({ ...i }));
let demoSecondAdded = false;
const memories: MemoryRecord[] = [...seedMemories, ...extraMemories].map((m) => ({
  ...m,
}));
const runbooks: Runbook[] = seedRunbooks.map((r) => ({
  ...r,
  outcomes: [...r.outcomes],
}));
const postmortems: Postmortem[] = seedPostmortems.map((p) => ({ ...p }));
const serviceNodes: ServiceNode[] = seedServices.map((s) => ({ ...s }));
const depls: Deployment[] = deployments.map((d) => ({ ...d }));

const negativeMemoryId = "M-16220"; // INC-00118 "didn't work" record

/** Token map used for naive-but-effective semantic-ish search. */
const STOPWORDS = new Set([
  "the", "a", "an", "is", "was", "have", "has", "we", "did", "do", "what",
  "which", "how", "why", "when", "of", "in", "on", "for", "to", "with", "and",
  "or", "it", "this", "that", "last", "before", "ever", "our",
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function memoryTokenOverlap(query: string, m: MemoryRecord): { hits: number; reasons: string[] } {
  const qTokens = tokenize(query);
  const serviceTokens = tokenize(m.service);
  const haystackTokens = new Set(
    [
      m.title,
      m.rootCause,
      m.symptoms.join(" "),
      m.resolution.join(" "),
      m.lessons?.join(" ") ?? "",
      m.service,
      m.type.replace(/_/g, " "),
      m.incidentRef ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/),
  );
  let hits = 0;
  const reasons: string[] = [];
  for (const t of qTokens) {
    if (serviceTokens.includes(t)) {
      hits += 2;
      continue;
    }
    if (haystackTokens.has(t)) hits += 1;
  }
  if (hits > 0) {
    reasons.push("Text overlap with memory content");
  }
  return { hits, reasons };
}

export class MockMemoryProvider implements MemoryProvider {
  async getIncidents(): Promise<Incident[]> {
    await latency();
    return incidents.map((i) => ({ ...i }));
  }

  /** Demo step 14: add INC-00243 (Order Service pool saturation follow-up). */
  async ensureDemoSecondIncident(): Promise<Incident> {
    await latency(150, 300);
    if (!demoSecondAdded) {
      demoSecondAdded = true;
      incidents.unshift({
        id: "INC-00243",
        title: "Order Service timeouts from pool saturation",
        service: "Order Service",
        severity: "high",
        status: "investigating",
        detectedAt: new Date().toISOString(),
        affectedUsers: 1800,
        assignee: "Lasya",
        summary: "Timeouts on order creation; DB pool wait queue growing.",
        memoryMatches: 2,
        medianResolutionMinutes: 19,
        logKey: "INC-00238",
        timelineKey: undefined,
      });
    }
    return { ...incidents[0] };
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    await latency(100, 350);
    const found = incidents.find((i) => i.id === id);
    return found ? { ...found } : undefined;
  }

  async getTimeline(incidentId: string): Promise<TimelineEvent[]> {
    await latency(120, 400);
    return (timelines[incidentId] ?? []).map((e) => ({ ...e }));
  }

  async getLogs(incidentId: string): Promise<LogLine[]> {
    await latency(120, 400);
    return (logStreams[incidentId] ?? []).map((l) => ({ ...l }));
  }

  async runDiagnosis(incidentId: string): Promise<Diagnosis> {
    if (failureMode() === "llm") {
      await latency(300, 500);
      throw new Error("LLM provider unavailable (fail=llm injected)");
    }
    await latency(400, 900);
    const incident = incidents.find((i) => i.id === incidentId);
    if (incident?.id === "INC-00241") {
      return {
        incidentId,
        rootCause: "Database connection pool exhaustion",
        confidenceLabel: "high",
        evidence: [
          {
            text: "Connection pool reached configured limit (100/100)",
            origin: "metrics",
          },
          {
            text: "Database utilization increased to 100% within 40s",
            origin: "metrics",
          },
          {
            text: "HTTP 503 rate increased simultaneously with pool saturation",
            origin: "logs",
          },
          {
            text: "Similar pattern found in historical incidents (INC-00172, INC-00145)",
            origin: "memory",
          },
        ],
        historicalContext: { incidents: 4, runbooks: 2, postmortems: 1 },
        memoryIdsUsed: ["M-18291", "M-17944", "M-17120"],
        negativeMemoryId,
        generatedAt: new Date().toISOString(),
      };
    }
    return {
      incidentId,
      rootCause: incident?.rootCause ?? "Under investigation — insufficient signal",
      confidenceLabel: incident ? "moderate" : "low",
      evidence: [
        { text: "Analyzed streaming logs for correlated errors", origin: "logs" },
        {
          text: "Cross-checked service health for dependency failures",
          origin: "service_health",
        },
        {
          text: `${incident?.memoryMatches ?? 0} similar incidents retrieved from Hindsight`,
          origin: "memory",
        },
      ],
      historicalContext: { incidents: incident?.memoryMatches ?? 0, runbooks: 1, postmortems: 0 },
      memoryIdsUsed: [],
      generatedAt: new Date().toISOString(),
    };
  }

  async getRemediation(incidentId: string): Promise<RemediationStep[]> {
    await latency(200, 500);
    if (incidentId !== "INC-00241") {
      return [
        {
          id: `${incidentId}-r1`,
          action: "Continue monitoring dashboards",
          why: "Signal is ambiguous; avoid premature changes.",
          source: "ai",
          status: "pending",
        },
      ];
    }
    return [
      {
        id: "r1",
        action: "Check active DB connections",
        why: "Confirm saturation is still present before changing capacity.",
        source: "runbook",
        runbookRef: "rb-db-pool",
        incidentRef: "INC-00172",
        status: "pending",
        historicalOutcome: "resolved",
        command: "psql -c 'select count(*) from pg_stat_activity'",
      },
      {
        id: "r2",
        action: "Verify connection pool utilization",
        why: "Distinguish capacity exhaustion from connection leaks.",
        source: "runbook",
        runbookRef: "rb-db-pool",
        incidentRef: "INC-00145",
        status: "pending",
        historicalOutcome: "resolved",
        command: "curl -s metrics/payments/pool | jq .utilization",
      },
      {
        id: "r3",
        action: "Increase pool limit 50 → 100",
        why: "The exact change that resolved INC-00172 in 11 minutes.",
        source: "hindsight",
        runbookRef: "rb-db-pool",
        incidentRef: "INC-00172",
        status: "pending",
        historicalOutcome: "resolved",
        command: "kubectl set env deploy/payment-api DB_POOL_MAX=100",
      },
      {
        id: "r4",
        action: "Restart affected service (rolling)",
        why: "Apply new limits; combine with step 3, not as the only action.",
        source: "hindsight",
        incidentRef: "INC-00118",
        status: "pending",
        historicalOutcome: "failed",
        command: "kubectl rollout restart deploy/payment-api",
      },
      {
        id: "r5",
        action: "Monitor HTTP 503 rate",
        why: "Confirm recovery; alert if not below 1% within 30 minutes.",
        source: "ai",
        status: "pending",
      },
    ];
  }

  async getSimilarIncidents(incidentId: string): Promise<SimilarMatch[]> {
    if (failureMode() === "hindsight") {
      await latency(300, 500);
      throw new Error("Hindsight unavailable (fail=hindsight injected)");
    }
    await latency(300, 700);
    if (incidentId === "INC-00241") {
      return [
        {
          memory: this.clone(memories.find((m) => m.id === "M-18291")!),
          score: 92,
          reasons: [
            "Same service (Payment API)",
            "Similar error (HTTP 503)",
            "Similar symptoms (pool at limit, DB utilization)",
            "Matching root cause",
            "Similar resolution",
          ],
        },
        {
          memory: this.clone(memories.find((m) => m.id === "M-17944")!),
          score: 87,
          reasons: [
            "Same service (Payment API)",
            "Similar symptoms (connection saturation)",
            "Matching root cause",
          ],
        },
        {
          memory: this.clone(memories.find((m) => m.id === "M-17120")!),
          score: 81,
          reasons: [
            "Same service (Payment API)",
            "Similar symptoms (timeout spike, wait queue)",
            "Matching root cause",
          ],
        },
        {
          memory: this.clone(memories.find((m) => m.id === "M-16220")!),
          score: 74,
          reasons: [
            "Same service (Payment API)",
            "Similar error (503 storm)",
            "Negative outcome — shows what NOT to do",
          ],
        },
      ];
    }
    // Generic similarity: overlap-based ranking over the store.
    const incident = incidents.find((i) => i.id === incidentId);
    const q = `${incident?.title ?? ""} ${incident?.service ?? ""} ${incident?.rootCause ?? ""}`;
    const scored = memories
      .map((m) => {
        const { hits, reasons } = memoryTokenOverlap(q, m);
        const sameService = m.service === incident?.service;
        if (sameService) {
          reasons.unshift(`Same service (${m.service})`);
        }
        // Freshest context: memories created this session rank first (demo step 15).
        if (m.sessionCreated) {
          reasons.unshift("Created moments ago — freshest context");
        }
        const score = Math.min(
          97,
          Math.max(
            55,
            58 + hits * 4 + (sameService ? 8 : 0) + (m.sessionCreated ? 24 : 0),
          ),
        );
        return { memory: this.clone(m), score, reasons };
      })
      .filter((s) => s.reasons.length > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    return scored;
  }

  async searchMemory(query: string): Promise<MemorySearchResult[]> {
    if (failureMode() === "hindsight") {
      await latency(300, 500);
      throw new Error("Hindsight unavailable (fail=hindsight injected)");
    }
    await latency(400, 800);
    const q = query.trim();
    if (!q) return [];
    const scored = memories
      .map((m) => {
        const { hits, reasons } = memoryTokenOverlap(q, m);
        const score = Math.min(96, Math.max(0, 42 + hits * 9));
        return { memory: this.clone(m), relevance: score, reasons };
      })
      .filter((r) => r.relevance >= 55)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 8);
    // "Everything" query: return broad, still ranked.
    if (scored.length === 0 && q.length > 2) {
      return memories.slice(0, 5).map((m) => ({
        memory: this.clone(m),
        relevance: Math.max(56, (m.relevance ?? 60) - 4),
        reasons: ["Broad match — weakest results shown"],
      }));
    }
    return scored;
  }

  async getMemory(id: string): Promise<MemoryRecord | undefined> {
    await latency(100, 300);
    const m = memories.find((x) => x.id === id);
    return m ? this.clone(m) : undefined;
  }

  async getRunbooks(): Promise<Runbook[]> {
    await latency();
    return runbooks.map((r) => ({ ...r, outcomes: [...r.outcomes] }));
  }

  async getRunbook(id: string): Promise<Runbook | undefined> {
    await latency(100, 300);
    const r = runbooks.find((x) => x.id === id);
    return r ? { ...r, outcomes: [...r.outcomes] } : undefined;
  }

  async getPostmortems(): Promise<Postmortem[]> {
    await latency();
    return postmortems.map((p) => ({ ...p }));
  }

  async getPostmortem(id: string): Promise<Postmortem | undefined> {
    await latency(100, 300);
    const p = postmortems.find((x) => x.id === id);
    return p ? { ...p } : undefined;
  }

  async getServices(): Promise<ServiceNode[]> {
    await latency();
    return serviceNodes.map((s) => ({ ...s }));
  }

  async getServiceHealth(id: string): Promise<ServiceNode | undefined> {
    await latency(100, 300);
    const s = serviceNodes.find((x) => x.id === id);
    return s ? { ...s } : undefined;
  }

  async getDeployments(): Promise<Deployment[]> {
    await latency(150, 400);
    return depls.map((d) => ({ ...d }));
  }

  async getSystemHealth(): Promise<SystemHealthEntry[]> {
    await latency(150, 400);
    return systemHealth.map((h) => ({ ...h }));
  }

  async resolveIncident(incidentId: string): Promise<Incident> {
    await latency(300, 700);
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) throw new Error(`Unknown incident ${incidentId}`);
    inc.status = "resolved";
    inc.resolvedAt = new Date().toISOString();
    if (inc.id === "INC-00241") {
      inc.rootCause = "Database connection pool exhaustion";
      inc.resolution = "Connection pool limit raised 50 → 100; rolling restart applied.";
    }
    return { ...inc };
  }

  async createMemory(input: NewMemoryInput): Promise<MemoryRecord> {
    await latency(300, 700);
    const id = `M-${localId("s").replace("s-", "")}`;
    const record: MemoryRecord = {
      id,
      title: input.title,
      type: "incident_resolution",
      source: "created",
      service: input.service,
      createdAt: new Date().toISOString(),
      severity: input.severity,
      incidentRef: input.incidentId,
      runbookRef: input.runbookId,
      symptoms: input.symptoms,
      rootCause: input.rootCause,
      investigation: input.investigation,
      resolution: input.resolution,
      outcome: input.outcome,
      runbookOutcome:
        input.runbookOutcome === "worked"
          ? "resolved"
          : input.runbookOutcome === "partial"
            ? "partial"
            : input.runbookOutcome === "failed"
              ? "failed"
              : undefined,
      lessons: input.lessons,
      relevance: 95,
      sessionCreated: true,
      tier: "hot",
    };
    memories.unshift(record);

    // Runbook effectiveness actually updates (5/6 → 6/7) when outcome is recorded.
    if (input.runbookId) {
      const rb = runbooks.find((r) => r.id === input.runbookId);
      if (rb) {
        rb.outcomes = [
          ...rb.outcomes.filter((o) => o.incidentId !== input.incidentId),
          {
            runbookId: rb.id,
            incidentId: input.incidentId,
            result:
              input.runbookOutcome === "worked"
                ? "resolved"
                : input.runbookOutcome === "partial"
                  ? "partial"
                  : "failed",
          },
        ];
        rb.resolvedCount = rb.outcomes.filter((o) => o.result === "resolved").length;
        rb.attemptedCount = rb.outcomes.length;
        rb.relatedIncidentIds = Array.from(
          new Set([...rb.relatedIncidentIds, input.incidentId]),
        );
      }
    }

    // Memory match count for the incident increments too.
    const inc = incidents.find((i) => i.id === input.incidentId);
    if (inc) inc.memoryMatches += 1;
    return { ...record };
  }

  async createPostmortem(input: NewPostmortemInput): Promise<Postmortem> {
    await latency(300, 700);
    const pm: Postmortem = {
      id: localId("pm"),
      incidentId: input.incidentId,
      title: input.title,
      impact: input.impact,
      rootCause: input.rootCause,
      timeline: input.timeline,
      resolution: input.resolution,
      contributingFactors: input.contributingFactors,
      preventiveActions: input.preventiveActions,
      lessonsLearned: input.lessonsLearned,
      addedToMemory: true,
      createdAt: new Date().toISOString(),
    };
    postmortems.unshift(pm);

    // Lessons become a searchable memory ("learns from post-mortems").
    const incident = incidents.find((i) => i.id === input.incidentId);
    const lessonsMemory: MemoryRecord = {
      id: localId("M"),
      title: `Lessons learned: ${input.title}`,
      type: "postmortem",
      source: "postmortem",
      service: incident?.service ?? "Unknown",
      createdAt: new Date().toISOString(),
      severity: incident?.severity,
      incidentRef: input.incidentId,
      postmortemRef: pm.id,
      symptoms: [],
      rootCause: input.rootCause,
      resolution: input.preventiveActions,
      lessons: input.lessonsLearned,
      outcome: "Knowledge extracted from postmortem.",
      relevance: 90,
      sessionCreated: true,
      tier: "hot",
    };
    memories.unshift(lessonsMemory);
    return { ...pm };
  }

  async askAssistant(
    incidentId: string,
    question: string,
  ): Promise<AssistantAnswer> {
    await latency(500, 900);
    const q = question.toLowerCase();
    const base: AssistantAnswer = {
      answer: "Based on current logs and service health, monitoring is the safest action.",
      evidence: ["Log stream shows active errors consistent with the alert"],
      historicalContext: ["No stronger historical match found for this phrasing"],
    };
    if (incidentId !== "INC-00241") return base;

    if (q.includes("why") && q.includes("happen")) {
      return {
        answer:
          "Payment API is returning 503s because the PostgreSQL connection pool is saturated at 100/100. Charge requests wait on the pool and time out.",
        evidence: [
          "Pool metrics show 100 active connections, 47 waiting",
          "Logs show 'Maximum pool size reached' immediately before each 503",
        ],
        historicalContext: [
          "INC-00172: same saturation pattern, resolved by raising the pool",
        ],
        relatedMemoryId: "M-18291",
        relatedRunbookId: "rb-db-pool",
      };
    }
    if (q.includes("seen") || q.includes("similar")) {
      return {
        answer:
          "Yes. Hindsight holds 4 closely related incidents; the closest is INC-00172 (92% demo relevance) — same service, same 503 symptoms, same root cause.",
        evidence: [
          "Top match shares service, error class and pool symptoms",
          "Historical resolution increased the pool 50 → 100",
        ],
        historicalContext: [
          "INC-00172 (92%) · INC-00145 (87%) · INC-00091 (81%)",
          "INC-00118 is a negative memory: restart-only response failed",
        ],
        relatedMemoryId: "M-18291",
      };
    }
    if (q.includes("fix") || q.includes("resolved") || q.includes("previous")) {
      return {
        answer:
          "The previous fix was raising the connection pool limit (50 → 100) and rolling the service. It resolved INC-00172 in 11 minutes.",
        evidence: [
          "Pool limit change preceded error-rate recovery by 6 minutes",
          "Restart alone failed in INC-00118 (recurred within 20 minutes)",
        ],
        historicalContext: ["Runbook effectiveness: resolved 5 of 6 incidents"],
        relatedRunbookId: "rb-db-pool",
        relatedMemoryId: "M-18291",
      };
    }
    if (q.includes("runbook")) {
      return {
        answer:
          "Use the Database Connection Pool Exhaustion runbook. It resolved 5 of 6 past incidents; the failure (INC-00118) was restart-only.",
        evidence: ["Outcome ledger tracks worked / partial / failed per incident"],
        historicalContext: ["Most recent successful use: INC-00145 (May 2026)"],
        relatedRunbookId: "rb-db-pool",
      };
    }
    if (q.includes("next") || q.includes("do")) {
      return {
        answer:
          "Confirm pool saturation, raise the limit to 100, do a rolling restart, then watch the 503 rate. Skip restart-only — it failed before.",
        evidence: ["Remediation list is ordered by historical success"],
        historicalContext: ["Estimated time saved vs. median: ~12 min (demo)"],
        relatedRunbookId: "rb-db-pool",
      };
    }
    return base;
  }

  private clone<T>(value: T): T {
    return structuredClone(value);
  }
}
