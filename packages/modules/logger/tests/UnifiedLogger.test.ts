import { describe, expect, it, beforeEach } from 'vitest';
import { EventBus, IStorage, GlobalContext } from '@lemos/core';
import { UnifiedLogger } from '../src/domain/UnifiedLogger';

// Mock storage implementation
class MockStorage implements IStorage {
  private data: Map<string, unknown[]> = new Map();

  async get<T>(key: string): Promise<T | null> {
    return null;
  }

  async set<T>(key: string, value: T): Promise<void> {}

  async delete(key: string): Promise<void> {}

  async query<T>(table: string, filter?: Record<string, unknown>): Promise<T[]> {
    const records = this.data.get(table) || [];
    if (!filter) {
      return records as T[];
    }

    return records.filter((record: unknown) => {
      if (typeof record !== 'object' || record === null) return false;
      const rec = record as Record<string, unknown>;
      return Object.entries(filter).every(([key, value]) => rec[key] === value);
    }) as T[];
  }

  async insert<T>(table: string, record: T): Promise<string> {
    const records = this.data.get(table) || [];
    records.push(record);
    this.data.set(table, records);
    return (record as { id?: string }).id || crypto.randomUUID();
  }

  async update<T>(table: string, record: T): Promise<void> {}
}

describe('UnifiedLogger', () => {
  let bus: EventBus;
  let storage: MockStorage;
  let logger: UnifiedLogger;
  let currentContext: GlobalContext;

  beforeEach(() => {
    bus = new EventBus();
    storage = new MockStorage();
    currentContext = {
      activeConstellationId: 'test-constellation',
      activeRitualRunId: 'run-123',
      activeSceneId: 'timer',
      planetaryMode: 'earth',
      timestamp: new Date().toISOString(),
    };

    logger = new UnifiedLogger(bus, storage, () => currentContext);
  });

  it('logs SessionEnded events with context', async () => {
    bus.emit({
      id: crypto.randomUUID(),
      type: 'SessionEnded',
      timestamp: new Date().toISOString(),
      payload: {
        sessionId: 'session-123',
        actualDuration: 1500,
        wasCompleted: true,
      },
    });

    // Wait for async event handler
    await new Promise(resolve => setTimeout(resolve, 10));

    const logs = await storage.query('unified_logs');
    expect(logs).toHaveLength(1);

    const log = logs[0] as {
      eventType: string;
      constellationId: string | null;
      ritualRunId: string | null;
      payload: string;
    };

    expect(log.eventType).toBe('SessionEnded');
    expect(log.constellationId).toBe('test-constellation');
    expect(log.ritualRunId).toBe('run-123');

    const payload = JSON.parse(log.payload);
    expect(payload.sessionId).toBe('session-123');
    expect(payload.actualDuration).toBe(1500);
  });

  it('logs RitualCompleted events with context', async () => {
    bus.emit({
      id: crypto.randomUUID(),
      type: 'RitualCompleted',
      timestamp: new Date().toISOString(),
      payload: {
        ritualId: 'morning-anchor',
        sessionId: 'session-456',
        totalDuration: 600,
        completedAt: new Date().toISOString(),
      },
    });

    // Wait for async event handler
    await new Promise(resolve => setTimeout(resolve, 10));

    const logs = await storage.query('unified_logs');
    expect(logs).toHaveLength(1);

    const log = logs[0] as { eventType: string; constellationId: string | null };
    expect(log.eventType).toBe('RitualCompleted');
    expect(log.constellationId).toBe('test-constellation');
  });

  it('can query logs by constellation', async () => {
    // Log events for different constellations
    currentContext.activeConstellationId = 'constellation-1';
    await logger.logEvent('SessionEnded', { sessionId: 'session-1' });

    currentContext.activeConstellationId = 'constellation-2';
    await logger.logEvent('SessionEnded', { sessionId: 'session-2' });

    currentContext.activeConstellationId = 'constellation-1';
    await logger.logEvent('SessionEnded', { sessionId: 'session-3' });

    // Query for constellation-1
    const logs = await logger.queryLogs({ constellationId: 'constellation-1' });

    expect(logs).toHaveLength(2);
    expect(logs.every(log => log.constellationId === 'constellation-1')).toBe(true);
  });

  it('can query logs by event type', async () => {
    await logger.logEvent('SessionEnded', { sessionId: 'session-1' });
    await logger.logEvent('RitualCompleted', { ritualId: 'ritual-1' });
    await logger.logEvent('SessionEnded', { sessionId: 'session-2' });

    const logs = await logger.queryLogs({ eventType: 'SessionEnded' });

    expect(logs).toHaveLength(2);
    expect(logs.every(log => log.eventType === 'SessionEnded')).toBe(true);
  });

  it('respects limit in query', async () => {
    for (let i = 0; i < 10; i++) {
      await logger.logEvent('SessionEnded', { sessionId: `session-${i}` });
    }

    const logs = await logger.queryLogs({ limit: 5 });

    expect(logs).toHaveLength(5);
  });

  it('can log with context override', async () => {
    await logger.logEvent(
      'SessionEnded',
      { sessionId: 'session-special' },
      { activeConstellationId: 'override-constellation' }
    );

    const logs = await storage.query('unified_logs');
    const log = logs[0] as { constellationId: string };

    expect(log.constellationId).toBe('override-constellation');
  });
});
