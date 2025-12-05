# Constellation OS

> Phase 3: Link work to meaning

The **Constellation OS** module provides a project/goal management system that allows users to organize their focus sessions and rituals around larger objectives or areas of life. Constellations help answer:

- "What am I working toward?"
- "How much time have I invested in Project X?"
- "Which goals are getting neglected?"

## Features

- **Constellation Definitions**: Create, update, and archive projects/goals
- **Session Tagging**: Associate focus sessions with constellations
- **Ritual Tagging**: Associate ritual completions with constellations
- **Statistics**: View time invested, completion rates, and activity for each constellation
- **Default Seeding**: Automatically creates 3 starter constellations on first run

## Installation

This module is part of the LemOS workspace and is automatically installed when you install the project dependencies.

## Usage

### Initialization

```typescript
import { LemOSCore } from '@lemos/core';
import { IndexedDBStorage } from '@lemos/platform-storage-local';
import {
  manifest as constellationOSManifest,
  init as constellationOSInit,
  getConstellationOSInstance
} from '@lemos/modules-constellation-os';

const core = new LemOSCore();
const storage = new IndexedDBStorage();

core.registerStorage(storage);
core.registerModule(constellationOSManifest, (bus) =>
  constellationOSInit(bus, storage)
);

core.start();

const constellationOS = getConstellationOSInstance();
```

### Creating a Constellation

```typescript
const constellationId = await constellationOS.createConstellation({
  name: 'Launch SaaS',
  description: 'Build and ship my productivity app',
  color: '#4A90E2',
  icon: '🚀',
  archived: false,
});
```

### Tagging a Session

```typescript
import { getTimerInstance } from '@lemos/modules-session-timer';

const timer = getTimerInstance();

// Start a 25-minute focus session associated with "Launch SaaS"
timer.startSession(25, 'launch-saas');
```

### Viewing Statistics

```typescript
const stats = await constellationOS.getStats('launch-saas');

console.log(`Total Sessions: ${stats.totalSessions}`);
console.log(`Total Time: ${stats.totalMinutes} minutes`);
console.log(`Completion Rate: ${stats.completionRate}%`);
console.log(`Last Activity: ${stats.lastActivityAt}`);
```

### Listing Constellations

```typescript
// Get active constellations only
const activeConstellations = await constellationOS.listConstellations();

// Include archived constellations
const allConstellations = await constellationOS.listConstellations(true);
```

## API Reference

See [API Documentation](./docs/api.md) for detailed method signatures and event contracts.

## Architecture

See [Design Documentation](./docs/design.md) for implementation details and data flow.

## Events

The Constellation OS module emits the following events:

- `ConstellationCreated`: When a new constellation is created
- `ConstellationUpdated`: When a constellation is modified
- `ConstellationArchived`: When a constellation is archived

It listens to:

- `SessionEnded`: To log session associations
- `RitualCompleted`: To track ritual completions

## Default Constellations

On first run, the module automatically creates 3 default constellations:

1. **Work** (Blue, 💼) - Professional projects and career development
2. **Personal Growth** (Green, 🌱) - Learning, skills development, and self-improvement
3. **Health** (Red, ❤️) - Physical fitness, mental health, and wellbeing

Users can customize, archive, or delete these defaults as needed.

## Storage

The module persists data to the following tables:

- `constellation_definitions`: Constellation metadata (name, color, icon, etc.)
- `session_logs`: Completed focus sessions with constellation associations
- `ritual_logs`: Ritual completions with constellation associations (extends Phase 2 schema)

## License

MIT
