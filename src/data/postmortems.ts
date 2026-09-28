import type { Postmortem } from "@/types/incident-iq";

export const postmortems: Postmortem[] = [
  {
    id: "pm-00172",
    incidentId: "INC-00172",
    title: "Payment API Outage — June 2026",
    impact: "~9,800 users unable to complete purchases for 23 minutes.",
    rootCause: "Database connection exhaustion after launch traffic exceeded pool sizing.",
    timeline: [
      { time: "09:14:02", event: "503 rate crossed 5% (detected)" },
      { time: "09:14:40", event: "Pool utilization reached 100%" },
      { time: "09:19:30", event: "Pool increase 50 → 100 applied" },
      { time: "09:31:00", event: "503 rate back to 0%" },
    ],
    resolution: "Connection pool limit raised from 50 to 100; pods rolled.",
    contributingFactors: [
      "Pool sized for pre-launch traffic",
      "No load test covering pool saturation",
      "Config drift between staging and production limits",
    ],
    preventiveActions: [
      "Capacity review before traffic events",
      "Saturation scenario added to load test suite",
      "Drift guardrail for pool limits",
    ],
    lessonsLearned: [
      "Restart-only responses fail for capacity-shaped incidents",
      "Pool limits are launch-blocking configuration",
    ],
    addedToMemory: true,
    createdAt: "2026-06-19T16:00:00",
  },
  {
    id: "pm-00145",
    incidentId: "INC-00145",
    title: "Payment Service Unavailable — May 2026",
    impact: "~4,100 payment failures over 18 minutes.",
    rootCause: "Connection saturation from long-running payout transactions.",
    timeline: [
      { time: "14:03:11", event: "Timeouts began on payment endpoints" },
      { time: "14:08:20", event: "Payout job identified holding transactions" },
      { time: "14:18:00", event: "Pool tuning applied; instances restarted" },
      { time: "14:21:00", event: "Error rate recovered" },
    ],
    resolution: "Idle timeout and max-lifetime tuning plus instance restart.",
    contributingFactors: [
      "Batch job without transaction duration caps",
      "Idle timeout too generous for traffic profile",
    ],
    preventiveActions: [
      "Batch jobs enforce transaction caps",
      "Idle timeout monitored as first-class metric",
    ],
    lessonsLearned: ["Long transactions are pool poison under load"],
    addedToMemory: true,
    createdAt: "2026-05-03T10:00:00",
  },
  {
    id: "pm-00195",
    incidentId: "INC-00195",
    title: "Authentication Slowness — July 2026",
    impact: "Login p99 latency above 900ms for 40 minutes.",
    rootCause: "Verification burst outpacing JWKS cache during campaign.",
    timeline: [
      { time: "10:02:00", event: "Latency alert fired" },
      { time: "10:06:00", event: "Campaign correlation identified" },
      { time: "10:20:00", event: "JWKS pre-warm deployed" },
      { time: "10:42:00", event: "Latency normalized" },
    ],
    resolution: "JWKS cache pre-warming before campaigns.",
    contributingFactors: ["Campaign calendar not linked to ops readiness"],
    preventiveActions: ["Campaigns require pre-warm checklist"],
    lessonsLearned: ["Predictable traffic events deserve predictable prep"],
    addedToMemory: true,
    createdAt: "2026-07-31T09:00:00",
  },
];
