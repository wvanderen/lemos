0002 – Phase 1 Architecture: The Focus Slice


Date: 2025-12-04

Status: Done

1. Context


We have successfully bootstrapped the Phase 0 skeleton (Core + UI + Hello World).

Now we need to implement the first functional slice of LemOS: The Focus Loop. This involves:


1. Running a focused work timer.

2. Rewarding that work with a currency ("Energy").

3. Updating the UI to reflect both.

The challenge is to implement this without coupling the Timer logic to the Game logic, and without trapping business logic inside React components.

2. Decision


We will implement this slice using two distinct modules that communicate only via the Core Event Bus.

2.1 Modules

1. @lemos/modules/session-timer: Responsible for tracking time, duration, and session state (Idle/Running/Paused).

2. @lemos/modules/dopamine-hero: Responsible for gamification state (Energy, XP) and interpreting completed sessions.

2.2 State Management ("The Shell vs. Kernel Rule")

- No domain logic in React. The React UI must not use setInterval or calculate rewards.

- State lives in the Module Class. The Module instance (in plain TypeScript) holds the current timeLeft or energy balance.

- UI subscribes to changes. The UI listens for events to update its view.

2.3 Persistence (Scope Constraint)


For this specific slice (Phase 1), state will be In-Memory Only.


- Rationale: We want to validate the Event Bus flow for gameplay first.

- Persistence (SQLite/LocalStorage) is explicitly deferred to Phase 2.


---

3. Detailed Design

3.1 Event Contract


We define the following strict event types in @lemos/core (or module-specific export):

A. Timer Events


- SessionStarted: { sessionId: string, intendedDuration: number }

- SessionTick: { sessionId: string, remaining: number, elapsed: number }
	- Note: SessionTick allows the UI to update passively without running its own timer.


- SessionEnded: { sessionId: string, actualDuration: number, wasCompleted: boolean }

B. Game Events


- EnergyUpdated: { current: number, delta: number, source: string }

3.2 Data Flow

1. UI Action: User clicks "Start 25m Focus".

2. Command: UI calls TimerModule.startSession(25).

3. Process:
	- TimerModule starts internal ticker.

	- TimerModule emits SessionTick every second.

	- UI listens to SessionTick -> updates countdown display.


4. Completion:
	- Timer hits 0.

	- TimerModule emits SessionEnded.


5. Reaction:
	- DopamineHeroModule (listening for SessionEnded) calculates reward.

	- DopamineHeroModule updates internal state (energy += 10).

	- DopamineHeroModule emits EnergyUpdated.


6. Feedback:
	- UI (listening for EnergyUpdated) shows "+10 Energy" toast/animation.



---

4. Consequences

Positive

- High Decoupling: We can swap the Timer for a "Pomodoro" module or a "Ritual" module later, and DopamineHero will still work as long as SessionEnded is emitted.

- Testability: We can write a unit test for DopamineHero that simply fires a fake SessionEnded event and asserts that Energy increased, without needing to actually wait 25 minutes.

- Portability: Since the logic is in TS classes, not React hooks, this code works unchanged in a future CLI or Desktop background process.

Negative

- Boilerplate: Requires setting up two module folders and event definitions for a simple feature.

- Chattiness: SessionTick emitting every second is "chatty" on the Event Bus.
	- Mitigation: This is acceptable for local-first. If performance suffers, we can optimize later (e.g., UI handles interpolation), but for v0, the explicit event stream is safer.



---

5. Implementation Plan

1. Define Events: Add types to @lemos/core.

2. Create Timer Module: Implement start/stop/tick logic.

3. Create Dopamine Hero Module: Implement listener and simple counter state.

4. UI Integration: Build <SessionControl /> and <EnergyDisplay /> components that import nothing but the manifest/init functions and types.
