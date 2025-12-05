export class UnifiedLogger {
    eventBus;
    storage;
    contextProvider;
    constructor(eventBus, storage, contextProvider) {
        this.eventBus = eventBus;
        this.storage = storage;
        this.contextProvider = contextProvider;
        this.setupEventListeners();
    }
    setupEventListeners() {
        // Listen to SessionEnded events
        this.eventBus.on('SessionEnded', async (event) => {
            await this.logEvent('SessionEnded', event.payload);
        });
        // Listen to RitualCompleted events
        this.eventBus.on('RitualCompleted', async (event) => {
            await this.logEvent('RitualCompleted', event.payload);
        });
        // Listen to NoteCreated events
        this.eventBus.on('NoteCreated', async (event) => {
            await this.logEvent('NoteCreated', event.payload);
        });
        // Listen to TaskCompleted events
        this.eventBus.on('TaskCompleted', async (event) => {
            await this.logEvent('TaskCompleted', event.payload);
        });
    }
    async logEvent(eventType, payload, contextOverride) {
        try {
            // Get current context from the context manager
            const currentContext = this.contextProvider();
            // Merge with any context overrides
            const context = { ...currentContext, ...contextOverride };
            // Create log entry
            const logEntry = {
                id: this.generateId(),
                eventType,
                timestamp: new Date().toISOString(),
                payload,
                constellationId: context.activeConstellationId,
                ritualId: context.activeRitualId,
                ritualRunId: context.activeRitualRunId,
                sceneId: context.activeSceneId,
                planetaryMode: context.planetaryMode,
            };
            // Convert to storage format (with payload as JSON string)
            const storageEntry = {
                ...logEntry,
                payload: JSON.stringify(payload),
            };
            // Write to storage
            await this.storage.insert('unified_logs', storageEntry);
            console.log(`Logger: Logged event ${eventType} with context`, {
                constellationId: context.activeConstellationId,
                ritualRunId: context.activeRitualRunId,
            });
        }
        catch (error) {
            console.error('Logger: Failed to log event', error);
        }
    }
    async queryLogs(filters) {
        try {
            // Build query filter
            const queryFilter = {};
            if (filters.eventType) {
                if (Array.isArray(filters.eventType)) {
                    // For array of event types, we'll need to query all and filter in memory
                    // since IStorage doesn't support OR queries
                    queryFilter.eventType = filters.eventType[0]; // Use first as base query
                }
                else {
                    queryFilter.eventType = filters.eventType;
                }
            }
            if (filters.constellationId) {
                queryFilter.constellationId = filters.constellationId;
            }
            if (filters.ritualRunId) {
                queryFilter.ritualRunId = filters.ritualRunId;
            }
            // Query storage
            const results = await this.storage.query('unified_logs', queryFilter);
            // Parse payload strings back to objects
            let logs = results.map((entry) => ({
                ...entry,
                payload: typeof entry.payload === 'string' ? JSON.parse(entry.payload) : entry.payload,
            }));
            // Apply additional filters in memory
            if (filters.eventType && Array.isArray(filters.eventType)) {
                logs = logs.filter((log) => filters.eventType.includes(log.eventType));
            }
            if (filters.startDate) {
                logs = logs.filter((log) => log.timestamp >= filters.startDate);
            }
            if (filters.endDate) {
                logs = logs.filter((log) => log.timestamp <= filters.endDate);
            }
            // Sort by timestamp descending (most recent first)
            logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            // Apply limit
            if (filters.limit) {
                logs = logs.slice(0, filters.limit);
            }
            return logs;
        }
        catch (error) {
            console.error('Logger: Failed to query logs', error);
            return [];
        }
    }
    generateId() {
        // Simple UUID v4 generator
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
