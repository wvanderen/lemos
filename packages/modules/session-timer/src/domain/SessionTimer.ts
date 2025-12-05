import { EventBus, SessionStartedPayload, SessionTickPayload, SessionEndedPayload } from '@lemos/core';

export type SessionState = 'Idle' | 'Running' | 'Paused';

export class SessionTimer {
  private bus: EventBus;
  private state: SessionState = 'Idle';
  private sessionId: string | null = null;
  private constellationId: string | null = null; // Phase 3: Constellation association
  private intendedDuration: number = 0;
  private elapsed: number = 0;
  private tickerInterval: NodeJS.Timeout | null = null;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  startSession(durationMinutes: number, constellationId?: string): void {
    if (this.state === 'Running') {
      throw new Error('Cannot start a new session while one is already running');
    }

    this.sessionId = crypto.randomUUID();
    this.constellationId = constellationId ?? null;
    this.intendedDuration = durationMinutes * 60;
    this.elapsed = 0;
    this.state = 'Running';

    this.bus.emit<SessionStartedPayload>({
      id: crypto.randomUUID(),
      type: 'SessionStarted',
      timestamp: new Date().toISOString(),
      payload: {
        sessionId: this.sessionId,
        intendedDuration: this.intendedDuration,
        constellationId: this.constellationId ?? undefined,
      },
    });

    this.startTicker();
  }

  pauseSession(): void {
    if (this.state !== 'Running') {
      throw new Error('Cannot pause when not running');
    }
    this.state = 'Paused';
    this.stopTicker();
  }

  resumeSession(): void {
    if (this.state !== 'Paused') {
      throw new Error('Cannot resume when not paused');
    }
    this.state = 'Running';
    this.startTicker();
  }

  stopSession(): void {
    if (this.state === 'Idle') {
      return;
    }

    const wasCompleted = false;
    this.endSession(wasCompleted);
  }

  getState(): SessionState {
    return this.state;
  }

  getRemaining(): number {
    return Math.max(0, this.intendedDuration - this.elapsed);
  }

  getElapsed(): number {
    return this.elapsed;
  }

  getConstellationId(): string | null {
    return this.constellationId;
  }

  private startTicker(): void {
    this.tickerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  private stopTicker(): void {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  private tick(): void {
    if (this.state !== 'Running' || !this.sessionId) {
      return;
    }

    this.elapsed += 1;
    const remaining = this.getRemaining();

    this.bus.emit<SessionTickPayload>({
      id: crypto.randomUUID(),
      type: 'SessionTick',
      timestamp: new Date().toISOString(),
      payload: {
        sessionId: this.sessionId,
        remaining,
        elapsed: this.elapsed,
      },
    });

    if (remaining === 0) {
      this.endSession(true);
    }
  }

  private endSession(wasCompleted: boolean): void {
    const finalSessionId = this.sessionId!;
    const finalConstellationId = this.constellationId;
    const actualDuration = this.elapsed;

    this.stopTicker();
    this.state = 'Idle';
    this.sessionId = null;
    this.constellationId = null;
    this.elapsed = 0;
    this.intendedDuration = 0;

    this.bus.emit<SessionEndedPayload>({
      id: crypto.randomUUID(),
      type: 'SessionEnded',
      timestamp: new Date().toISOString(),
      payload: {
        sessionId: finalSessionId,
        actualDuration,
        wasCompleted,
        constellationId: finalConstellationId ?? undefined,
      },
    });
  }
}
