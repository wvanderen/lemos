# Session Timer

**Type:** core
**Status:** experimental
**Owner:** lem

## Purpose

Track focused work sessions with precise timing and state management.

## Responsibilities

- Start, pause, resume, and stop timed sessions
- Emit tick events every second for UI updates
- Track session state (Idle/Running/Paused)
- Emit completion events when sessions end

## Out of Scope

- Gamification or reward calculation (handled by dopamine-hero)
- Persistence (deferred to Phase 2)
- Multi-session tracking

## Quick Start

```bash
pnpm dev --filter web
```

Start a 25-minute focus session from the UI.
