# LemOS / Lemstation

**Version:** v0.2 (Phase 2: Ritual Slice)

LemOS is a modular personal operating environment for ritual, work, and play - a local-first system that integrates focused activity, creative rituals, and symbolic computation.

## Current Features

- **Focus Sessions**: Pomodoro-style timer with real-time energy rewards
- **Ritual System**: Multi-step workflows (e.g., Morning Anchor ritual)
- **Gamification**: Energy and XP system with level progression
- **Persistent Storage**: State survives page reloads using IndexedDB
- **Event-Driven Architecture**: Modules communicate via typed events

## Repository Structure

```
apps/web                      # React web app (UI shell)
packages/core                 # @lemos/core - event bus, runtime, types, storage interface
packages/ui                   # @lemos/ui - small design system
packages/platform-storage-local  # IndexedDB/SQLite adapter
packages/modules/
  ├── session-timer           # Focus session timer
  ├── dopamine-hero           # Gamification & rewards
  └── ritual-os               # Ritual state machine
docs/                         # Specs, standards, design notes
```

## Quick Start

```bash
pnpm install
pnpm dev --filter web
```

Open http://localhost:5173 and check the console for event logs.

## Development Philosophy

- **Readme Driven Development:** each module begins with documentation, not code.
- **Event-Driven Architecture:** every component talks via typed events on the Core bus.
- **Tracer Bullet Workflow:** build thin end-to-end slices before expanding features.
- **Local First:** SQLite / IndexedDB in early stages, cloud adapters later.

## Where to Start

- docs/DEV-STANDARDS.md
- docs/MODULE-GUIDE.md
- docs/LEMOS-SPEC.md
