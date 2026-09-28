import { Button } from "@/components/ui/button";
import { useAppStore, DEMO_STEPS } from "@/store/useAppStore";
import { AnimatePresence, motion } from "framer-motion";
import { Film, Pause, Play, RotateCcw, SkipForward, X } from "lucide-react";

export function DemoController() {
  const { demo, demoPause, demoResume, demoRestart, demoSkip, demoExit } = useAppStore();

  if (demo.status === "idle") return null;
  const total = DEMO_STEPS.length;
  const narration = DEMO_STEPS[demo.step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        role="region"
        aria-label="Demo controls"
        className="fixed bottom-4 left-1/2 z-50 flex w-[min(94vw,680px)] -translate-x-1/2 flex-col gap-2 rounded-xl border border-memory/40 bg-popover/95 p-3 shadow-2xl backdrop-blur"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-memory/15 text-memory">
            <Film className="size-4" />
          </span>
          <span className="text-xs font-semibold text-foreground">
            Demo Step {demo.step + 1} / {total}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{narration}</span>
          <span className="flex items-center gap-1">
            {demo.status === "running" ? (
              <Button variant="outline" size="icon-sm" onClick={demoPause} aria-label="Pause demo">
                <Pause className="size-3.5" />
              </Button>
            ) : demo.status === "paused" ? (
              <Button variant="outline" size="icon-sm" onClick={demoResume} aria-label="Resume demo">
                <Play className="size-3.5" />
              </Button>
            ) : null}
            <Button variant="outline" size="icon-sm" onClick={demoSkip} aria-label="Skip step">
              <SkipForward className="size-3.5" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={demoRestart} aria-label="Restart demo">
              <RotateCcw className="size-3.5" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={demoExit} aria-label="Exit demo">
              <X className="size-3.5" />
            </Button>
          </span>
        </div>
        {/* progress dots */}
        <div className="flex gap-1" aria-hidden>
          {DEMO_STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < demo.step ? "bg-memory" : i === demo.step ? "bg-memory/60" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        {demo.status === "finished" && (
          <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-center text-xs font-medium text-success">
            Incident resolved. New memory created. IncidentIQ is now better prepared for
            the next incident.
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
