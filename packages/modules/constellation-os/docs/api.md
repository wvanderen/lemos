# Constellation OS API Reference

## Module Exports

```typescript
import {
  manifest,
  ConstellationOS,
  init,
  getConstellationOSInstance
} from '@lemos/modules-constellation-os';
```

### `manifest`

Module metadata conforming to `LemOSModuleManifest`:

```json
{
  "id": "constellation-os",
  "name": "Constellation OS",
  "version": "0.1.0",
  "type": "core",
  "listensTo": ["SessionEnded", "RitualCompleted"],
  "emits": ["ConstellationCreated", "ConstellationUpdated", "ConstellationArchived"]
}
```

### `init(bus: EventBus, storage?: IStorage): void`

Initializes the Constellation OS module.

**Parameters:**
- `bus` - The LemOS event bus instance
- `storage` (optional) - Storage provider for persistence

**Example:**
```typescript
import { LemOSCore } from '@lemos/core';
import { IndexedDBStorage } from '@lemos/platform-storage-local';
import { manifest, init } from '@lemos/modules-constellation-os';

const core = new LemOSCore();
const storage = new IndexedDBStorage();

core.registerModule(manifest, (bus) => init(bus, storage));
```

### `getConstellationOSInstance(): ConstellationOS`

Returns the singleton ConstellationOS instance.

**Returns:** `ConstellationOS` instance

**Throws:** Error if `init()` has not been called

**Example:**
```typescript
const constellationOS = getConstellationOSInstance();
const stats = await constellationOS.getStats('launch-saas');
```

---

## ConstellationOS Class

### CRUD Operations

#### `createConstellation(data): Promise<string>`

Creates a new constellation.

**Parameters:**
```typescript
data: {
  name: string;
  description: string;
  color: string;           // Hex color code (e.g., "#4A90E2")
  icon: string;            // Emoji or icon identifier
  archived: boolean;       // Default: false
}
```

**Returns:** `Promise<string>` - The generated constellation ID (slug-style)

**Events Emitted:** `ConstellationCreated`

**Example:**
```typescript
const id = await constellationOS.createConstellation({
  name: 'Launch SaaS',
  description: 'Build and ship my productivity app',
  color: '#4A90E2',
  icon: '🚀',
  archived: false,
});

console.log(id); // "launch-saas"
```

---

#### `updateConstellation(id, changes): Promise<void>`

Updates an existing constellation.

**Parameters:**
- `id: string` - Constellation ID
- `changes: Partial<ConstellationDefinition>` - Fields to update

**Events Emitted:** `ConstellationUpdated`

**Example:**
```typescript
await constellationOS.updateConstellation('launch-saas', {
  description: 'Updated description',
  color: '#667eea',
});
```

---

#### `archiveConstellation(id): Promise<void>`

Archives a constellation (hides from pickers, preserves stats).

**Parameters:**
- `id: string` - Constellation ID

**Events Emitted:** `ConstellationArchived`

**Example:**
```typescript
await constellationOS.archiveConstellation('launch-saas');
```

---

### Query Operations

#### `listConstellations(includeArchived?): Promise<ConstellationDefinition[]>`

Lists all constellations.

**Parameters:**
- `includeArchived: boolean` (optional, default: `false`) - Include archived constellations

**Returns:** `Promise<ConstellationDefinition[]>`

**Example:**
```typescript
// Active constellations only
const active = await constellationOS.listConstellations();

// All constellations (including archived)
const all = await constellationOS.listConstellations(true);
```

---

#### `getConstellation(id): Promise<ConstellationDefinition | null>`

Retrieves a single constellation by ID.

**Parameters:**
- `id: string` - Constellation ID

**Returns:** `Promise<ConstellationDefinition | null>` - Constellation data or null if not found

**Example:**
```typescript
const constellation = await constellationOS.getConstellation('launch-saas');

if (constellation) {
  console.log(constellation.name);
}
```

---

### Statistics

#### `getStats(id): Promise<ConstellationStats>`

Computes aggregated statistics for a constellation.

**Parameters:**
- `id: string` - Constellation ID

**Returns:** `Promise<ConstellationStats>`

**Stats Object:**
```typescript
{
  constellationId: string;
  totalSessions: number;      // Count of focus sessions
  totalRituals: number;       // Count of ritual completions
  totalMinutes: number;       // Combined time from sessions + rituals
  lastActivityAt: string | null; // ISO timestamp of most recent activity
  completionRate: number;     // % of sessions completed (0-100)
}
```

**Example:**
```typescript
const stats = await constellationOS.getStats('launch-saas');

console.log(`Sessions: ${stats.totalSessions}`);
console.log(`Time: ${stats.totalMinutes} minutes`);
console.log(`Completion: ${stats.completionRate}%`);
console.log(`Last Activity: ${stats.lastActivityAt}`);
```

---

## Event Contracts

### Events Emitted

#### `ConstellationCreated`

Emitted when a new constellation is created.

**Payload:**
```typescript
{
  id: string;
  name: string;
  color: string;
  icon: string;
}
```

**Example:**
```typescript
bus.on<ConstellationCreatedPayload>('ConstellationCreated', (event) => {
  console.log(`New constellation: ${event.payload.name}`);
});
```

---

#### `ConstellationUpdated`

Emitted when a constellation is updated.

**Payload:**
```typescript
{
  id: string;
  changes: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    archived?: boolean;
  };
}
```

**Example:**
```typescript
bus.on<ConstellationUpdatedPayload>('ConstellationUpdated', (event) => {
  console.log(`Updated constellation: ${event.payload.id}`);
  console.log('Changes:', event.payload.changes);
});
```

---

#### `ConstellationArchived`

Emitted when a constellation is archived.

**Payload:**
```typescript
{
  id: string;
}
```

**Example:**
```typescript
bus.on<ConstellationArchivedPayload>('ConstellationArchived', (event) => {
  console.log(`Archived: ${event.payload.id}`);
});
```

---

### Events Consumed

#### `SessionEnded`

The module listens to this event to log session associations.

**Expected Payload:**
```typescript
{
  sessionId: string;
  actualDuration: number;
  wasCompleted: boolean;
  constellationId?: string;  // Used for association
}
```

**Handler:** `logSession()` - Inserts a `SessionLog` record if `constellationId` is present.

---

#### `RitualCompleted`

The module listens to this event (placeholder for future enhancements).

**Expected Payload:**
```typescript
{
  ritualId: string;
  sessionId: string;
  totalDuration: number;
  completedAt: string;
  constellationId?: string;  // Used for association
}
```

**Handler:** `updateRitualLog()` - Currently a no-op (RitualOS handles logging).

---

## Integration with Other Modules

### SessionTimer

To tag a session with a constellation:

```typescript
import { getTimerInstance } from '@lemos/modules-session-timer';

const timer = getTimerInstance();

// Start a 25-minute session associated with "work" constellation
timer.startSession(25, 'work');
```

The `SessionTimer` will:
1. Store the `constellationId` internally
2. Emit `SessionStarted` with `constellationId`
3. Emit `SessionEnded` with `constellationId` when complete

---

### RitualOS

To tag a ritual with a constellation:

```typescript
import { getRitualOSInstance } from '@lemos/modules-ritual-os';

const ritualOS = getRitualOSInstance();

// Start morning ritual associated with "health" constellation
ritualOS.startRitual('morning-anchor', 'health');
```

The `RitualOS` will include `constellationId` in the `RitualCompleted` event and persist it to `ritual_logs`.

---

## Storage Schema

### constellation_definitions

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string | PK | Slug identifier |
| `name` | string | No | Display name |
| `description` | string | No | User description |
| `color` | string | No | Hex color |
| `icon` | string | No | Emoji/icon |
| `createdAt` | string | No | ISO timestamp |
| `archived` | boolean | No | Archive status |

### session_logs

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string | PK | UUID |
| `sessionId` | string | No | From SessionTimer |
| `constellationId` | string | FK, nullable | Association |
| `startedAt` | string | No | ISO timestamp |
| `completedAt` | string | No | ISO timestamp |
| `durationSeconds` | number | No | Actual time |
| `plannedDuration` | number | No | Original setting |
| `wasCompleted` | boolean | No | Completion status |

### ritual_logs (extended)

Added field: `constellationId: string | null`

---

## Error Handling

All async methods use try-catch internally and:
- Log errors to console
- Return empty arrays for query methods on failure
- Throw descriptive errors for CRUD operations on failure

**Example:**
```typescript
try {
  await constellationOS.createConstellation({...});
} catch (error) {
  console.error('Failed to create constellation:', error);
}
```

---

## TypeScript Types

Import types from `@lemos/core`:

```typescript
import type {
  ConstellationDefinition,
  ConstellationStats,
  SessionLog,
  ConstellationCreatedPayload,
  ConstellationUpdatedPayload,
  ConstellationArchivedPayload,
} from '@lemos/core';
```
