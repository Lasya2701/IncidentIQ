import { useEffect, useRef } from "react";
import { api } from "@/services";
import { notify, useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

/**
 * Owns the scripted demo: auto-advance timing, hold (scripted waits for real
 * user-visible flows like the resolve modal), and per-step side effects that
 * act through the real service layer so step 15 reads live store state.
 *
 * The hook never touches component state — the workspace syncs from the same
 * demo store, so Pause/Resume/Skip work everywhere.
 */
export function useDemoRunner(active: boolean) {
  const demo = useAppStore((s) => s.demo);
  const demoAdvance = useAppStore((s) => s.demoAdvance);
  const demoExit = useAppStore((s) => s.demoExit);
  const demoSetMemory = useAppStore((s) => s.demoSetMemory);
  const demoSetHold = useAppStore((s) => s.demoSetHold);
  const setAiPhase = useAppStore((s) => s.setAiPhase);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sideEffectRun = useRef<number>(-1);
  const memoryCreatedForRun = useRef<number>(-1);

  // Reset per-run bookkeeping when a new run starts.
  useEffect(() => {
    sideEffectRun.current = -1;
    memoryCreatedForRun.current = -1;
  }, [demo.runId]);

  // Auto-advance through steps while running and not held.
  useEffect(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (!active || demo.status !== "running" || demo.hold) return;

    if (demo.step >= 14) {
      // Final step lingers so judges can read the closing message, then exits.
      advanceTimer.current = setTimeout(() => demoExit(), 9000);
      return () => {
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
      };
    }

    advanceTimer.current = setTimeout(() => {
      demoAdvance();
    }, 3600);

    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, demo.status, demo.step, demo.hold, demo.runId]);

  // Per-step side effects (each fires once per run).
  useEffect(() => {
    if (!active || demo.status !== "running") return;
    if (sideEffectRun.current === demo.runId * 100 + demo.step) return;
    sideEffectRun.current = demo.runId * 100 + demo.step;

    const step = demo.step;
    const markResolvedAndHold = () => {
      // Hold the script while the resolve flow (real UI) completes.
      demoSetHold(true);
    };

    if (step === 1) {
      setAiPhase("INC-00241", "analyzing");
      notify("critical", "Demo: Payment API incident", "INC-00241 detected — 503 spike.");
    }
    if (step === 3) {
      setAiPhase("INC-00241", "diagnosed");
      toast.success("Demo: root cause identified", {
        description: "Database connection pool exhaustion",
      });
    }
    if (step === 4) {
      toast("Demo: searching 12,482 memories…", {
        description: "Hindsight recall in progress.",
      });
    }
    if (step === 5) {
      toast.success("Demo: 4 similar incidents found", {
        description: "Top match INC-00172 at 92%.",
      });
    }
    if (step === 8) {
      toast("Demo: remediation recommended", {
        description: "5 steps, each citing a historical incident.",
      });
    }
    if (step === 9) {
      // The workspace opens the real Resolve confirmation modal on step 10;
      // hold here so the auto-confirm + resolution completes before the script
      // continues. The workspace releases the hold via onResolved.
      markResolvedAndHold();
    }
    if (step === 11) {
      toast.success("Demo: incident resolved");
    }
    if (step === 12) {
      // Create the memory through the real service so step 15 reads it from
      // the store. Guard against duplicate creation across skips/restarts.
      if (memoryCreatedForRun.current !== demo.runId) {
        memoryCreatedForRun.current = demo.runId;
        void (async () => {
          const memory = await api.createMemory({
            incidentId: "INC-00241",
            title: "Payment API 503 spike — pool exhaustion (demo run)",
            service: "Payment API",
            symptoms: ["HTTP 503 on charges", "Pool at limit", "DB utilization 100%"],
            rootCause: "Database connection pool exhaustion",
            investigation: ["Logs showed pool saturation preceding 503s"],
            resolution: ["Pool limit 50 → 100", "Rolling restart", "Monitored 503 rate"],
            runbookId: "rb-db-pool",
            runbookOutcome: "worked",
            outcome: "Resolved in demo run; 503 rate recovered.",
            preventiveActions: ["Capacity review gate"],
            lessons: ["Raise pool before restart-only response"],
            severity: "critical",
          });
          demoSetMemory(memory.id);
          useAppStore.getState().onMemoryCreated();
          notify("memory", "Demo: new memory created", `${memory.id} stored in Hindsight.`);
        })();
      }
    }
    if (step === 13) {
      useAppStore.getState().demoActivateSecondIncident();
      void api.ensureDemoSecondIncident();
      toast("Demo: INC-00243 appeared", {
        description: "Order Service timeouts from pool saturation.",
      });
    }
    if (step === 14) {
      toast.success("Demo: historical pattern recognized immediately", {
        description: "The memory created moments ago is now the top match.",
      });
      void api.getSimilarIncidents("INC-00243").then((matches) => {
        const createdId = useAppStore.getState().demo.demoMemoryId;
        const top = matches.find((m) => m.memory.id === createdId) ?? matches[0];
        if (top) {
          toast.success(`Top match: ${top.memory.incidentRef ?? top.memory.id} (${top.score}%)`, {
            description: top.memory.sessionCreated
              ? "This memory was created moments ago in this session."
              : top.memory.title,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, demo.status, demo.step, demo.runId]);
}
