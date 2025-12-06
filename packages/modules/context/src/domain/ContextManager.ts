import {
  EventBus,
  GlobalContext,
  PlanetaryMode,
  IStorage,
  type ConstellationSelectedPayload,
  type RitualStartedContextPayload,
  type RitualEndedContextPayload,
  type SceneChangedPayload,
  type PlanetaryModeChangedPayload,
} from '@lemos/core';

const CONTEXT_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface IContextManager {
  getSnapshot(): GlobalContext;
  setActiveConstellation(id: string | null): void;
  setActiveRitual(ritualId: string | null, runId: string | null): void;
  setActiveScene(sceneId: string | null): void;
  setPlanetaryMode(mode: PlanetaryMode): void;
  clearContext(): void;
  initialize(): Promise<void>;
}

export class ContextManager implements IContextManager {
  private state: GlobalContext = {
    activeConstellationId: null,
    activeRitualId: null,
    activeRitualRunId: null,
    activeSceneId: null,
    planetaryMode: 'sun',
    timestamp: new Date().toISOString(),
  };

  private lastActivityTimestamp: number = Date.now();
  private timeoutCheckInterval: ReturnType<typeof setInterval> | null = null;
  private readonly STORAGE_KEY = 'lemos.planetaryMode';

  constructor(private eventBus: EventBus, private storage?: IStorage) {
    this.setupEventListeners();
    this.startTimeoutCheck();
  }

  async initialize(): Promise<void> {
    if (!this.storage) {
      console.log('Context: No storage provided, using default planetary mode');
      return;
    }

    try {
      const storedMode = await this.storage.get<PlanetaryMode>(this.STORAGE_KEY);
      if (storedMode) {
        this.state.planetaryMode = storedMode;
        console.log(`Context: Loaded planetary mode from storage: ${storedMode}`);
      } else {
        console.log(`Context: No stored planetary mode found, using default: ${this.state.planetaryMode}`);
      }
    } catch (error) {
      console.error('Context: Failed to load planetary mode from storage:', error);
    }
  }

  private setupEventListeners(): void {
    // Listen to ConstellationSelected events
    this.eventBus.on<ConstellationSelectedPayload>('ConstellationSelected', (event) => {
      this.setActiveConstellation(event.payload.id);
    });

    // Listen to RitualStartedContext events
    this.eventBus.on<RitualStartedContextPayload>('RitualStartedContext', (event) => {
      this.setActiveRitual(event.payload.ritualId, event.payload.runId);
    });

    // Listen to RitualEnded events
    this.eventBus.on<RitualEndedContextPayload>('RitualEnded', (event) => {
      // Clear the ritual when it ends
      if (this.state.activeRitualRunId === event.payload.runId) {
        this.setActiveRitual(null, null);
      }
    });

    // Listen to SceneChanged events
    this.eventBus.on<SceneChangedPayload>('SceneChanged', (event) => {
      this.setActiveScene(event.payload.sceneId);
    });

    // Listen to PlanetaryModeChanged events
    this.eventBus.on<PlanetaryModeChangedPayload>('PlanetaryModeChanged', (event) => {
      this.setPlanetaryMode(event.payload.mode);
    });
  }

  private startTimeoutCheck(): void {
    // Check every 10 minutes for stale context
    this.timeoutCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - this.lastActivityTimestamp;

      if (timeSinceActivity > CONTEXT_TIMEOUT_MS) {
        console.log('Context timeout: Auto-clearing stale context');
        this.clearContext();
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  private updateActivity(): void {
    this.lastActivityTimestamp = Date.now();
    this.state.timestamp = new Date().toISOString();
  }

  getSnapshot(): GlobalContext {
    return { ...this.state };
  }

  setActiveConstellation(id: string | null): void {
    this.state.activeConstellationId = id;
    this.updateActivity();
    console.log(`Context: Active constellation set to ${id}`);
  }

  setActiveRitual(ritualId: string | null, runId: string | null): void {
    this.state.activeRitualId = ritualId;
    this.state.activeRitualRunId = runId;
    this.updateActivity();
    console.log(`Context: Active ritual set to ${ritualId} (run: ${runId})`);
  }

  setActiveScene(sceneId: string | null): void {
    this.state.activeSceneId = sceneId;
    this.updateActivity();
    console.log(`Context: Active scene set to ${sceneId}`);
  }

  setPlanetaryMode(mode: PlanetaryMode): void {
    this.state.planetaryMode = mode;
    this.updateActivity();
    console.log(`Context: Planetary mode set to ${mode}`);

    // Persist to storage asynchronously
    this.persistPlanetaryMode(mode);
  }

  private async persistPlanetaryMode(mode: PlanetaryMode): Promise<void> {
    if (!this.storage) {
      return;
    }

    try {
      await this.storage.set(this.STORAGE_KEY, mode);
      console.log(`Context: Persisted planetary mode to storage: ${mode}`);
    } catch (error) {
      console.error('Context: Failed to persist planetary mode to storage:', error);
    }
  }

  clearContext(): void {
    this.state = {
      activeConstellationId: null,
      activeRitualId: null,
      activeRitualRunId: null,
      activeSceneId: null,
      planetaryMode: 'sun',
      timestamp: new Date().toISOString(),
    };
    this.updateActivity();
    console.log('Context: Context cleared');
  }

  destroy(): void {
    if (this.timeoutCheckInterval) {
      clearInterval(this.timeoutCheckInterval);
      this.timeoutCheckInterval = null;
    }
  }
}
