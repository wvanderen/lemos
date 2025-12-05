0005 – Context-Aware Logging & Persistence


Date: 2025-12-05

Status: Approved

1. Context


We have functioning slices for Sessions, Rituals, and Constellations. However, they are currently ephemeral islands.


- When a Session ends, we aren't saving it to a permanent record.

- When a User writes a Journal Entry, the system doesn't automatically know that it belongs to the "LemOS Dev" Constellation or that it happened during a "Morning Anchor" Ritual.

We need a standardized way to track the "Now" (Global Context) and persist the "Past" (Unified Logging).


---

2. Decision


We will introduce two new architectural components:

2.1 The Context Manager (@lemos/modules/context)


A module responsible for holding the current global state. It is the "source of truth" for "What are we doing right now?"


- State held: `activeConstellationId`, `activeRitualRunId`, `activeScene`, `planetaryMode`.

- Behavior: Listens to events (e.g., `ConstellationSelected`, `RitualStarted`) and updates its internal state.

- Exposure: Exposes a public method `getContext()` that other modules (like the Logger) can use to "enrich" their data before saving.

2.2 The Unified Logger (@lemos/modules/logger)


A module responsible for persistence. It acts as the system's historian.


- Behavior: Listens to "High-Value Events" (`SessionEnded`, `RitualCompleted`, `NoteCreated`).

- Enrichment: When an event arrives, the Logger fetches the current state from the ContextManager and attaches it to the record.

- Storage: Uses a standard StoragePort (Adapter pattern) to write to IndexedDB (web) or SQLite (desktop).


---

3. Detailed Design

3.1 The "Active Context" Flow


We treat Context as a State Machine driven by events.


1. User Selects Constellation:
    - UI emits: `ConstellationSelected { id: "constellation-123" }`

    - ContextModule hears it → sets `state.activeConstellationId = "constellation-123"`.


2. User Starts Ritual:
    - RitualModule emits: `RitualStarted { runId: "run-999", ritualId: "morning-anchor" }`

    - ContextModule hears it → sets `state.activeRitualRunId = "run-999"`.


3.2 The Logging Flow


When a user saves a note, we want it automatically tagged with the above context.


1. User types note: "Had a breakthrough on the Event Bus."

2. UI emits: `JournalEntrySubmitted { text: "...", timestamp: "..." }`

3. LoggerModule hears it:
    - Catches event.

    - Calls `ContextModule.getSnapshot()`.

    - Result: `{ constellationId: "constellation-123", ritualRunId: "run-999" }`.


4. LoggerModule saves to DB:

```typescript
storage.insert("unified_logs", {
  id: generateId(),
  eventType: "NoteCreated",
  timestamp: "2025-12-05T14:32:00Z",
  payload: JSON.stringify({ text: "Had a breakthrough...", timestamp: "2025-12-05T14:32:00Z" }),
  // Context auto-attached:
  constellationId: "constellation-123",
  ritualRunId: "run-999",
  sceneId: null,
  planetaryMode: "earth"
})

5. Later, when the user asks "Show me all my LemOS Dev notes", we can query:

```typescript
storage.query("journal_entries", {
  constellationId: "constellation-123"
})
```

And automatically get everything written during that constellation's context.

3.3 Context Manager API


```typescript
interface IContextManager {
  // State management
  getSnapshot(): GlobalContext;
  setActiveConstellation(id: string | null): void;
  setActiveRitual(runId: string | null): void;
  setActiveScene(sceneId: string | null): void;
  setPlanetaryMode(mode: PlanetaryMode): void;

  // Event handling (internal)
  // Listens to: ConstellationSelected, RitualStarted, RitualEnded, SceneChanged
}

interface GlobalContext {
  activeConstellationId: string | null;
  activeRitualRunId: string | null;
  activeSceneId: string | null;
  planetaryMode: PlanetaryMode;
  timestamp: string; // ISO timestamp of snapshot
}

type PlanetaryMode = "earth" | "mars" | "jupiter" | "saturn";
```

3.4 Logger Module API


```typescript
interface ILoggerModule {
  // Manual logging (for edge cases)
  logEvent(eventType: string, payload: object, context?: Partial<GlobalContext>): Promise<void>;

  // Query historical records
  queryLogs(filters: LogFilter): Promise<LogEntry[]>;

  // Event handling (internal)
  // Listens to: SessionEnded, RitualCompleted, NoteCreated, etc.
}

interface LogEntry {
  id: string;
  eventType: string;          // e.g., "SessionEnded", "NoteCreated"
  timestamp: string;           // ISO timestamp
  payload: object;             // Original event data

  // Auto-enriched context fields
  constellationId: string | null;
  ritualRunId: string | null;
  sceneId: string | null;
  planetaryMode: PlanetaryMode;
}

interface LogFilter {
  eventType?: string | string[];
  constellationId?: string;
  ritualRunId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}
```

3.5 Event Contract


**New Context Events:**

- `ConstellationSelected: { id: string | null }` - When user picks a constellation
- `RitualStarted: { runId: string, ritualId: string }` - When ritual begins
- `RitualEnded: { runId: string }` - When ritual completes
- `SceneChanged: { sceneId: string | null }` - When UI scene transitions
- `PlanetaryModeChanged: { mode: PlanetaryMode }` - When user switches mode

**Logged Events (listened by Logger):**

- `SessionEnded: { sessionId: string, duration: number, wasCompleted: boolean }`
- `RitualCompleted: { ritualId: string, runId: string, completedAt: string }`
- `NoteCreated: { noteId: string, text: string, timestamp: string }`
- `TaskCompleted: { taskId: string, completedAt: string }`
- Future: `AchievementUnlocked`, `StreakMilestone`, etc.

3.6 Storage Schema


**A. unified_logs table**

The central logging table:

```typescript
interface UnifiedLog {
  id: string;                      // UUID
  eventType: string;               // e.g., "SessionEnded"
  timestamp: string;               // ISO timestamp
  payload: string;                 // JSON-encoded original event

  // Context fields (indexed for fast queries)
  constellationId: string | null;
  ritualRunId: string | null;
  sceneId: string | null;
  planetaryMode: string;
}
```

Indexes:
- `idx_logs_constellation` on `constellationId`
- `idx_logs_ritual` on `ritualRunId`
- `idx_logs_timestamp` on `timestamp`
- `idx_logs_event_type` on `eventType`

**B. context_snapshots table (optional optimization)**

For advanced analytics, we can periodically snapshot the context state:

```typescript
interface ContextSnapshot {
  id: string;
  timestamp: string;
  activeConstellationId: string | null;
  activeRitualRunId: string | null;
  activeSceneId: string | null;
  planetaryMode: string;
}
```

This enables "What was I doing at 3pm yesterday?" queries.

3.7 Data Flow Example: Full Session with Context


1. **User opens app (9:00 AM)**
   - ContextModule initializes with default state: `{ constellationId: null, ritualRunId: null }`

2. **User selects "LemOS Dev" constellation**
   - UI emits: `ConstellationSelected { id: "constellation-123" }`
   - ContextModule updates: `state.activeConstellationId = "constellation-123"`

3. **User starts "Morning Anchor" ritual**
   - RitualModule emits: `RitualStarted { runId: "run-999", ritualId: "morning-anchor" }`
   - ContextModule updates: `state.activeRitualRunId = "run-999"`

4. **Ritual includes a focus session (step 3 of ritual)**
   - SessionTimerModule emits: `SessionStarted { sessionId: "session-abc", duration: 1500 }`
   - (No context change, just tracking)

5. **Session completes**
   - SessionTimerModule emits: `SessionEnded { sessionId: "session-abc", duration: 1500, wasCompleted: true }`
   - LoggerModule catches it:
     - Fetches context: `{ constellationId: "constellation-123", ritualRunId: "run-999" }`
     - Writes to `unified_logs`:
       ```json
       {
         "id": "log-xyz",
         "eventType": "SessionEnded",
         "timestamp": "2025-12-05T09:25:00Z",
         "payload": "{\"sessionId\":\"session-abc\",\"duration\":1500,\"wasCompleted\":true}",
         "constellationId": "constellation-123",
         "ritualRunId": "run-999",
         "sceneId": null,
         "planetaryMode": "earth"
       }
       ```

6. **Ritual completes**
   - RitualModule emits: `RitualCompleted { runId: "run-999", ritualId: "morning-anchor" }`
   - LoggerModule logs it (with same context)
   - ContextModule clears: `state.activeRitualRunId = null`

7. **Later: User queries "Show my LemOS Dev morning sessions"**
   - UI calls: `LoggerModule.queryLogs({ eventType: "SessionEnded", constellationId: "constellation-123" })`
   - Returns all sessions tagged with that constellation, including the one from this morning


---

4. Consequences

**Positive**

- **Automatic Context Tagging**: Users never have to manually tag a note or session with "what constellation" or "what ritual". The system knows from the active state.

- **Powerful Querying**: We can answer questions like:
  - "How much time did I spend on LemOS Dev during morning rituals?"
  - "What were my thoughts during the Productivity constellation this week?"
  - "How many sessions did I complete in Earth mode vs Mars mode?"

- **Unified History**: Instead of separate tables for `session_logs`, `ritual_logs`, `note_logs`, we have one `unified_logs` table with consistent context fields. Simpler queries, easier analytics.

- **Retroactive Insights**: Because every event is logged with full context, we can build analytics dashboards without changing the data model later.

- **Decoupling**: The Logger and Context modules are pure event listeners. Other modules don't need to "know" about logging—they just emit events as usual.

- **Cross-Module Awareness**: Modules can now "see" what else is happening. For example, a future "AI Coach" module could fetch the current context to give advice like: "You've done 3 sessions on LemOS Dev today. Take a break?"

**Negative**

- **Database Growth**: Every event creates a log entry. Heavy users could generate thousands of logs per month.
  - **Mitigation**: Add retention policy (e.g., archive logs older than 6 months). Implement pagination for queries.

- **Context Staleness**: If a user forgets to "end" a ritual or "deselect" a constellation, the context could be stale (e.g., still tagged with yesterday's constellation).
  - **Mitigation**: Add timeout detection: If no activity for 2 hours, auto-clear context. Add UI reminder: "Still working on X?"

- **Performance Overhead**: Logging every event + fetching context adds latency.
  - **Mitigation**: Use async writes (non-blocking). Batch writes if needed. Context snapshot is in-memory (fast read).

- **Privacy/Audit Risk**: Unified logs could contain sensitive information (journal entries, task titles).
  - **Mitigation**: Add encryption for `payload` field. Add user-facing "Clear Logs" feature. Ensure logs stay local (never sync without consent).

- **Context Ambiguity**: What if a user is working on two constellations simultaneously (e.g., "LemOS Dev" + "Side Project")?
  - **Mitigation**: Keep context singular for Phase 5. Multi-context tagging is a future feature (requires multi-select UI).

- **Event Pollution**: If every module emits too many events, the Logger could become a bottleneck.
  - **Mitigation**: Logger only listens to "high-value" events (completions, not ticks). Add event filtering config.


---

5. Implementation Plan

**1. Define Core Types:**
   - Add `GlobalContext`, `LogEntry`, `LogFilter` interfaces to `@lemos/core/src/types.ts`.
   - Define new event types in `@lemos/core/src/events.ts`.

**2. Create ContextModule:**
   - Implement `@lemos/modules/context`.
   - Add state management: `activeConstellationId`, `activeRitualRunId`, `activeSceneId`, `planetaryMode`.
   - Add event listeners: `ConstellationSelected`, `RitualStarted`, `RitualEnded`, `SceneChanged`.
   - Expose `getSnapshot()` method.
   - Add timeout logic: Auto-clear context after 2 hours of inactivity.

**3. Create LoggerModule:**
   - Implement `@lemos/modules/logger`.
   - Add event listeners: `SessionEnded`, `RitualCompleted`, `NoteCreated`, etc.
   - On event received:
     1. Fetch `ContextModule.getSnapshot()`.
     2. Merge event payload + context.
     3. Write to `storage.insert("unified_logs", ...)`.
   - Expose `queryLogs()` method with filtering.

**4. Update Storage Schema:**
   - Extend `@lemos/platform-storage-local` to create `unified_logs` table.
   - Add indexes: `constellationId`, `ritualRunId`, `timestamp`, `eventType`.
   - Add optional `context_snapshots` table for analytics.
   - Bump schema version to `3`.

**5. Update Existing Modules:**
   - **ConstellationModule**: Emit `ConstellationSelected` when user picks a constellation.
   - **RitualModule**: Emit `RitualStarted` and `RitualEnded` with `runId`.
   - **SessionTimerModule**: Already emits `SessionEnded` (no changes needed).
   - **JournalModule** (if exists): Emit `NoteCreated` with text + timestamp.

**6. Build UI Components:**
   - Add "Active Context" indicator to status bar:
     - Shows: "🚀 LemOS Dev" (constellation badge).
     - Shows: "🌅 Morning Anchor" (ritual badge).
     - Click to clear/change context.
   - Add "Clear Context" button in settings (for stale context).
   - Add "View Logs" debug panel (developer mode):
     - List recent logs with filters.
     - Show context fields inline.

**7. Add Query Utilities:**
   - Create `@lemos/modules/analytics` (optional):
     - High-level queries: `getTotalSessionsForConstellation()`, `getNotesForRitual()`.
     - Aggregate stats: `getWeeklyBreakdown()`, `getConstellationHeatmap()`.
   - Expose these to UI for dashboards.

**8. Integration Testing:**
   - Test context updates:
     1. Select constellation → verify `ContextModule.getSnapshot()` returns correct ID.
     2. Start ritual → verify `ritualRunId` is set.
     3. End ritual → verify `ritualRunId` is cleared.
   - Test logging with context:
     1. Select constellation "LemOS Dev".
     2. Complete session.
     3. Query `unified_logs` → verify `constellationId` matches.
   - Test context staleness:
     1. Set constellation.
     2. Wait 2 hours (simulate with clock mock).
     3. Verify context auto-cleared.
   - Test querying:
     1. Log 10 events across 3 constellations.
     2. Query for specific constellation → verify only matching logs returned.

**9. Performance Testing:**
   - Simulate 1000 log entries → measure query speed.
   - Test batched writes vs individual writes.
   - Verify indexes are used (EXPLAIN QUERY).

**10. Documentation:**
   - Update README with Context Manager concept.
   - Document LoggerModule API for future module developers.
   - Add diagram: Event Flow with Context Enrichment.
   - Add guide: "How to query logs for analytics features".


---

6. Open Questions

1. **Context Persistence**: Should the active context survive app restarts?
   - **Proposal**: Yes, but with staleness check. On app start, load last context from storage. If timestamp > 2 hours old, clear it. Otherwise, restore it.

2. **Context History**: Should we keep a history of context changes (e.g., "At 9am you were on LemOS Dev, at 2pm you switched to Fitness")?
   - **Proposal**: Yes, via `context_snapshots` table. Snapshot every time context changes. Enables time-travel queries.

3. **Multi-Context Support**: Should a session be tagged with multiple constellations?
   - **Proposal**: No for Phase 5. Keep it singular. Multi-context is a future feature (requires UI redesign).

4. **Event Filtering Config**: Should users be able to choose what events get logged?
   - **Proposal**: Not initially. Phase 5 logs everything. Phase 6+ can add privacy settings: "Don't log journal entries" or "Don't log task titles".

5. **Log Encryption**: Should the `payload` field be encrypted?
   - **Proposal**: Defer to Phase 6 (multi-user/sync). For local-first single-user, unencrypted is acceptable. Add encryption when adding sync.

6. **Log Export**: Should users be able to export their logs (e.g., for backup or analysis)?
   - **Proposal**: Yes. Add "Export Logs as JSON" button in settings. Enables user control and portability.

7. **Automatic Context Suggestions**: Should the system suggest a constellation based on time-of-day or past patterns?
   - **Proposal**: Phase 6 feature. Use ML/heuristics to suggest: "It's 9am, you usually work on LemOS Dev now. Switch?"

8. **Context Clearing on Scene Change**: Should switching scenes (e.g., Timer → Journal) clear the ritual context?
   - **Proposal**: No. Context is global, not scene-specific. A ritual can span multiple scenes (e.g., start in Timer, write notes in Journal).


---

**Dependencies:**
- Requires Phase 2 (Ritual Slice) for `RitualStarted`/`RitualEnded` events.
- Requires Phase 3 (Constellation Slice) for `ConstellationSelected` events.
- Requires Phase 1 (Focus Slice) for `SessionEnded` events.

**Unlocks:**
- Phase 6: Advanced Analytics (time tracking, constellation insights, ritual streaks).
- Phase 7: AI Coach (context-aware suggestions based on logs).
- Phase 8: Multi-user sync (logs become the sync primitive).
