import { mulberry32 } from "@/utils/seeded";
import type {
  AppNotification,
  PipelineStage,
  SystemHealthEntry,
} from "@/types/incident-iq";

export const systemHealth: SystemHealthEntry[] = [
  {
    id: "hindsight",
    name: "Hindsight",
    role: "Persistent memory store (retain / recall / reflect)",
    status: "connected",
    latencyMs: 82,
    lastChecked: "5s ago",
    version: "1.18.2",
  },
  {
    id: "gbrain",
    name: "gbrain",
    role: "Knowledge graph layer",
    status: "connected",
    latencyMs: 104,
    lastChecked: "12s ago",
    version: "0.9.7",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    role: "Primary database",
    status: "connected",
    latencyMs: 38,
    lastChecked: "3s ago",
    version: "16.3",
  },
  {
    id: "sidecar",
    name: "Memory Sidecar",
    role: "Memory retrieval sidecar",
    status: "connected",
    latencyMs: 61,
    lastChecked: "7s ago",
    version: "2.3.0",
  },
  {
    id: "embeddings",
    name: "Embedding Service",
    role: "Embeds incidents and queries",
    status: "connected",
    latencyMs: 118,
    lastChecked: "9s ago",
    version: "3.1.0",
  },
  {
    id: "llm",
    name: "LLM Provider",
    role: "Diagnosis and reasoning",
    status: "connected",
    latencyMs: 640,
    lastChecked: "14s ago",
    version: "gpt-4.1 (synthetic)",
  },
  {
    id: "api-gateway",
    name: "API Gateway",
    role: "Control-plane gateway",
    status: "degraded",
    latencyMs: 142,
    lastChecked: "5s ago",
    version: "4.2.1",
  },
];

export const pipelineStages: PipelineStage[] = [
  {
    id: "session",
    name: "Session",
    status: "connected",
    latencyMs: 12,
    lastSuccess: "2s ago",
    errors24h: 0,
  },
  {
    id: "archive",
    name: "Archive",
    status: "connected",
    latencyMs: 24,
    lastSuccess: "31s ago",
    errors24h: 0,
  },
  {
    id: "extract",
    name: "Extract",
    status: "connected",
    latencyMs: 88,
    lastSuccess: "48s ago",
    errors24h: 2,
  },
  {
    id: "index",
    name: "Index",
    status: "connected",
    latencyMs: 46,
    lastSuccess: "52s ago",
    errors24h: 0,
  },
  {
    id: "hindsight",
    name: "Hindsight",
    status: "connected",
    latencyMs: 82,
    lastSuccess: "5s ago",
    errors24h: 0,
  },
  {
    id: "retrieve",
    name: "Retrieve",
    status: "connected",
    latencyMs: 74,
    lastSuccess: "8s ago",
    errors24h: 1,
  },
  {
    id: "inject",
    name: "Context Injection",
    status: "connected",
    latencyMs: 19,
    lastSuccess: "8s ago",
    errors24h: 0,
  },
];

export const integrations = [
  {
    id: "hindsight",
    name: "Hindsight",
    category: "Memory",
    connected: true,
    detail: "Retain / recall / reflect endpoints",
  },
  {
    id: "gbrain",
    name: "gbrain",
    category: "Memory",
    connected: true,
    detail: "Knowledge graph of services and incidents",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    category: "Memory",
    connected: true,
    detail: "Curated memory and operational metadata",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Collaboration",
    connected: false,
    detail: "Incident channel notifications",
  },
  {
    id: "webhook",
    name: "Webhook",
    category: "Delivery",
    connected: true,
    detail: "Alert fan-out to on-call tooling",
  },
];

export const initialNotifications: AppNotification[] = [
  {
    id: "n1",
    kind: "critical",
    title: "Payment API incident detected",
    body: "INC-00241 — HTTP 503 rate 18.2%, ~12,400 users impacted.",
    createdAt: "2026-09-28T14:32:08",
    read: false,
  },
  {
    id: "n2",
    kind: "ai",
    title: "AI diagnosis completed",
    body: "Root cause identified for INC-00240 (authentication latency).",
    createdAt: "2026-09-28T14:22:40",
    read: false,
  },
  {
    id: "n3",
    kind: "memory",
    title: "New incident memory created",
    body: "Order Service regression resolved and stored in Hindsight.",
    createdAt: "2026-09-28T13:58:12",
    read: false,
  },
  {
    id: "n4",
    kind: "system",
    title: "Hindsight latency increased",
    body: "p99 recall latency 82ms → 118ms for 6 minutes. Recovered.",
    createdAt: "2026-09-28T13:10:00",
    read: true,
  },
  {
    id: "n5",
    kind: "system",
    title: "Webhook delivery healthy",
    body: "All alert deliveries acknowledged within 2s.",
    createdAt: "2026-09-28T12:00:00",
    read: true,
  },
];

/* ------------------------------------------------------------------ */
/* Chart / analytics series (synthetic)                                */
/* ------------------------------------------------------------------ */

export interface TrendPoint {
  date: string;
  incidents: number;
  resolved: number;
  critical: number;
}

const trendRand = mulberry32(20260928);

export const trendData: TrendPoint[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 6, 1));
  d.setUTCDate(d.getUTCDate() + i);
  const wave = Math.sin(i / 9) * 2.2;
  const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
  const incidents = Math.max(
    1,
    Math.round(7 + wave + trendRand() * 5 - (weekend ? 2.5 : 0)),
  );
  const critical = Math.max(0, Math.round(trendRand() * 2.2 - (weekend ? 0.7 : 0)));
  const resolved = Math.max(0, incidents - Math.round(trendRand() * 2.4));
  return {
    date: d.toISOString().slice(0, 10),
    incidents,
    resolved,
    critical,
  };
});

export const severityDistribution = [
  { name: "Critical", value: 2, color: "#EF4444" },
  { name: "High", value: 2, color: "#F59E0B" },
  { name: "Medium", value: 3, color: "#3B82F6" },
  { name: "Low", value: 0, color: "#64748B" },
];

export const rootCauseDistribution = [
  { name: "Connection pool", value: 4, color: "#8B5CF6" },
  { name: "Deployment regression", value: 3, color: "#EF4444" },
  { name: "Cache expiry wave", value: 2, color: "#F59E0B" },
  { name: "Auth burst", value: 2, color: "#3B82F6" },
  { name: "Network", value: 2, color: "#22C55E" },
  { name: "Config drift", value: 1, color: "#64748B" },
];

export const resolutionTimeData = [
  { name: "W1", minutes: 26 },
  { name: "W2", minutes: 22 },
  { name: "W3", minutes: 19 },
  { name: "W4", minutes: 21 },
  { name: "W5", minutes: 17 },
  { name: "W6", minutes: 15 },
  { name: "W7", minutes: 16 },
  { name: "W8", minutes: 13 },
];

export const memoryGrowthData = [
  { name: "Jan", memories: 8200 },
  { name: "Feb", memories: 8650 },
  { name: "Mar", memories: 9200 },
  { name: "Apr", memories: 9700 },
  { name: "May", memories: 10450 },
  { name: "Jun", memories: 11200 },
  { name: "Jul", memories: 11750 },
  { name: "Aug", memories: 12180 },
  { name: "Sep", memories: 12482 },
];

export const retrievalFreqData = [
  { name: "W1", retrievals: 2100 },
  { name: "W2", retrievals: 2450 },
  { name: "W3", retrievals: 2620 },
  { name: "W4", retrievals: 2980 },
  { name: "W5", retrievals: 3120 },
  { name: "W6", retrievals: 3340 },
  { name: "W7", retrievals: 3610 },
  { name: "W8", retrievals: 3890 },
];

export const memoryTypeDistribution = [
  { name: "Incident resolutions", value: 1842, color: "#8B5CF6" },
  { name: "Runbooks", value: 86, color: "#3B82F6" },
  { name: "Postmortems", value: 324, color: "#22C55E" },
  { name: "Patterns", value: 612, color: "#F59E0B" },
  { name: "Decisions", value: 240, color: "#64748B" },
];

export const topRunbookUsage = [
  { name: "DB Connection Pool", uses: 14 },
  { name: "Deployment Rollback", uses: 9 },
  { name: "Auth Latency", uses: 6 },
  { name: "CrashLoopBackOff", uses: 5 },
  { name: "Redis Miss Wave", uses: 4 },
];

export const topPatterns = [
  { name: "Pool exhaustion under launch traffic", count: 6 },
  { name: "Error spike after rollout", count: 5 },
  { name: "TTL expiry waves", count: 3 },
  { name: "Burst-driven auth latency", count: 2 },
];

export const serviceReliability = [
  { name: "Payment API", uptime: 99.41 },
  { name: "Auth Service", uptime: 99.86 },
  { name: "Order Service", uptime: 99.91 },
  { name: "Gateway", uptime: 99.97 },
  { name: "Redis", uptime: 99.99 },
  { name: "PostgreSQL", uptime: 99.99 },
];

export const memoryImpactCompare = [
  { name: "Time to first hypothesis", without: 9, with: 2 },
  { name: "Time to resolution", without: 27, with: 11 },
  { name: "Diagnostic steps taken", without: 12, with: 5 },
  { name: "Context retrieved", without: 0, with: 4 },
];
