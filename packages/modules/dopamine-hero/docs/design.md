# Dopamine Hero Design

## Domain Model

### DopamineHero Class

The core entity that manages gamification state and reward logic.

**State:**
- `energy`: Current energy balance (integer)

**Invariants:**
- Energy cannot be negative
- Energy only increases from completed sessions
- Rewards are deterministic based on session duration

## Reward Calculation

Current formula: **1 Energy per second of active focus**

This means:
- Energy updates in real-time as you work
- Pause stops energy accumulation
- Resume continues accumulation
- No minimum threshold required

The rate of 1 energy per second is a placeholder. Future phases will calculate this dynamically based on:
- Game progress and upgrades
- Streak bonuses
- Difficulty multipliers
- XP and leveling systems

## Core Flows

### Happy Path: Real-time Energy Accumulation

1. User starts a focus session
2. Every second, SessionTimer emits `SessionTick`
3. DopamineHero receives tick event via EventBus listener
4. DopamineHero adds energy based on current rate (default: 1 per second)
5. DopamineHero emits `EnergyUpdated` with current total and delta
6. UI updates energy display in real-time
7. User sees energy counter incrementing every second

### Pause Behavior

1. User pauses the session
2. SessionTimer stops emitting ticks
3. No new energy is accumulated while paused
4. Energy counter stops incrementing in UI
5. User resumes session
6. Ticks resume, energy accumulation continues

## Event Bus Integration

DopamineHero is purely reactive:
- No direct coupling to SessionTimer
- Only communicates via EventBus
- Can be tested independently by firing fake SessionEnded events

## State Management

For Phase 1, state is **in-memory only**:
- Energy resets on page reload
- No localStorage or database persistence
- This is intentional to validate the event flow first

Phase 2 will add persistence via SQLite or LocalStorage.
