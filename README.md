# IncidentIQ

**AI Incident Response That Remembers.**

> The first time it sees an incident, it investigates. The next time, it remembers.

IncidentIQ is an SRE incident command center where the AI is embedded in the incident
workflow. Its differentiator is **persistent memory** — a layer called **Hindsight** that
retains every incident, root cause, resolution, runbook outcome and postmortem lesson,
then recalls it the moment a similar incident appears.

All data in this build is **synthetic demo data**. Scores are labelled "demo relevance"
and are never presented as validated accuracy.

## The loop (visible everywhere in the UI)

```
Incident → Memory search → Similar past incidents → Diagnosis → Fix
→ Resolve → Postmortem → New memory → Better next response
```

## Setup

```bash
bun install
bun run dev        # dev server (managed by the platform)
bun tsc -b --noEmit  # typecheck
bun eslint src       # lint
```

## Mock vs. real provider

UI components only call the async functions in `src/services/` — never the mock data
directly. The active provider is selected in `src/services/index.ts`:

| Setting | Provider |
| --- | --- |
| `VITE_USE_MOCK=true` (default) | `MockMemoryProvider` — typed mock with 150–900 ms simulated latency, failure injection via `?fail=hindsight` or `?fail=llm` |
| `VITE_USE_MOCK=false` + `VITE_IIQ_API_URL` set | `HindsightHttpProvider` — stub with TODOs, ready to wire to the real backend |

### Intended production flow

```
Frontend → Backend API → Memory Sidecar → Hindsight (retain / recall / reflect)
                                        → gbrain · PostgreSQL
```

This diagram is also rendered on the System Health page. The frontend never calls
Hindsight directly.

### Failure injection

Append `?fail=hindsight` (memory retrieval errors, diagnosis continues without
history) or `?fail=llm` (AI provider errors, logs/runbooks remain usable) to any URL
to demo the error states.

## Demo script (~60s)

Launch from the dashboard button, the command palette ("Launch Demo"), or
`/workspace?demo=1`. A control bar shows `Demo Step N / 15` with Play / Pause /
Restart / Skip / Exit.

1. Payment API incident appears (INC-00241)
2. Status → AI investigating
3. Live logs stream
4. AI identifies connection pool exhaustion
5. Hindsight search — "Searching 12,482 memories…"
6. 4 similar incidents appear
7. Closest match (INC-00172, 92%) expands
8. Previous resolution appears (pool 50 → 100)
9. AI recommends 5 remediation steps, each citing history
10. Resolve Incident (real confirmation modal, auto-driven)
11. Incident resolved
12. Knowledge extraction — memory created through the real service layer
13. New memory saved to Hindsight (runbook effectiveness 5/6 → 6/7)
14. A second incident appears (INC-00243, Order Service pool saturation)
15. The memory created in step 12 is retrieved as the **top match** — read from the
    live store, not a hard-coded card

Final message: "Incident resolved. New memory created. IncidentIQ is now better
prepared for the next incident."

The demo is fully resettable and repeatable (Reload resets the session store).

## Key integration points (Hindsight)

- `MemoryProvider` (`src/services/provider.ts`) — the single seam; implement
  `recall`, `retain` equivalents behind these methods
- `MockMemoryProvider.createMemory` — maps to Hindsight `retain`
- `MockMemoryProvider.searchMemory` / `getSimilarIncidents` — map to Hindsight `recall`
- Postmortem lesson extraction (`createPostmortem`) — maps to Hindsight `reflect`
- `?fail=hindsight` — surfaces the "Hindsight unavailable" degraded mode

## Honesty rules

- "Demo data" badge in the top nav and sidebar footer; per-metric tooltips on KPIs
- Scores labelled **demo relevance** — never accuracy
- Deployment links labelled **possible correlation** — never cause
- API keys always masked (`••••••••`)
