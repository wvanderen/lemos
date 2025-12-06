0003 – Phase 2 Architecture: The Ritual Slice


Date: 2025-12-04

Status: Done

1. Context


We have successfully implemented Phase 1 (The Focus Slice) with two modules communicating via the Core Event Bus:

1. @lemos/modules/session-timer: Tracks time and session state.

2. @lemos/modules/dopamine-hero: Handles gamification rewards.

Now we need to implement Phase 2: The Ritual Slice. This involves:

1. Introducing persistent storage so state survives page reloads.

2. Building a new module that manages scripted sequences (Rituals).

3. Allowing users to execute multi-step workflows (e.g., "Morning Anchor" with steps like "Drink water", "Set intention", "Review goals").

4. Logging ritual completion to the database for historical tracking and analytics.

The challenge is to add persistence without violating our "Shell vs. Kernel Rule" and to support flexible ritual definitions without hardcoding UI logic.

2. Decision


We will implement this slice by introducing a Persistence Layer and a new Ritual Module that coordinates scripted sequences.

2.1 Modules

1. @lemos/platform-storage-local: Platform adapter for local persistence (SQLite for Tauri/Node, IndexedDB for Web).

2. @lemos/modules/ritual-os: Responsible for ritual state machine, step progression, and completion logging.

2.2 State Management (Persistence Integration)

- Modules own state, Storage is write-through. When a module's state changes (e.g., energy balance, ritual progress), it emits events and optionally persists to storage.

- No React-managed persistence. React components never call storage directly. They only subscribe to events.

- Read-on-boot pattern. Modules load their persisted state during initialization (before first render).

2.3 Ritual Definition Format

Rituals are defined as JSON manifests stored in-memory (future: user-editable):

```json
{
  "id": "morning-anchor",
  "name": "Morning Anchor",
  "description": "Start your day with intention",
  "steps": [
    { "id": "hydrate", "prompt": "Drink a glass of water", "durationHint": 30 },
    { "id": "intention", "prompt": "Set one intention for today", "durationHint": 60 },
    { "id": "goals", "prompt": "Review your top 3 goals", "durationHint": 90 }
  ],
  "reward": { "energy": 15, "xp": 20 }
}
```

2.4 Persistence Scope

For Phase 2, we persist:

- Ritual Completion Logs: { ritualId, completedAt, durationSeconds, stepsCompleted[] }

- Game State: { energy, xp, level } (so dopamine-hero survives reload)

We do NOT persist:

- Active session state (if you reload mid-ritual, it resets)
- Timer state (if you reload mid-focus, timer resets)

Rationale: Phase 2 focuses on proving persistence works. Session recovery is deferred to Phase 3.


---

3. Detailed Design

3.1 Storage Interface

We define a platform-agnostic storage contract in @lemos/core:

```typescript
interface IStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  query<T>(table: string, filter?: Record<string, any>): Promise<T[]>;
  insert<T>(table: string, record: T): Promise<string>; // returns ID
}
```

Platform implementations:

- @lemos/platform-storage-local/web: Uses IndexedDB (via idb library).

- @lemos/platform-storage-local/tauri: Uses SQLite (via Tauri plugin).

The Core manifest registers the active storage provider at boot.

3.2 Event Contract

We extend the event system with Ritual-specific events:

A. Ritual Events

- RitualStarted: { ritualId: string, sessionId: string, steps: Step[] }

- RitualStepCompleted: { ritualId: string, sessionId: string, stepId: string, stepIndex: number }

- RitualCompleted: { ritualId: string, sessionId: string, totalDuration: number, completedAt: string }

- RitualAbandoned: { ritualId: string, sessionId: string, stepsCompleted: number }

B. Persistence Events

- StateHydrated: { module: string, success: boolean }
  - Emitted when a module successfully loads persisted state on boot.

- StatePersisted: { module: string, key: string }
  - Optional: Emitted after successful write (useful for debugging).

3.3 Data Flow

1. Boot Sequence:
   - App initializes Core Event Bus.

   - Storage provider registers.

   - DopamineHeroModule loads persisted state: storage.get("dopamine-hero:state").

   - DopamineHeroModule emits StateHydrated and EnergyUpdated with loaded values.

   - UI renders with correct energy balance.

2. Starting a Ritual:
   - User clicks "Start Ritual: Morning Anchor".

   - UI calls RitualModule.startRitual("morning-anchor").

   - RitualModule loads ritual definition.

   - RitualModule emits RitualStarted.

   - UI (listening) renders first step prompt: "Drink a glass of water".

3. Completing Steps:
   - User clicks "Next".

   - UI calls RitualModule.completeStep().

   - RitualModule emits RitualStepCompleted.

   - UI advances to next prompt.

4. Ritual Completion:
   - User completes final step.

   - RitualModule emits RitualCompleted.

   - DopamineHeroModule (listening) calculates reward (energy += 15).

   - DopamineHeroModule persists updated state: storage.set("dopamine-hero:state", state).

   - DopamineHeroModule emits EnergyUpdated.

   - RitualModule logs completion: storage.insert("ritual_logs", { ritualId, completedAt, ... }).

   - UI shows "+15 Energy" feedback.

3.4 Schema Design

ritual_logs table:

```typescript
interface RitualLog {
  id: string;              // UUID
  ritualId: string;        // e.g., "morning-anchor"
  completedAt: string;     // ISO timestamp
  durationSeconds: number; // Total time taken
  stepsCompleted: string[]; // Array of step IDs
}
```

dopamine_state singleton:

```typescript
interface DopamineState {
  energy: number;
  xp: number;
  level: number;
  updatedAt: string;
}
```


---

4. Consequences

Positive

- Persistence Unlocked: State now survives reloads. Users can close the app and return to their progress.

- Historical Tracking: Ritual logs enable future analytics (streaks, completion rates, time-of-day patterns).

- Platform Flexibility: The IStorage interface allows us to swap IndexedDB for SQLite or even a remote API later without changing module code.

- Ritual Extensibility: JSON-based ritual definitions mean we can add new rituals without changing code, and eventually let users create custom rituals.

- Testability: We can mock the storage layer to test persistence logic without needing a real database.

Negative

- Async Complexity: Every persistence call is async. Modules must handle loading states and potential errors.
  - Mitigation: Use a simple "loading" flag in module state. UI can show a spinner during hydration.

- No Session Recovery: If you reload mid-ritual, you lose progress. This may frustrate users.
  - Mitigation: Acceptable for Phase 2. Phase 3 will add session snapshots.

- Schema Migration Risk: As we evolve the schema, we'll need migration logic.
  - Mitigation: For v0, we can use versioned keys (e.g., "dopamine-hero:state:v1"). Future: Add migration framework.

- Storage Quota Limits: IndexedDB has storage limits (~50MB in some browsers).
  - Mitigation: For Phase 2, we only store logs and game state (low footprint). Monitor size and add cleanup policies later.


---

5. Implementation Plan

1. Define Storage Interface:
   - Add IStorage contract to @lemos/core/src/storage.ts.

   - Export types for RitualLog and DopamineState.

2. Implement Storage Provider:
   - Create @lemos/platform-storage-local package.

   - Implement IndexedDB adapter for web (use idb library).

   - Create simple tables: ritual_logs, app_state.

   - Add initialization logic to Core manifest.

3. Update DopamineHeroModule:
   - Add loadState() method that calls storage.get("dopamine-hero:state").

   - Add saveState() method that calls storage.set().

   - Call saveState() after every EnergyUpdated event.

   - Emit StateHydrated on boot.

4. Create RitualModule:
   - Implement @lemos/modules/ritual-os.

   - Add startRitual(), completeStep(), abandonRitual() methods.

   - Emit RitualStarted, RitualStepCompleted, RitualCompleted events.

   - On RitualCompleted, insert log to storage.

5. Define Ritual Manifest:
   - Create morning-anchor.json in modules/ritual-os/rituals/.

   - Load ritual definitions in RitualModule constructor.

6. Build UI Components:
   - Create <RitualControl /> component:
     - Shows "Start Ritual" button.

     - Displays current step prompt when ritual is active.

     - "Next" button to advance steps.

   - Update <EnergyDisplay /> to subscribe to StateHydrated and show loading state.

7. Integration Testing:
   - Test boot sequence: Verify energy persists across reloads.

   - Test ritual flow: Complete Morning Anchor, verify log entry in DB.

   - Test reward integration: Verify energy increases after ritual completion.

8. Documentation:
   - Update README with ritual definition format.

   - Document storage interface for future platform adapters.


---

6. Open Questions

1. Ritual Step Validation: Should we track partial completion (e.g., user did 2/3 steps)?
   - Proposal: For Phase 2, only log fully completed rituals. Partial tracking is Phase 3+.

2. Concurrent Rituals: Can a user run a focus session AND a ritual simultaneously?
   - Proposal: For Phase 2, allow it. The Event Bus handles both. Phase 3 can add mutual exclusion if needed.

3. Ritual Scheduling: Should rituals have time-of-day triggers (e.g., "Morning Anchor" only available 6-10am)?
   - Proposal: Defer to Phase 4. Phase 2 keeps rituals always available.

4. Offline-First Sync: If we add a backend later, how do we sync ritual logs?
   - Proposal: Design IStorage with sync in mind (add syncedAt field to logs), but implementation is Phase 5+.
