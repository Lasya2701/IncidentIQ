import { create } from "zustand";
import type {
  AppNotification,
  Incident,
  NotificationKind,
} from "@/types/incident-iq";
import { localId } from "@/utils/seeded";

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export interface NotificationState {
  notifications: AppNotification[];
  pushNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

function makeNotification(
  n: Omit<AppNotification, "id" | "createdAt" | "read">,
): AppNotification {
  return {
    ...n,
    id: localId("n"),
    createdAt: new Date().toISOString(),
    read: false,
  };
}

/* ------------------------------------------------------------------ */
/* AI phase per incident                                               */
/* ------------------------------------------------------------------ */

export type AiPhase =
  | "idle"
  | "analyzing"
  | "diagnosed"
  | "hindsight_error"
  | "llm_error";

/* ------------------------------------------------------------------ */
/* Demo state machine                                                  */
/* ------------------------------------------------------------------ */

export const DEMO_STEPS = [
  "Payment API incident appears",
  "Status → AI investigating",
  "Live logs stream in",
  "AI identifies connection pool exhaustion",
  "Hindsight search — 12,482 memories",
  "4 similar incidents appear",
  "Closest incident (INC-00172) expands",
  "Previous resolution appears",
  "AI recommends remediation",
  "Resolve Incident",
  "Incident resolved",
  "Knowledge extraction",
  "New memory created and saved",
  "A second, similar incident appears (INC-00243)",
  "New memory retrieved as top match",
] as const;

export type DemoStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export type DemoStatus = "idle" | "running" | "paused" | "finished";

export interface DemoIncident extends Incident {
  isDemoSecond?: boolean;
}

export interface DemoState {
  status: DemoStatus;
  step: DemoStepIndex;
  /** New memory created during the demo (id of store record). */
  demoMemoryId?: string;
  /** Whether the second incident INC-00243 exists. */
  secondIncidentActive: boolean;
  /** Holds scripted auto-advance (e.g. while the resolve modal awaits confirmation). */
  hold: boolean;
  /** Increments on start/restart so per-step side effects can re-fire cleanly. */
  runId: number;
}

/* ------------------------------------------------------------------ */
/* Main store                                                          */
/* ------------------------------------------------------------------ */

export interface SessionMetrics {
  memoryRetrievals: number;
  memoriesTotal: number;
  newMemoriesThisSession: number;
}

interface AppStore extends NotificationState {
  // session
  userName: string;
  environment: "Production" | "Staging" | "Development";
  setEnvironment: (e: AppStore["environment"]) => void;

  // session metrics (demo counters)
  metrics: SessionMetrics;
  bumpRetrievals: () => void;
  onMemoryCreated: () => void;

  // AI phase per incident
  aiPhase: Record<string, AiPhase>;
  setAiPhase: (incidentId: string, phase: AiPhase) => void;

  // memory drawer
  memoryDrawerId: string | undefined;
  openMemoryDrawer: (id: string) => void;
  closeMemoryDrawer: () => void;

  // demo
  demo: DemoState;
  demoStart: () => void;
  demoPause: () => void;
  demoResume: () => void;
  demoRestart: () => void;
  demoSkip: () => void;
  demoExit: () => void;
  demoAdvance: () => void;
  demoSetMemory: (memoryId: string) => void;
  demoSetHold: (hold: boolean) => void;
  demoActivateSecondIncident: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  userName: "Lasya",
  environment: "Production",
  setEnvironment: (environment) => set({ environment }),

  notifications: [
    {
      id: "seed-1",
      kind: "critical",
      title: "Payment API incident detected",
      body: "INC-00241 — HTTP 503 rate 18.2%, ~12,400 users impacted.",
      createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
      read: false,
    },
    {
      id: "seed-2",
      kind: "ai",
      title: "AI diagnosis completed",
      body: "Root cause identified for INC-00240 (authentication latency).",
      createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
      read: false,
    },
    {
      id: "seed-3",
      kind: "memory",
      title: "New incident memory created",
      body: "Order Service regression resolved and stored in Hindsight.",
      createdAt: new Date(Date.now() - 41 * 60000).toISOString(),
      read: true,
    },
  ],
  pushNotification: (n) =>
    set((s) => ({
      notifications: [makeNotification(n), ...s.notifications].slice(0, 30),
    })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((x) =>
        x.id === id ? { ...x, read: true } : x,
      ),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((x) => ({ ...x, read: true })),
    })),
  clearAll: () => set({ notifications: [] }),

  metrics: {
    memoryRetrievals: 1284,
    memoriesTotal: 12482,
    newMemoriesThisSession: 0,
  },
  bumpRetrievals: () =>
    set((s) => ({
      metrics: { ...s.metrics, memoryRetrievals: s.metrics.memoryRetrievals + 1 },
    })),
  onMemoryCreated: () =>
    set((s) => ({
      metrics: {
        ...s.metrics,
        memoriesTotal: s.metrics.memoriesTotal + 1,
        newMemoriesThisSession: s.metrics.newMemoriesThisSession + 1,
      },
    })),

  aiPhase: {},
  setAiPhase: (incidentId, phase) =>
    set((s) => ({ aiPhase: { ...s.aiPhase, [incidentId]: phase } })),

  memoryDrawerId: undefined,
  openMemoryDrawer: (memoryDrawerId) => set({ memoryDrawerId }),
  closeMemoryDrawer: () => set({ memoryDrawerId: undefined }),

  demo: {
    status: "idle",
    step: 0,
    demoMemoryId: undefined,
    secondIncidentActive: false,
    hold: false,
    runId: 0,
  },
  demoStart: () =>
    set((s) => ({
      demo: {
        status: "running",
        step: 0,
        demoMemoryId: undefined,
        secondIncidentActive: false,
        hold: false,
        runId: s.demo.runId + 1,
      },
    })),
  demoPause: () =>
    set((s) =>
      s.demo.status === "running" ? { demo: { ...s.demo, status: "paused" } } : s,
    ),
  demoResume: () =>
    set((s) =>
      s.demo.status === "paused" ? { demo: { ...s.demo, status: "running" } } : s,
    ),
  demoRestart: () =>
    set((s) => ({
      demo: {
        status: "running",
        step: 0,
        demoMemoryId: undefined,
        secondIncidentActive: false,
        hold: false,
        runId: s.demo.runId + 1,
      },
    })),
  demoSkip: () => {
    const { demo } = get();
    if (demo.step < 14) {
      set({
        demo: {
          ...demo,
          step: (demo.step + 1) as DemoStepIndex,
          status: "running",
          hold: false,
        },
      });
    }
  },
  demoExit: () =>
    set({
      demo: {
        status: "idle",
        step: 0,
        demoMemoryId: undefined,
        secondIncidentActive: false,
        hold: false,
        runId: 0,
      },
    }),
  demoAdvance: () => {
    const { demo } = get();
    if (demo.step < 14) {
      set({ demo: { ...demo, step: (demo.step + 1) as DemoStepIndex } });
    } else if (demo.status === "running") {
      set({ demo: { ...demo, status: "finished" } });
    }
  },
  demoSetMemory: (demoMemoryId) => set((s) => ({ demo: { ...s.demo, demoMemoryId } })),
  demoSetHold: (hold) => set((s) => ({ demo: { ...s.demo, hold } })),
  demoActivateSecondIncident: () =>
    set((s) => ({ demo: { ...s.demo, secondIncidentActive: true } })),
}));

export function notify(
  kind: NotificationKind,
  title: string,
  body: string,
): void {
  useAppStore.getState().pushNotification({ kind, title, body });
}
