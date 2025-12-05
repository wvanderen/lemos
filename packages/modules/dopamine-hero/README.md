# Dopamine Hero

**Type:** game
**Status:** experimental
**Owner:** lem

## Purpose

Transform focused work sessions into a gamified experience with Energy rewards.

## Responsibilities

- Listen for active session ticks (SessionTick events)
- Award Energy in real-time (1 per second by default)
- Track current Energy balance
- Emit EnergyUpdated events for UI feedback

## Out of Scope

- XP or leveling systems (future enhancement)
- Persistence beyond in-memory state (Phase 2)
- Reward customization or configuration

## Quick Start

```bash
pnpm dev --filter web
```

Complete a focus session and watch the Energy counter increase.
