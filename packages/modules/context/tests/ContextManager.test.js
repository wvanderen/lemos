import { describe, expect, it, beforeEach } from 'vitest';
import { EventBus } from '@lemos/core';
import { ContextManager } from '../src/domain/ContextManager.js';
describe('ContextManager', () => {
    let bus;
    let contextManager;
    beforeEach(() => {
        bus = new EventBus();
        contextManager = new ContextManager(bus);
    });
    it('initializes with default context', () => {
        const snapshot = contextManager.getSnapshot();
        expect(snapshot.activeConstellationId).toBeNull();
        expect(snapshot.activeRitualRunId).toBeNull();
        expect(snapshot.activeSceneId).toBeNull();
        expect(snapshot.planetaryMode).toBe('earth');
        expect(snapshot.timestamp).toBeDefined();
    });
    it('updates active constellation when ConstellationSelected event is emitted', () => {
        bus.emit({
            id: crypto.randomUUID(),
            type: 'ConstellationSelected',
            timestamp: new Date().toISOString(),
            payload: { id: 'test-constellation' },
        });
        const snapshot = contextManager.getSnapshot();
        expect(snapshot.activeConstellationId).toBe('test-constellation');
    });
    it('updates active ritual when RitualStarted event is emitted', () => {
        bus.emit({
            id: crypto.randomUUID(),
            type: 'RitualStarted',
            timestamp: new Date().toISOString(),
            payload: {
                ritualId: 'morning-anchor',
                sessionId: 'session-123',
                steps: [],
            },
        });
        const snapshot = contextManager.getSnapshot();
        expect(snapshot.activeRitualRunId).toBe('session-123');
    });
    it('clears active ritual when RitualEnded event is emitted', () => {
        // Start a ritual
        bus.emit({
            id: crypto.randomUUID(),
            type: 'RitualStarted',
            timestamp: new Date().toISOString(),
            payload: {
                ritualId: 'morning-anchor',
                sessionId: 'session-123',
                steps: [],
            },
        });
        expect(contextManager.getSnapshot().activeRitualRunId).toBe('session-123');
        // End the ritual
        bus.emit({
            id: crypto.randomUUID(),
            type: 'RitualEnded',
            timestamp: new Date().toISOString(),
            payload: { runId: 'session-123' },
        });
        expect(contextManager.getSnapshot().activeRitualRunId).toBeNull();
    });
    it('updates scene when SceneChanged event is emitted', () => {
        bus.emit({
            id: crypto.randomUUID(),
            type: 'SceneChanged',
            timestamp: new Date().toISOString(),
            payload: { sceneId: 'timer' },
        });
        const snapshot = contextManager.getSnapshot();
        expect(snapshot.activeSceneId).toBe('timer');
    });
    it('updates planetary mode when PlanetaryModeChanged event is emitted', () => {
        bus.emit({
            id: crypto.randomUUID(),
            type: 'PlanetaryModeChanged',
            timestamp: new Date().toISOString(),
            payload: { mode: 'mars' },
        });
        const snapshot = contextManager.getSnapshot();
        expect(snapshot.planetaryMode).toBe('mars');
    });
    it('can be manually cleared', () => {
        // Set some context
        contextManager.setActiveConstellation('test-constellation');
        contextManager.setActiveRitual('run-123');
        contextManager.setActiveScene('timer');
        contextManager.setPlanetaryMode('jupiter');
        expect(contextManager.getSnapshot().activeConstellationId).toBe('test-constellation');
        // Clear context
        contextManager.clearContext();
        const snapshot = contextManager.getSnapshot();
        expect(snapshot.activeConstellationId).toBeNull();
        expect(snapshot.activeRitualRunId).toBeNull();
        expect(snapshot.activeSceneId).toBeNull();
        expect(snapshot.planetaryMode).toBe('earth');
    });
});
