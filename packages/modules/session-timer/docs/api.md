# Session Timer API

## Events

### Listens To

None. This module is command-driven (direct method calls from UI).

### Emits

#### SessionStarted

Emitted when a new session begins.

```typescript
{
  type: 'SessionStarted',
  payload: {
    sessionId: string;
    intendedDuration: number; // seconds
  }
}
```

#### SessionTick

Emitted every second while a session is running.

```typescript
{
  type: 'SessionTick',
  payload: {
    sessionId: string;
    remaining: number;  // seconds remaining
    elapsed: number;    // seconds elapsed
  }
}
```

#### SessionEnded

Emitted when a session completes or is stopped.

```typescript
{
  type: 'SessionEnded',
  payload: {
    sessionId: string;
    actualDuration: number;  // total seconds elapsed
    wasCompleted: boolean;   // true if timer reached 0, false if manually stopped
  }
}
```

## Public Methods

### startSession(durationMinutes: number): void

Starts a new focus session.

**Parameters:**
- `durationMinutes`: Duration in minutes

**Throws:**
- Error if a session is already running

### pauseSession(): void

Pauses the currently running session.

**Throws:**
- Error if no session is running

### resumeSession(): void

Resumes a paused session.

**Throws:**
- Error if no session is paused

### stopSession(): void

Stops the current session before completion.

### getState(): SessionState

Returns current state: 'Idle' | 'Running' | 'Paused'

### getRemaining(): number

Returns seconds remaining in current session.

### getElapsed(): number

Returns seconds elapsed in current session.
