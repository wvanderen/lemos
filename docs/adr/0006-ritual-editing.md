# 0006 – Ritual Editing & Content Management

**Date:** 2025‑12‑05
**Status:** Review

---

## 1. Context

We currently have:
- `RitualOS` capable of *running* rituals (step‑based flow, emits events).
- Logging and Context modules from ADR‑0005 that save *executed* rituals.

What is missing:
- The ability to **create, edit, and organize rituals** as editable artifacts.
- A **content model** that separates the ritual blueprint from its runs.
- A **UX pattern** for managing templates, tags, and metadata.
- Event and storage handling that remain consistent with the core event system.

Rituals are central to LemOS's philosophy ("Essence → Expression → Execution").
Authoring tools therefore must be treated as modular, event‑driven features — not hard‑wired forms.

---

## 2. Decision

Introduce a new module: `@lemos/modules/ritual-editor`.
Define **two persistent entities** and a **unified workflow** for creation, editing, and lifecycle events.

### 2.1 Entities

#### RitualTemplate
Represents a reusable, editable ritual design.

```ts
interface RitualTemplate {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  steps: RitualStep[];
  meta: {
    planet?: string;
    intensity?: "low" | "medium" | "high";
    createdAt: string;
    updatedAt: string;
  };
}
```

#### RitualStep
Self‑contained phase in a ritual.

```ts
interface RitualStep {
  id: string;
  type: "text" | "movement" | "sound" | "prompt" | "agent" | "custom";
  content: string;
  duration?: number;
}
```

A `RitualRun` (already defined elsewhere) always references one `RitualTemplate`.

---

## 3. Behavior and Flow

### 3.1 CRUD Operations

Implemented fully inside the module using the Core's `StoragePort`:

| Action | Emits Event | Payload |
|--------|--------------|---------|
| Create Ritual | `RitualCreated` | `{ ritualId, name, tags }` |
| Update Ritual | `RitualUpdated` | `{ ritualId, diff }` |
| Delete Ritual | `RitualDeleted` | `{ ritualId }` |

UI interacts through local state; persistence happens through events.

### 3.2 Editor Workflow

1. **Create New Ritual**
   - User opens "New Ritual" form.
   - Auto‑generates an unsaved ritual in memory (`draft` state).
2. **Edit**
   - Steps can be reordered, deleted, or typed directly.
   - Each change emits lightweight internal events (`RitualDraftChanged`), used by autosave.
3. **Save / Commit**
   - On save, `StoragePort.saveRitual(template)` called within the module.
   - Emits `RitualUpdated` (or `Created`) → Logger saves to persistent store.
4. **Run Ritual**
   - Editor can launch `RitualOS.run(template.id)` directly; context updates to link template–run pair.

This flow ensures the RitualEditor module is self‑contained and the event bus remains the only integration surface.

---

## 4. Integration Points

### 4.1 Storage
- Uses same `StoragePort` interface as Logger; creates a new table/collection `ritual_templates`.
- Local adapter can use `idb-keyval` or `SQLite` equivalently.

### 4.2 Context
- On `RitualEdited` → no context change.
- On "Run Ritual" → emits `RitualStarted` event, letting ContextModule update active ritual/run ID.

### 4.3 Logger
- Listens to `RitualCreated` + `RitualUpdated` → optional design history logging.
- Critical events (`RitualStarted`, `RitualCompleted`) already handled in previous ADRs.

### 4.4 UI
`<RitualEditorPanel />` provides:
- Ritual list / library view.
- Ritual step editor (sortable, editable inline).
- Metadata panel (planet, tags).
Each mutation fires the appropriate events rather than mutating shared state.

---

## 5. Example Event Flow

```
User clicks "New Ritual" → draft created in memory
   ↓
User edits ritual steps
   ↓
User clicks "Save"
   ↓
RitualEditor.emit('RitualCreated')
   ↓
Storage.saveRitual() → persists to IndexedDB
   ↓
Logger logs "RitualCreated" with context: constellation, planetaryMode
   ↓
UI updates ritual list
```

---

## 6. Future Extensions

| Goal | Description |
|------|--------------|
| **Versioning** | Each saved ritual stores `version` field, allowing rollback or comparison. |
| **Templates / Duplicates** | "Duplicate ritual as…" command creates a derivative ID. |
| **Scry Auto‑Suggest** | Integration of symbolic layer that can generate draft step sequences based on keywords or planetary tag. |
| **Collaboration (Cloud)** | When multi‑user mode enabled, Rituals become user‑tenant entities. |

---

## 7. Consequences

### Positive
- Enables **authored content** within LemOS (first editable creative domain).
- Decouples authoring and execution logic — clean module separation.
- Keeps persistence consistent with Core ports.

### Negative
- Adds new tables / schema complexity early.
- Step editing UI can become heavier; must intentionally limit to minimal MVP (plain text, order, tag editing).

---

## 8. Implementation Plan

1. **Define RitualTemplate + Step Types** in `@lemos/core/types`.
2. **Add Ritual CRUD functions** to `StoragePort` interface.
3. **Implement `@lemos/modules/ritual-editor`**
   - in‑memory state → autosave → emits CRUD events.
4. **UI Slice**
   - `<RitualLibrary />`, `<RitualEditor />`, `<RitualStep />`.
   - Wire to module events via bus subscription.
5. **Extend Logger / Context** to capture ritual creation metadata.
6. **Write E2E Story:** "As a user, I can create a new ritual and run it immediately."
7. **Add UI Storybook entries** for Ritual Step component.
8. **Add tests:** `ritual-editor.test.ts` covering create/update/delete cycles.

---

## 9. Status Tracking

| Milestone | Deliverable | Owner | State |
|------------|-------------|-------|-------|
| 1 | Ritual type definitions | core | ✅ drafting |
| 2 | Storage CRUD layer | platform/storage‑local | ⏳ |
| 3 | Ritual Editor module | modules/ritual-editor | ⏳ |
| 4 | Ritual Library UI | web | ⏳ |
| 5 | Logging integration | modules/logger | ⏳ |
| 6 | Tests + Storybook | ui/playground | ⏳ |

---

### Summary

This ADR formalizes **Ritual Authoring** as the next foundational system.
It gives you full CRUD loop:
**Design → Run → Log → Reflect**, all through consistent events and interfaces.

When 0006 is implemented, LemOS transitions from a "runtime sandbox" into a genuine **creative OS**, because you can author content *within it.*
