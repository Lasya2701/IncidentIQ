import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/services";
import { notify } from "@/store/useAppStore";
import type { Incident } from "@/types/incident-iq";
import { motion } from "framer-motion";
import { BrainCircuit, CircleCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const STAGES = [
  "Resolving incident",
  "Incident resolved",
  "Extracting knowledge",
  "Creating memory",
  "Saving to Hindsight",
  "Memory created",
];

export function ResolveFlow({
  open,
  onClose,
  incident,
  onResolved,
  autoConfirm = false,
}: {
  open: boolean;
  onClose: () => void;
  incident: Incident;
  onResolved: () => void;
  /** Demo mode: auto-driven but real UI — confirms after a visible beat. */
  autoConfirm?: boolean;
}) {
  const [phase, setPhase] = useState<"confirm" | "progress" | "done">("confirm");
  const [stage, setStage] = useState(0);

  const confirm = async () => {
    setPhase("progress");
    await api.resolveIncident(incident.id);
    // Staged reveal
    for (let i = 0; i < STAGES.length; i++) {
      setStage(i);
      await new Promise((r) => setTimeout(r, 520));
    }
    notify("memory", "Memory extracted", `${incident.id} knowledge stored in Hindsight.`);
    setPhase("done");
  };

  useEffect(() => {
    if (open) {
      setPhase("confirm");
      setStage(0);
    }
  }, [open]);

  // Auto-confirm for the scripted demo (step 10) after a short visible beat.
  useEffect(() => {
    if (!open || !autoConfirm || phase !== "confirm") return;
    const t = setTimeout(() => {
      void confirm();
    }, 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoConfirm, phase]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && phase !== "progress" && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {phase === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Resolve {incident.id}?</DialogTitle>
              <DialogDescription>
                IncidentIQ will use the confirmed diagnosis and extract this incident
                into memory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 rounded-lg border border-border bg-bg-secondary p-4 text-sm">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
                  Current diagnosis
                </p>
                <p className="mt-1 font-medium text-foreground">
                  Database connection pool exhaustion
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
                  Chosen resolution
                </p>
                <p className="mt-1 font-medium text-foreground">
                  Connection pool limit raised 50 → 100; rolling restart applied; 503
                  rate monitored to &lt;1%.
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-memory">
                  Historical evidence
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {["INC-00172 (92%)", "INC-00145 (87%)", "INC-00091 (81%)"].map((m) => (
                    <span
                      key={m}
                      className="rounded border border-memory/30 bg-memory/10 px-1.5 py-0.5 font-mono text-[10px] text-memory"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={confirm} className="bg-success text-white hover:bg-success/90">
                <CircleCheck className="size-4" /> Confirm Resolution
              </Button>
            </DialogFooter>
          </>
        )}

        {phase === "progress" && (
          <div className="py-4">
            <DialogTitle className="text-base">Resolving {incident.id}</DialogTitle>
            <ul className="mt-4 space-y-2.5">
              {STAGES.map((s, i) => (
                <li key={s} className="flex items-center gap-2.5 text-sm">
                  {i < stage ? (
                    <CircleCheck className="size-4 shrink-0 text-success" />
                  ) : i === stage ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-memory" />
                  ) : (
                    <span className="size-4 shrink-0 rounded-full border border-border" />
                  )}
                  <span className={i <= stage ? "text-foreground" : "text-faint"}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {phase === "done" && (
          <div className="py-2 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success"
            >
              <CircleCheck className="size-8" />
            </motion.div>
            <DialogTitle className="mt-3 text-lg">Incident Resolved</DialogTitle>
            <DialogDescription className="mt-1.5 flex items-center justify-center gap-1.5">
              <BrainCircuit className="size-4 text-memory" />
              IncidentIQ has learned from this incident.
            </DialogDescription>
            <DialogFooter className="mt-4 justify-center">
              <Button onClick={onResolved}>Create Incident Memory</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
