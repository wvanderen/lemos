# MODULE-GUIDE.md

## 1. Create the Skeleton

From repo root:

```bash
pnpm create module <id>
```

(Manual):

```
packages/modules/<id>/
  src/
  docs/
  README.md
  module.manifest.json
```

## 2. Fill in the README

Example template:

```md
# Dopamine Hero

**Type:** game
**Status:** experimental
**Owner:** lem

## Purpose
Turn focused sessions into a visual game loop.

## Responsibilities
- Listen for `SessionEnded`
- Track and display Energy
- Emit `EnergeticShift` events

## Out of Scope
- Authentication
- Persistence beyond local store

## Quick Start

```bash
pnpm dev --filter web
```

Open the web console and watch events.
```

## 3. Write docs/design.md

Focus on:

- Domain entities and invariants
- How it interacts with core (events listening/emitting)
- Core flows (happy path, edge cases)

## 4. Write docs/api.md

List every event it touches.

```md
### Listens To
- SessionEnded
  - payload: `{ sessionId, duration }`

### Emits
- EnergyUpdated
  - payload: `{ energy: number }`
```

## 5. Add Manifest

`module.manifest.json`

```json
{
  "id": "dopamine-hero",
  "name": "Dopamine Hero",
  "version": "0.1.0",
  "type": "game",
  "listensTo": ["SessionEnded"],
  "emits": ["EnergyUpdated"],
  "uiPanels": [
    { "id": "main", "title": "Game", "location": "main" }
  ]
}
```

## 6. Register in Core

Add to your dev app:

```ts
import { registerModule } from "@lemos/core";
import { manifest, init } from "@lemos/modules/dopamine-hero";

core.registerModule(manifest, init);
```

## 7. Verify with the Event Logger

Run app, send test event, confirm console output. Then commit initial docs plus a passing test in one PR.

## 8. Optional Utility Script

You can automate steps 1-5 with a `scripts/create-module.ts` CLI that:

- Generates the folder/file template
- Injects placeholder docs
- Appends a link to `docs/LEMOS-SPEC.md`

## 9. Recommended Daily Workflow

1. **Morning session ritual**
   - Review constellations -> pick one focus (module or doc)
   - Open PR stub titled `WIP(<module>): ...`
2. **Midday commit**
   - Commit any meaningful slice.
   - Record TODO in code before stopping (`// NEXT: implement reward calc`)
3. **Evening reflection**
   - Run `pnpm test`
   - Note progress and insights in a short `docs/logs/YYYY-MM-DD.md`

This keeps the process cyclical and prevents drift.
