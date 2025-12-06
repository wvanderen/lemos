import { describe, expect, it, beforeEach, vi } from 'vitest';
import { EventBus, IStorage } from '@lemos/core';
import { ContextManager } from '../src/domain/ContextManager';

describe('ContextManager', () => {
  let bus: EventBus;
  let contextManager: ContextManager;
  let mockStorage: IStorage;

  beforeEach(async () => {
    bus = new EventBus();
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      query: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      deleteRecord: vi.fn(),
    };
    contextManager = new ContextManager(bus, mockStorage);
    await contextManager.initialize();
  });

  it('initializes with default context', () => {
    const snapshot = contextManager.getSnapshot();

    expect(snapshot.activeConstellationId).toBeNull();
    expect(snapshot.activeRitualRunId).toBeNull();
    expect(snapshot.activeSceneId).toBeNull();
    expect(snapshot.planetaryMode).toBe('sun');
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

  it('updates active ritual when RitualStartedContext event is emitted', () => {
    bus.emit({
      id: crypto.randomUUID(),
      type: 'RitualStartedContext',
      timestamp: new Date().toISOString(),
      payload: {
        ritualId: 'morning-anchor',
        runId: 'session-123',
      },
    });

    const snapshot = contextManager.getSnapshot();
    expect(snapshot.activeRitualRunId).toBe('session-123');
  });

  it('clears active ritual when RitualEnded event is emitted', () => {
    // Start a ritual
    bus.emit({
      id: crypto.randomUUID(),
      type: 'RitualStartedContext',
      timestamp: new Date().toISOString(),
      payload: {
        ritualId: 'morning-anchor',
        runId: 'session-123',
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
    expect(snapshot.planetaryMode).toBe('sun');
  });

  it('loads planetary mode from storage during initialization', async () => {
    const storedMode = 'moon';
    mockStorage.get = vi.fn().mockResolvedValue(storedMode);

    const newContextManager = new ContextManager(bus, mockStorage);
    await newContextManager.initialize();

    expect(mockStorage.get).toHaveBeenCalledWith('lemos.planetaryMode');
    expect(newContextManager.getSnapshot().planetaryMode).toBe(storedMode);
  });

  it('persists planetary mode changes to storage', async () => {
    const newMode = 'void';

    contextManager.setPlanetaryMode(newMode);

    // Wait for async storage call to complete
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockStorage.set).toHaveBeenCalledWith('lemos.planetaryMode', newMode);
  });

  it('works without storage (graceful degradation)', async () => {
    const newContextManager = new ContextManager(bus);
    await newContextManager.initialize();

    // Should still work with default mode
    expect(newContextManager.getSnapshot().planetaryMode).toBe('sun');
  });
});
