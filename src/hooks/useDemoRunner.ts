import { useEffect, useRef } from "react";
import { api } from "@/services";
import { notify, useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

/**
 * Watches the demo state machine and performs the scripted actions for each
 * step. Real UI state is driven where possible (AI phase store, notifications,
 * toasts); the workspace reacts to the same demo.step to sync its panels.
 *
 * Step timing is approximate (~60s total); Pause/Resume work by suspending the
 * advance timer.
 */
export function useDemoRunner(active: boolean) {
  const demo = useAppStore((s) => s.demo);
  const demoAdvance = useAppStore((s) => s.demoAdvance);
  const demoExit = useAppStore((s) => s.demoExit);
  const demoSetMemory = useAppStore((s) => s.demoSetMemory);
  const setAiPhase = useAppStore((s) => s.setAiPhase);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepDone = useRef<number>(-1);

  // Auto-advance through steps while running.
  useEffect(() => {
    if (!active || demo.status !== "running") {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      return;
    }
    if (demo.step >= 14) {
      demoExit();
      return;
    }
    if (stepDone.current === demo.step) return;
    stepDone.current = demo.step;

    advanceTimer.current = setTimeout(() => {
      demoAdvance();
    }, 3600);

    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, demo.status, demo.step]);

  // Side effects per step.
  useEffect(() => {
    if (!active || demo.status !== "running") return;

    const step = demo.step;
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
      toast("Demo: searching 12,482 memories…", { description: "Hindsight recall in progress." });
    }
    if (step === 5) {
      toast.success("Demo: 4 similar incidents found", { description: "Top match INC-00172 at 92%." });
    }
    if (step === 8) {
      toast("Demo: remediation recommended", {
        description: "5 steps, each citing a historical incident.",
      });
    }
    if (step === 11) {
      toast.success("Demo: incident resolved");
    }
    if (step === 12) {
      // Create the memory through the real service so step 15 reads it from the store.
      (async () => {
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
  }, [active, demo.status, demo.step]);
}
