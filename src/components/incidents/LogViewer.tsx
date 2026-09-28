import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LogLine } from "@/types/incident-iq";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Pause,
  Play,
  ScrollText,
} from "lucide-react";

const LEVEL_STYLE: Record<LogLine["level"], string> = {
  ERROR: "text-critical",
  WARN: "text-warning",
  INFO: "text-info",
};

/** Generates additional synthetic lines to simulate a live stream. */
function makeStreamLine(index: number, incidentId: string): LogLine {
  const now = new Date();
  const pad = (v: number) => String(v).padStart(2, "0");
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const variants: Omit<LogLine, "id" | "time">[] = [
    { level: "ERROR", service: "ConnectionPool", message: "Maximum pool size reached (100)", detail: "pool=payments-primary waiting=47" },
    { level: "WARN", service: "PaymentAPI", message: "503 response returned", detail: "route=/v1/charges" },
    { level: "ERROR", service: "PaymentService", message: "Database connection timeout after 5000ms", detail: "pool=payments-primary" },
    { level: "INFO", service: "HindsightAgent", message: "memory context injected", detail: "memories=4" },
    { level: "WARN", service: "PostgreSQL", message: "connections near max_connections", detail: "current=99" },
  ];
  const v = variants[index % variants.length];
  return { id: `stream-${index}-${incidentId}`, time, ...v };
}

export function LogViewer({
  lines,
  incidentId,
  live = true,
  className,
}: {
  lines: LogLine[];
  incidentId: string;
  live?: boolean;
  className?: string;
}) {
  const [allLines, setAllLines] = useState<LogLine[]>(lines);
  const [paused, setPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [levelFilter, setLevelFilter] = useState<"ALL" | LogLine["level"]>("ALL");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const counter = useRef(0);

  useEffect(() => {
    setAllLines(lines);
  }, [lines]);

  useEffect(() => {
    if (!live || paused) return;
    const t = setInterval(() => {
      counter.current += 1;
      setAllLines((prev) => [...prev.slice(-200), makeStreamLine(counter.current, incidentId)]);
    }, 2200);
    return () => clearInterval(t);
  }, [live, paused, incidentId]);

  useEffect(() => {
    if (autoScroll && scrollRef.current && !paused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allLines, autoScroll, paused]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allLines.filter((l) => {
      if (levelFilter !== "ALL" && l.level !== levelFilter) return false;
      if (q && !`${l.message} ${l.service} ${l.detail ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allLines, levelFilter, query]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(
        filtered.map((l) => `${l.time} ${l.level} ${l.service}: ${l.message}`).join("\n"),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-[#0a0f16]", className)}>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <ScrollText className="size-3.5" /> Logs
        </span>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter logs…"
          aria-label="Filter logs"
          className="h-7 w-40 border-border/70 bg-card px-2 text-xs md:w-52"
        />
        <div className="flex items-center gap-1" role="group" aria-label="Log level filter">
          {(["ALL", "ERROR", "WARN", "INFO"] as const).map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setLevelFilter(lv)}
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold transition-colors",
                levelFilter === lv
                  ? "bg-secondary text-foreground"
                  : "text-faint hover:text-muted-foreground",
              )}
            >
              {lv}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
            onClick={() => setAutoScroll((a) => !a)}
            aria-pressed={autoScroll}
            title="Toggle auto-scroll"
          >
            {autoScroll ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
            Auto
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
          >
            {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
            onClick={copyAll}
          >
            {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
            Copy
          </Button>
        </div>
      </div>

      {/* lines */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2"
        style={{ maxHeight: className?.includes("h-") ? undefined : 320 }}
      >
        {filtered.length === 0 ? (
          <p className="py-8 text-center font-mono text-xs text-faint">No matching log lines.</p>
        ) : (
          <ul className="space-y-0.5 font-mono text-[11px] leading-relaxed">
            {filtered.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === l.id ? undefined : l.id)}
                  className="flex w-full items-start gap-2 rounded px-1 py-0.5 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <span className="shrink-0 text-faint">{l.time}</span>
                  <span className={cn("w-10 shrink-0 font-semibold", LEVEL_STYLE[l.level])}>
                    {l.level}
                  </span>
                  <span className="w-28 shrink-0 truncate text-muted-foreground">{l.service}</span>
                  <span className="min-w-0 flex-1 text-foreground/90">{l.message}</span>
                </button>
                {expanded === l.id && l.detail && (
                  <p className="ml-[13.5rem] rounded bg-white/[0.03] px-2 py-1 text-[10px] text-muted-foreground">
                    {l.detail}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/70 px-3 py-1.5 text-[10px] text-faint">
        <span className="tnum">
          {filtered.length} lines {paused && "· paused"}
        </span>
        <span className="font-mono">{incidentId} · stream: synthetic</span>
      </div>
    </div>
  );
}
