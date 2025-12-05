import { describe, expect, it, beforeEach } from 'vitest';
import { EventBus } from '@lemos/core';
import { UnifiedLogger } from '../src/domain/UnifiedLogger.js';
// Mock storage implementation
class MockStorage {
    data = new Map();
    async get(key) {
        return null;
    }
    async set(key, value) { }
    async delete(key) { }
    async query(table, filter) {
        const records = this.data.get(table) || [];
        if (!filter) {
            return records;
        }
        return records.filter((record) => {
            if (typeof record !== 'object' || record === null)
                return false;
            const rec = record;
            return Object.entries(filter).every(([key, value]) => rec[key] === value);
        });
    }
    async insert(table, record) {
        const records = this.data.get(table) || [];
        records.push(record);
        this.data.set(table, records);
        return record.id || crypto.randomUUID();
    }
    async update(table, record) { }
}
describe('UnifiedLogger', () => {
    let bus;
    let storage;
    let logger;
    let currentContext;
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
        const log = logs[0];
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
        const log = logs[0];
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
        await logger.logEvent('SessionEnded', { sessionId: 'session-special' }, { activeConstellationId: 'override-constellation' });
        const logs = await storage.query('unified_logs');
        const log = logs[0];
        expect(log.constellationId).toBe('override-constellation');
    });
});
