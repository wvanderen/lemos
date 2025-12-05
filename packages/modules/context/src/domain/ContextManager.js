const CONTEXT_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours
export class ContextManager {
    eventBus;
    state = {
        activeConstellationId: null,
        activeRitualId: null,
        activeRitualRunId: null,
        activeSceneId: null,
        planetaryMode: 'earth',
        timestamp: new Date().toISOString(),
    };
    lastActivityTimestamp = Date.now();
    timeoutCheckInterval = null;
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.setupEventListeners();
        this.startTimeoutCheck();
    }
    setupEventListeners() {
        // Listen to ConstellationSelected events
        this.eventBus.on('ConstellationSelected', (event) => {
            this.setActiveConstellation(event.payload.id);
        });
        // Listen to RitualStarted events
        this.eventBus.on('RitualStarted', (event) => {
            this.setActiveRitual(event.payload.ritualId, event.payload.sessionId);
        });
        // Listen to RitualEnded events
        this.eventBus.on('RitualEnded', (event) => {
            // Clear the ritual when it ends
            if (this.state.activeRitualRunId === event.payload.runId) {
                this.setActiveRitual(null, null);
            }
        });
        // Listen to SceneChanged events
        this.eventBus.on('SceneChanged', (event) => {
            this.setActiveScene(event.payload.sceneId);
        });
        // Listen to PlanetaryModeChanged events
        this.eventBus.on('PlanetaryModeChanged', (event) => {
            this.setPlanetaryMode(event.payload.mode);
        });
    }
    startTimeoutCheck() {
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
    updateActivity() {
        this.lastActivityTimestamp = Date.now();
        this.state.timestamp = new Date().toISOString();
    }
    getSnapshot() {
        return { ...this.state };
    }
    setActiveConstellation(id) {
        this.state.activeConstellationId = id;
        this.updateActivity();
        console.log(`Context: Active constellation set to ${id}`);
    }
    setActiveRitual(ritualId, runId) {
        this.state.activeRitualId = ritualId;
        this.state.activeRitualRunId = runId;
        this.updateActivity();
        console.log(`Context: Active ritual set to ${ritualId} (run: ${runId})`);
    }
    setActiveScene(sceneId) {
        this.state.activeSceneId = sceneId;
        this.updateActivity();
        console.log(`Context: Active scene set to ${sceneId}`);
    }
    setPlanetaryMode(mode) {
        this.state.planetaryMode = mode;
        this.updateActivity();
        console.log(`Context: Planetary mode set to ${mode}`);
    }
    clearContext() {
        this.state = {
            activeConstellationId: null,
            activeRitualId: null,
            activeRitualRunId: null,
            activeSceneId: null,
            planetaryMode: 'earth',
            timestamp: new Date().toISOString(),
        };
        this.updateActivity();
        console.log('Context: Context cleared');
    }
    destroy() {
        if (this.timeoutCheckInterval) {
            clearInterval(this.timeoutCheckInterval);
            this.timeoutCheckInterval = null;
        }
    }
}
