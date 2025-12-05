# ADR 0005 - Context Logging UI Implementation Plan

**Date:** 2025-12-05
**Status:** Planned
**Parent ADR:** 0005-context-logging.md

## Overview

Add minimal UI components to verify the context-aware logging system is working correctly. This includes:
1. Active constellation selector
2. Journal entry submission form
3. Log stream viewer to observe logged events

## Existing UI Architecture

### Current Structure
- **Framework:** React (via ReactDOM)
- **Styling:** Inline styles with consistent design system
- **Components:** Located in `packages/ui/src/`
- **Main App:** `apps/web/src/main.tsx`
- **Existing Components:**
  - `Panel` - Reusable container with gradient background
  - `ConstellationList` - Full CRUD management for constellations
  - `ConstellationPicker` - Dropdown selector (currently used in other contexts)
  - `SessionControl` - Timer management UI
  - `RitualControl` - Ritual workflow UI
  - `EnergyDisplay` - Dopamine hero stats

### Design Patterns Observed
- Components receive `EventBus` and module instances as props
- Event listeners set up in `useEffect` hooks
- Async operations use `useState` + `useCallback` pattern
- Inline styles with color palette: `#0b1021` (dark bg), `#e8ecf1` (text), `#9ca3af` (muted)
- Panel gradient: `linear-gradient(145deg, #f9fafb, #eef1f4)`

## Implementation Plan

### 1. **Context Control Component** (`ContextControl.tsx`)

**Purpose:** Allow user to select active constellation and view current context state

**Features:**
- Display current context snapshot (constellation, ritual, scene, planetary mode)
- Dropdown to select active constellation
- Clear context button
- Real-time updates when context changes via event bus

**Props:**
```typescript
interface ContextControlProps {
  bus: EventBus;
  contextManager: ContextManager;
  constellationOS: ConstellationOS;
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ Active Context                      │
│ ─────────────────────────────────── │
│ Constellation: [Dropdown ▼]  [Clear]│
│                                     │
│ Current State:                      │
│ • Ritual: session-123               │
│ • Scene: timer                      │
│ • Mode: earth                       │
└─────────────────────────────────────┘
```

**Event Interactions:**
- Listens: `ConstellationSelected`, `RitualStarted`, `RitualEnded`, `SceneChanged`
- Emits: Uses `constellationOS.selectConstellation(id)` which emits `ConstellationSelected`

### 2. **Journal Entry Component** (`JournalEntry.tsx`)

**Purpose:** Quick note-taking with automatic context tagging

**Features:**
- Text area for journal entry
- Character count
- Submit button
- Auto-clears after submission
- Shows submission confirmation

**Props:**
```typescript
interface JournalEntryProps {
  bus: EventBus;
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ Quick Journal Entry                 │
│ ─────────────────────────────────── │
│ ┌─────────────────────────────────┐ │
│ │ Write your thoughts...          │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ 0 / 500 chars          [Submit ✓]  │
│                                     │
│ ✓ Entry saved with context         │
└─────────────────────────────────────┘
```

**Behavior:**
1. User types in textarea
2. On submit:
   - Emit `NoteCreated` event with `{ noteId, text, timestamp }`
   - Logger automatically enriches with context
   - Clear textarea
   - Show success message (fade after 3s)

### 3. **Log Viewer Component** (`LogViewer.tsx`)

**Purpose:** Display recent log entries to verify context enrichment is working

**Features:**
- Shows last 10 log entries (configurable)
- Displays: timestamp, event type, constellation, ritual
- Color-coded by constellation
- Expandable to view full payload
- Auto-refresh option

**Props:**
```typescript
interface LogViewerProps {
  bus: EventBus;
  logger: UnifiedLogger;
  constellationOS: ConstellationOS;
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Recent Logs (10)              [Auto-refresh ✓] │
│ ──────────────────────────────────────────────────  │
│ 12:45:23 SessionEnded                               │
│ ├─ Constellation: LemOS Dev 🚀                     │
│ └─ Ritual: session-123                             │
│                                                     │
│ 12:44:15 NoteCreated                                │
│ ├─ Constellation: LemOS Dev 🚀                     │
│ ├─ Text: "Had a breakthrough..."                   │
│ └─ Ritual: session-123                             │
│                                                     │
│ 12:40:00 RitualCompleted                            │
│ └─ Constellation: Morning Routine ☀️               │
└─────────────────────────────────────────────────────┘
```

**Refresh Strategy:**
- Listen to `SessionEnded`, `RitualCompleted`, `NoteCreated`, `TaskCompleted` events
- Re-query logs when new events arrive
- Manual refresh button
- Optional: 5-second polling

### 4. **App Integration** (`apps/web/src/main.tsx`)

**Changes Required:**

1. **Initialize new modules:**
```typescript
import { init as contextInit, getContextManager } from '@lemos/modules-context';
import { init as loggerInit, getLoggerInstance } from '@lemos/modules-logger';

// After storage initialization:
lemosCore.registerModule(contextManifest, (bus) => contextInit(bus));
lemosCore.registerModule(loggerManifest, (bus) =>
  loggerInit(bus, storage, () => getContextManager().getSnapshot())
);
```

2. **Add new UI sections:**
```tsx
<Panel>
  <ContextControl
    bus={core.bus}
    contextManager={contextManager}
    constellationOS={constellationOS}
  />
</Panel>

<Panel>
  <JournalEntry bus={core.bus} />
</Panel>

<Panel>
  <LogViewer
    bus={core.bus}
    logger={logger}
    constellationOS={constellationOS}
  />
</Panel>
```

3. **Update page title:**
```tsx
<h1>LemOS Phase 5</h1>
<p>Context-Aware Logging & Persistence</p>
```

## Component Styling Guide

### Color Palette
```typescript
const colors = {
  background: '#0b1021',
  panelGradient: 'linear-gradient(145deg, #f9fafb, #eef1f4)',
  text: '#e8ecf1',
  textMuted: '#9ca3af',
  textDark: '#111827',
  border: '#d1d5db',
  success: '#10b981',
  primary: '#4A90E2',
};
```

### Spacing
- Panel gap: `16px`
- Internal padding: `12px 16px`
- Form element gaps: `8px`

### Typography
- Font family: `'Inter, system-ui, sans-serif'`
- Label size: `12px`, weight: `600`
- Body size: `14px`
- Heading size: Based on context

## Data Flow

```
User Action (Select Constellation)
  ↓
ConstellationOS.selectConstellation(id)
  ↓
Emit: ConstellationSelected { id }
  ↓
ContextManager listens → Updates state
  ↓
ContextControl listens → Refreshes display

User Action (Submit Journal)
  ↓
Emit: NoteCreated { noteId, text, timestamp }
  ↓
Logger listens → Fetch context → Write to DB
  ↓
LogViewer listens → Refresh log list

User starts Session/Ritual
  ↓
Emit: SessionEnded / RitualCompleted
  ↓
Logger auto-enriches with active context
  ↓
LogViewer shows enriched entry
```

## File Structure

```
packages/ui/src/
├── ContextControl.tsx      (new)
├── JournalEntry.tsx        (new)
├── LogViewer.tsx           (new)
└── index.tsx               (update exports)

apps/web/src/
└── main.tsx                (integrate components)
```

## Validation Checklist

After implementation, verify:

- [ ] Can select constellation from dropdown
- [ ] Context state updates in real-time
- [ ] Submitting journal entry creates log
- [ ] Log shows correct constellation context
- [ ] Starting a ritual updates context
- [ ] Session completion is logged with context
- [ ] Log viewer shows enriched entries
- [ ] Clearing context sets constellation to null
- [ ] Database contains entries in `unified_logs` table
- [ ] IndexedDB indexes are used (check DevTools)

## Out of Scope (Future)

- Editing/deleting journal entries
- Filtering logs by date range
- Exporting logs
- Context persistence across page refresh
- Advanced analytics dashboards
- Multi-constellation selection
- Log search functionality

## Implementation Order

1. ✅ Create `ContextControl.tsx` - Foundation for context management
2. ✅ Create `JournalEntry.tsx` - Primary testing mechanism
3. ✅ Create `LogViewer.tsx` - Verification of logging
4. ✅ Update `packages/ui/src/index.tsx` - Export new components
5. ✅ Update `apps/web/src/main.tsx` - Integrate modules + UI
6. ✅ Manual testing in browser
7. ✅ Verify IndexedDB schema and data

---

**Estimated effort:** 2-3 hours for full implementation and testing
