# Session Timer Design

## Domain Model

### SessionTimer Class

The core entity that manages timer state and lifecycle.

**State:**
- `sessionId`: Unique identifier for the current session
- `state`: SessionState ('Idle' | 'Running' | 'Paused')
- `intendedDuration`: Target duration in seconds
- `elapsed`: Seconds elapsed since session start
- `tickerInterval`: Internal setInterval handle

**Invariants:**
- Only one session can be running at a time
- Cannot start a new session while one is running
- Cannot pause when not running
- Cannot resume when not paused
- Elapsed time never exceeds intended duration

## Core Flows

### Happy Path: Complete Session

1. User calls `startSession(25)` (25 minutes)
2. SessionTimer creates unique sessionId
3. Emits `SessionStarted` event
4. Starts internal ticker (1 second interval)
5. Every second: emits `SessionTick` with remaining/elapsed time
6. When remaining = 0: emits `SessionEnded` with wasCompleted=true

### Alternative: Manual Stop

1. User calls `stopSession()` while running
2. SessionTimer stops ticker
3. Emits `SessionEnded` with wasCompleted=false
4. Resets to Idle state

### Alternative: Pause/Resume

1. User calls `pauseSession()` while running
2. Ticker stops, state = Paused, elapsed time preserved
3. User calls `resumeSession()`
4. Ticker restarts from last elapsed time
5. Continues until completion or manual stop

## Event Bus Integration

The SessionTimer depends on the Core EventBus for all communication:
- No direct coupling to UI
- No direct coupling to game logic
- Pure event-driven architecture

## State Transitions

```
Idle -> Running (startSession)
Running -> Paused (pauseSession)
Paused -> Running (resumeSession)
Running -> Idle (stopSession or completion)
```
