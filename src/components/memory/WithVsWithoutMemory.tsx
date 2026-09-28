import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit, CircleX, HelpCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const VAGUE = ["Database", "Network", "Application", "Authentication", "Infrastructure"];

export function WithVsWithoutMemory({ className }: { className?: string }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      {/* WITHOUT */}
      <Card className="gap-0 border-border/70 bg-card p-5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-faint/10 text-faint">
            <HelpCircle className="size-4" />
          </span>
          <h3 className="text-sm font-semibold text-muted-foreground">Without memory</h3>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          New incident detected. The engineer starts from a vague list:
        </p>
        <ul className="mt-3 space-y-1.5">
          {VAGUE.map((c) => (
            <li
              key={c}
              className="flex items-center gap-2 rounded-md border border-border/70 bg-bg-secondary px-3 py-1.5 text-sm text-muted-foreground"
            >
              <CircleX className="size-3.5 text-faint" />
              {c}
              <span className="ml-auto text-[10px] text-faint">? %</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-faint">
          Every hypothesis must be checked by hand. Median resolution: ~27 min (demo).
        </p>
      </Card>

      {/* WITH */}
      <Card className="relative gap-0 overflow-hidden border-memory/40 bg-gradient-to-b from-memory/[0.08] to-card p-5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-memory/15 text-memory">
            <BrainCircuit className="size-4" />
          </span>
          <h3 className="text-sm font-semibold text-foreground">With Hindsight memory</h3>
          <span className="ml-auto rounded-full border border-memory/30 bg-memory/10 px-2 py-0.5 text-[10px] font-medium text-memory">
            4 matches
          </span>
        </div>

        {!revealed ? (
          <div className="mt-8 flex flex-col items-center gap-2 pb-6 text-center">
            <SearchPulse />
            <p className="text-xs text-muted-foreground">Searching Hindsight…</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-3 space-y-2.5"
          >
            <div className="rounded-md border border-memory/30 bg-memory/10 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-memory">
                Closest historical match
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">
                INC-00172 <span className="text-memory">92%</span>
              </p>
            </div>
            <div className="rounded-md border border-critical/20 bg-critical/5 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-critical/80">
                Previous root cause
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                Database connection exhaustion
              </p>
            </div>
            <div className="rounded-md border border-success/20 bg-success/5 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-success/80">
                Previous successful fix
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                Increase connection pool (50 → 100), rolling restart
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-faint">
              <Sparkles className="size-3 text-memory" />
              Resolution time with context: 11 min (demo) — 59% faster than the no-memory path.
            </p>
          </motion.div>
        )}
      </Card>
    </div>
  );
}

function SearchPulse() {
  return (
    <span className="relative flex size-6 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-memory/30" />
      <BrainCircuit className="relative size-4 text-memory" />
    </span>
  );
}
