import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventBus, } from '@lemos/core';
import { ConstellationOS } from '../src/domain/ConstellationOS.js';
// Mock storage implementation for testing
class MockStorage {
    store = new Map();
    async get(key) {
        const table = this.store.get(key);
        return table?.[0] ?? null;
    }
    async set(key, value) {
        this.store.set(key, [value]);
    }
    async delete(key) {
        this.store.delete(key);
    }
    async query(table, filter) {
        const records = this.store.get(table) ?? [];
        if (!filter) {
            return records;
        }
        return records.filter((record) => {
            return Object.entries(filter).every(([key, value]) => {
                return record[key] === value;
            });
        });
    }
    async insert(table, record) {
        const records = this.store.get(table) ?? [];
        const id = record.id ?? crypto.randomUUID();
        records.push({ ...record, id });
        this.store.set(table, records);
    }
    async update(table, record) {
        const records = this.store.get(table) ?? [];
        const index = records.findIndex((r) => r.id === record.id);
        if (index !== -1) {
            records[index] = record;
            this.store.set(table, records);
        }
    }
    clear() {
        this.store.clear();
    }
}
describe('ConstellationOS', () => {
    let bus;
    let storage;
    let constellationOS;
    beforeEach(async () => {
        bus = new EventBus();
        storage = new MockStorage();
        constellationOS = new ConstellationOS(bus, storage);
        // Wait for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 10));
    });
    describe('Initialization', () => {
        it('initializes with default constellations on first boot', async () => {
            const constellations = await constellationOS.listConstellations();
            expect(constellations.length).toBeGreaterThan(0);
            expect(constellations.some(c => c.id === 'work')).toBe(true);
            expect(constellations.some(c => c.id === 'personal-growth')).toBe(true);
            expect(constellations.some(c => c.id === 'health')).toBe(true);
        });
        it('does not duplicate defaults if already initialized', async () => {
            const firstLoad = await constellationOS.listConstellations();
            const firstCount = firstLoad.length;
            // Create a new instance (simulating app restart)
            const newConstellationOS = new ConstellationOS(bus, storage);
            await new Promise(resolve => setTimeout(resolve, 10));
            const secondLoad = await newConstellationOS.listConstellations();
            expect(secondLoad.length).toBe(firstCount);
        });
        it('works without storage', () => {
            const nostorage = new ConstellationOS(bus);
            expect(nostorage).toBeDefined();
        });
    });
    describe('CRUD Operations', () => {
        describe('createConstellation', () => {
            it('creates a new constellation', async () => {
                const id = await constellationOS.createConstellation({
                    name: 'Side Project',
                    description: 'Building my app',
                    color: '#FF5733',
                    icon: '🚀',
                    archived: false,
                });
                expect(id).toBe('side-project');
                const constellation = await constellationOS.getConstellation(id);
                expect(constellation).not.toBeNull();
                expect(constellation?.name).toBe('Side Project');
                expect(constellation?.color).toBe('#FF5733');
                expect(constellation?.createdAt).toBeDefined();
            });
            it('generates slug-style ID from name', async () => {
                const id = await constellationOS.createConstellation({
                    name: 'My Awesome Project!',
                    description: 'Test',
                    color: '#000000',
                    icon: '✨',
                    archived: false,
                });
                expect(id).toBe('my-awesome-project');
            });
            it('emits ConstellationCreated event', async () => {
                const handler = vi.fn();
                bus.on('ConstellationCreated', handler);
                const id = await constellationOS.createConstellation({
                    name: 'Test Project',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler).toHaveBeenCalledWith(expect.objectContaining({
                    type: 'ConstellationCreated',
                    payload: expect.objectContaining({
                        id,
                        name: 'Test Project',
                        color: '#000000',
                        icon: '📝',
                    }),
                }));
            });
            it('throws error when storage is not available', async () => {
                const nostorage = new ConstellationOS(bus);
                await expect(nostorage.createConstellation({
                    name: 'Test',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                })).rejects.toThrow('Storage not available');
            });
        });
        describe('updateConstellation', () => {
            it('updates an existing constellation', async () => {
                const id = await constellationOS.createConstellation({
                    name: 'Original Name',
                    description: 'Original Description',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                await constellationOS.updateConstellation(id, {
                    name: 'Updated Name',
                    description: 'Updated Description',
                });
                const constellation = await constellationOS.getConstellation(id);
                expect(constellation?.name).toBe('Updated Name');
                expect(constellation?.description).toBe('Updated Description');
                expect(constellation?.color).toBe('#000000'); // unchanged
            });
            it('emits ConstellationUpdated event', async () => {
                const id = await constellationOS.createConstellation({
                    name: 'Test',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                const handler = vi.fn();
                bus.on('ConstellationUpdated', handler);
                await constellationOS.updateConstellation(id, { name: 'New Name' });
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler).toHaveBeenCalledWith(expect.objectContaining({
                    type: 'ConstellationUpdated',
                    payload: expect.objectContaining({
                        id,
                        changes: { name: 'New Name' },
                    }),
                }));
            });
            it('throws error when constellation not found', async () => {
                await expect(constellationOS.updateConstellation('nonexistent', { name: 'Test' })).rejects.toThrow('Constellation not found: nonexistent');
            });
            it('throws error when storage is not available', async () => {
                const nostorage = new ConstellationOS(bus);
                await expect(nostorage.updateConstellation('test-id', { name: 'Test' })).rejects.toThrow('Storage not available');
            });
        });
        describe('archiveConstellation', () => {
            it('archives a constellation', async () => {
                const id = await constellationOS.createConstellation({
                    name: 'To Archive',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                await constellationOS.archiveConstellation(id);
                const constellation = await constellationOS.getConstellation(id);
                expect(constellation?.archived).toBe(true);
            });
            it('emits ConstellationArchived event', async () => {
                const id = await constellationOS.createConstellation({
                    name: 'To Archive',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                const handler = vi.fn();
                bus.on('ConstellationArchived', handler);
                await constellationOS.archiveConstellation(id);
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler).toHaveBeenCalledWith(expect.objectContaining({
                    type: 'ConstellationArchived',
                    payload: expect.objectContaining({ id }),
                }));
            });
        });
        describe('listConstellations', () => {
            it('lists all active constellations by default', async () => {
                const id1 = await constellationOS.createConstellation({
                    name: 'Active 1',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                await constellationOS.createConstellation({
                    name: 'Active 2',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                const id3 = await constellationOS.createConstellation({
                    name: 'Archived',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                await constellationOS.archiveConstellation(id3);
                const constellations = await constellationOS.listConstellations();
                // Should include defaults + 2 active (not the archived one)
                expect(constellations.every(c => !c.archived)).toBe(true);
                expect(constellations.some(c => c.id === id1)).toBe(true);
                expect(constellations.some(c => c.id === id3)).toBe(false);
            });
            it('includes archived constellations when requested', async () => {
                const id = await constellationOS.createConstellation({
                    name: 'To Archive',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                await constellationOS.archiveConstellation(id);
                const all = await constellationOS.listConstellations(true);
                const archived = all.filter(c => c.archived);
                expect(archived.length).toBeGreaterThan(0);
                expect(archived.some(c => c.id === id)).toBe(true);
            });
            it('returns empty array when storage is not available', async () => {
                const nostorage = new ConstellationOS(bus);
                const constellations = await nostorage.listConstellations();
                expect(constellations).toEqual([]);
            });
        });
        describe('getConstellation', () => {
            it('retrieves a constellation by ID', async () => {
                const id = await constellationOS.createConstellation({
                    name: 'Test Constellation',
                    description: 'Test Description',
                    color: '#FF5733',
                    icon: '🌟',
                    archived: false,
                });
                const constellation = await constellationOS.getConstellation(id);
                expect(constellation).not.toBeNull();
                expect(constellation?.id).toBe(id);
                expect(constellation?.name).toBe('Test Constellation');
            });
            it('returns null for non-existent constellation', async () => {
                const constellation = await constellationOS.getConstellation('nonexistent');
                expect(constellation).toBeNull();
            });
            it('returns null when storage is not available', async () => {
                const nostorage = new ConstellationOS(bus);
                const constellation = await nostorage.getConstellation('test-id');
                expect(constellation).toBeNull();
            });
        });
    });
    describe('Statistics', () => {
        describe('getStats', () => {
            it('calculates stats from session and ritual logs', async () => {
                const constellationId = await constellationOS.createConstellation({
                    name: 'Test Project',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                // Add some session logs manually
                await storage.insert('session_logs', {
                    sessionId: 'session-1',
                    constellationId,
                    startedAt: '2025-12-01T10:00:00Z',
                    completedAt: '2025-12-01T10:25:00Z',
                    durationSeconds: 1500, // 25 minutes
                    plannedDuration: 1500,
                    wasCompleted: true,
                });
                await storage.insert('session_logs', {
                    sessionId: 'session-2',
                    constellationId,
                    startedAt: '2025-12-01T11:00:00Z',
                    completedAt: '2025-12-01T11:15:00Z',
                    durationSeconds: 900, // 15 minutes
                    plannedDuration: 1500,
                    wasCompleted: false,
                });
                // Add a ritual log
                await storage.insert('ritual_logs', {
                    ritualId: 'morning-anchor',
                    constellationId,
                    completedAt: '2025-12-01T08:00:00Z',
                    durationSeconds: 300, // 5 minutes
                    stepsCompleted: ['step1', 'step2', 'step3'],
                });
                const stats = await constellationOS.getStats(constellationId);
                expect(stats.constellationId).toBe(constellationId);
                expect(stats.totalSessions).toBe(2);
                expect(stats.totalRituals).toBe(1);
                expect(stats.totalMinutes).toBe(45); // (1500 + 900 + 300) / 60 = 45
                expect(stats.completionRate).toBe(50); // 1 of 2 completed
                expect(stats.lastActivityAt).toBe('2025-12-01T11:15:00Z');
            });
            it('returns zero stats for constellation with no activity', async () => {
                const constellationId = await constellationOS.createConstellation({
                    name: 'Inactive Project',
                    description: 'Test',
                    color: '#000000',
                    icon: '📝',
                    archived: false,
                });
                const stats = await constellationOS.getStats(constellationId);
                expect(stats.constellationId).toBe(constellationId);
                expect(stats.totalSessions).toBe(0);
                expect(stats.totalRituals).toBe(0);
                expect(stats.totalMinutes).toBe(0);
                expect(stats.completionRate).toBe(0);
                expect(stats.lastActivityAt).toBeNull();
            });
            it('returns zero stats when storage is not available', async () => {
                const nostorage = new ConstellationOS(bus);
                const stats = await nostorage.getStats('test-id');
                expect(stats.totalSessions).toBe(0);
                expect(stats.totalRituals).toBe(0);
                expect(stats.totalMinutes).toBe(0);
            });
        });
    });
    describe('Event Handlers', () => {
        describe('SessionEnded', () => {
            it('logs session when SessionEnded event is emitted', async () => {
                const constellationId = 'work';
                const payload = {
                    sessionId: 'test-session',
                    constellationId,
                    actualDuration: 1500,
                    wasCompleted: true,
                };
                bus.emit({
                    id: crypto.randomUUID(),
                    type: 'SessionEnded',
                    timestamp: new Date().toISOString(),
                    payload,
                });
                // Wait for async log operation
                await new Promise(resolve => setTimeout(resolve, 10));
                const logs = await storage.query('session_logs', { constellationId });
                expect(logs.length).toBe(1);
                expect(logs[0].sessionId).toBe('test-session');
                expect(logs[0].constellationId).toBe(constellationId);
                expect(logs[0].durationSeconds).toBe(1500);
                expect(logs[0].wasCompleted).toBe(true);
            });
            it('does not log session without constellationId', async () => {
                const payload = {
                    sessionId: 'test-session',
                    constellationId: null,
                    actualDuration: 1500,
                    wasCompleted: true,
                };
                bus.emit({
                    id: crypto.randomUUID(),
                    type: 'SessionEnded',
                    timestamp: new Date().toISOString(),
                    payload,
                });
                await new Promise(resolve => setTimeout(resolve, 10));
                const logs = await storage.query('session_logs');
                expect(logs.length).toBe(0);
            });
            it('handles session logging without storage gracefully', async () => {
                const nostorage = new ConstellationOS(bus);
                const payload = {
                    sessionId: 'test-session',
                    constellationId: 'work',
                    actualDuration: 1500,
                    wasCompleted: true,
                };
                // Should not throw
                expect(() => {
                    bus.emit({
                        id: crypto.randomUUID(),
                        type: 'SessionEnded',
                        timestamp: new Date().toISOString(),
                        payload,
                    });
                }).not.toThrow();
            });
        });
        describe('RitualCompleted', () => {
            it('handles RitualCompleted event', async () => {
                const payload = {
                    ritualId: 'morning-anchor',
                    sessionId: 'test-session',
                    totalDuration: 300,
                    completedAt: new Date().toISOString(),
                    constellationId: 'work',
                };
                // Should not throw (this is currently a placeholder)
                expect(() => {
                    bus.emit({
                        id: crypto.randomUUID(),
                        type: 'RitualCompleted',
                        timestamp: new Date().toISOString(),
                        payload,
                    });
                }).not.toThrow();
                await new Promise(resolve => setTimeout(resolve, 10));
            });
        });
    });
    describe('Integration', () => {
        it('supports full workflow: create, log sessions, view stats, archive', async () => {
            // Create constellation
            const id = await constellationOS.createConstellation({
                name: 'My Project',
                description: 'A test project',
                color: '#4A90E2',
                icon: '🚀',
                archived: false,
            });
            // Emit session events
            bus.emit({
                id: crypto.randomUUID(),
                type: 'SessionEnded',
                timestamp: new Date().toISOString(),
                payload: {
                    sessionId: 'session-1',
                    constellationId: id,
                    actualDuration: 1500,
                    wasCompleted: true,
                },
            });
            bus.emit({
                id: crypto.randomUUID(),
                type: 'SessionEnded',
                timestamp: new Date().toISOString(),
                payload: {
                    sessionId: 'session-2',
                    constellationId: id,
                    actualDuration: 1500,
                    wasCompleted: true,
                },
            });
            await new Promise(resolve => setTimeout(resolve, 10));
            // Check stats
            const stats = await constellationOS.getStats(id);
            expect(stats.totalSessions).toBe(2);
            expect(stats.totalMinutes).toBe(50); // 3000 seconds / 60
            // Archive constellation
            await constellationOS.archiveConstellation(id);
            // Verify it's archived but stats still exist
            const constellation = await constellationOS.getConstellation(id);
            expect(constellation?.archived).toBe(true);
            const archivedStats = await constellationOS.getStats(id);
            expect(archivedStats.totalSessions).toBe(2);
        });
    });
});
