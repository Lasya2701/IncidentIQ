import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services";
import type { AssistantAnswer } from "@/types/incident-iq";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  BookOpen,
  ChevronRight,
  Loader2,
  MessagesSquare,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Why is this happening?",
  "Have we seen this before?",
  "What fixed the previous incident?",
  "Which runbook should I use?",
  "What should I do next?",
];

export function AssistantPanel({ incidentId }: { incidentId: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<AssistantAnswer | undefined>(undefined);

  const ask = async (q: string) => {
    setLoading(true);
    setAnswer(undefined);
    try {
      const a = await api.askAssistant(incidentId, q);
      setAnswer(a);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-ai/40 bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-lg transition-colors hover:border-ai"
      >
        <MessagesSquare className="size-4 text-ai" />
        Ask IncidentIQ
      </button>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      aria-label="AI assistant"
      className="fixed bottom-6 right-6 z-40 flex max-h-[70vh] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-ai/30 bg-popover shadow-2xl"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <MessagesSquare className="size-4 text-ai" />
        <p className="text-sm font-semibold">IncidentIQ Assistant</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close assistant"
          className="ml-auto rounded p-1 text-faint hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {!answer && !loading && (
          <>
            <p className="text-xs text-muted-foreground">
              Suggested questions for this incident:
            </p>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuestion(s);
                    ask(s);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-ai/40 hover:text-foreground"
                >
                  {s}
                  <ChevronRight className="size-3.5 shrink-0 text-faint" />
                </button>
              ))}
            </div>
          </>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-ai" /> Reviewing memory and logs…
          </div>
        )}

        {answer && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ai">Answer</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{answer.answer}</p>
              </div>
              <AnswerSection title="Evidence" items={answer.evidence} />
              <AnswerSection title="Historical context" items={answer.historicalContext} />
              <div className="flex flex-wrap gap-2">
                {answer.relatedMemoryId && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-memory/30 bg-memory/10 px-2 py-1 text-[10px] font-medium text-memory">
                    <BrainCircuit className="size-3" /> Related memory: {answer.relatedMemoryId}
                  </span>
                )}
                {answer.relatedRunbookId && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-info/25 bg-info/10 px-2 py-1 text-[10px] font-medium text-info">
                    <BookOpen className="size-3" /> Runbook: {answer.relatedRunbookId}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim()) ask(question);
        }}
      >
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this incident…"
          aria-label="Ask the assistant"
          className="h-8 border-border bg-card text-xs"
        />
        <Button type="submit" size="icon-sm" disabled={loading} className="bg-ai text-white hover:bg-ai/90">
          <Send className="size-3.5" />
        </Button>
      </form>
    </motion.aside>
  );
}

function AnswerSection({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className={cn()}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">{title}</p>
      <ul className="mt-1 space-y-1">
        {items.map((i) => (
          <li key={i} className="text-xs text-muted-foreground">
            • {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
