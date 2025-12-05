import defaultConstellations from '../../constellations/defaults.json';
export class ConstellationOS {
    bus;
    storage = null;
    initialized = false;
    initPromise = null;
    constructor(bus, storage) {
        this.bus = bus;
        this.storage = storage ?? null;
        this.setupListeners();
        if (this.storage) {
            this.initPromise = this.initializeDefaults();
        }
    }
    /**
     * Ensures defaults have been initialized before proceeding.
     * Called automatically by public methods.
     */
    async ensureInitialized() {
        if (this.initPromise) {
            await this.initPromise;
        }
    }
    setupListeners() {
        // Listen to SessionEnded to log session associations
        this.bus.on('SessionEnded', (event) => {
            this.logSession(event.payload);
        });
        // Listen to RitualCompleted to update ritual logs with constellation association
        this.bus.on('RitualCompleted', (event) => {
            this.updateRitualLog(event.payload);
        });
    }
    async initializeDefaults() {
        if (!this.storage || this.initialized)
            return;
        try {
            // Check if constellations already exist
            const existing = await this.storage.query('constellation_definitions');
            if (existing.length === 0) {
                console.log('No constellations found, initializing defaults...');
                // Use imported defaults
                for (const constellation of defaultConstellations) {
                    const def = {
                        ...constellation,
                        createdAt: new Date().toISOString(),
                    };
                    await this.storage.insert('constellation_definitions', def);
                }
                console.log(`Initialized ${defaultConstellations.length} default constellations`);
            }
            else {
                console.log(`Found ${existing.length} existing constellations`);
            }
            this.initialized = true;
        }
        catch (error) {
            console.error('Failed to initialize default constellations:', error);
            // Don't throw - allow the app to continue
            this.initialized = true;
        }
    }
    // CRUD Operations
    async createConstellation(data) {
        await this.ensureInitialized();
        if (!this.storage) {
            throw new Error('Storage not available');
        }
        // Generate slug-style ID from name
        const id = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const constellation = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
        };
        await this.storage.insert('constellation_definitions', constellation);
        this.bus.emit({
            id: crypto.randomUUID(),
            type: 'ConstellationCreated',
            timestamp: new Date().toISOString(),
            payload: {
                id: constellation.id,
                name: constellation.name,
                color: constellation.color,
                icon: constellation.icon,
            },
        });
        console.log(`Created constellation: ${constellation.name} (${id})`);
        return id;
    }
    async updateConstellation(id, changes) {
        await this.ensureInitialized();
        if (!this.storage) {
            throw new Error('Storage not available');
        }
        // Get existing constellation
        const existing = await this.getConstellation(id);
        if (!existing) {
            throw new Error(`Constellation not found: ${id}`);
        }
        // Update the constellation
        const updated = {
            ...existing,
            ...changes,
        };
        // Use update() to preserve the ID and replace the existing record
        await this.storage.update('constellation_definitions', updated);
        this.bus.emit({
            id: crypto.randomUUID(),
            type: 'ConstellationUpdated',
            timestamp: new Date().toISOString(),
            payload: {
                id,
                changes,
            },
        });
        console.log(`Updated constellation: ${id}`);
    }
    async archiveConstellation(id) {
        await this.updateConstellation(id, { archived: true });
        this.bus.emit({
            id: crypto.randomUUID(),
            type: 'ConstellationArchived',
            timestamp: new Date().toISOString(),
            payload: { id },
        });
        console.log(`Archived constellation: ${id}`);
    }
    // Context Operations (Phase 5)
    selectConstellation(id) {
        this.bus.emit({
            id: crypto.randomUUID(),
            type: 'ConstellationSelected',
            timestamp: new Date().toISOString(),
            payload: { id },
        });
        console.log(`Selected constellation: ${id}`);
    }
    // Query Operations
    async listConstellations(includeArchived = false) {
        await this.ensureInitialized();
        if (!this.storage)
            return [];
        try {
            const all = await this.storage.query('constellation_definitions');
            if (includeArchived) {
                return all;
            }
            return all.filter(c => !c.archived);
        }
        catch (error) {
            console.error('Failed to list constellations:', error);
            return [];
        }
    }
    async getConstellation(id) {
        await this.ensureInitialized();
        if (!this.storage)
            return null;
        try {
            const results = await this.storage.query('constellation_definitions', { id });
            return results[0] ?? null;
        }
        catch (error) {
            console.error('Failed to get constellation:', error);
            return null;
        }
    }
    // Statistics
    async getStats(id) {
        await this.ensureInitialized();
        if (!this.storage) {
            return {
                constellationId: id,
                totalSessions: 0,
                totalRituals: 0,
                totalMinutes: 0,
                lastActivityAt: null,
                completionRate: 0,
            };
        }
        try {
            // Query session logs
            const sessions = await this.storage.query('session_logs', { constellationId: id });
            // Query ritual logs
            const rituals = await this.storage.query('ritual_logs', { constellationId: id });
            // Calculate total minutes from sessions
            const totalSessionMinutes = sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60;
            // Calculate total minutes from rituals
            const totalRitualMinutes = rituals.reduce((sum, r) => sum + r.durationSeconds, 0) / 60;
            // Calculate completion rate
            const completedSessions = sessions.filter(s => s.wasCompleted).length;
            const completionRate = sessions.length > 0
                ? (completedSessions / sessions.length) * 100
                : 0;
            // Find last activity
            const allActivities = [
                ...sessions.map(s => s.completedAt),
                ...rituals.map(r => r.completedAt),
            ].sort().reverse();
            const lastActivityAt = allActivities[0] ?? null;
            return {
                constellationId: id,
                totalSessions: sessions.length,
                totalRituals: rituals.length,
                totalMinutes: Math.round(totalSessionMinutes + totalRitualMinutes),
                lastActivityAt,
                completionRate: Math.round(completionRate),
            };
        }
        catch (error) {
            console.error('Failed to get constellation stats:', error);
            return {
                constellationId: id,
                totalSessions: 0,
                totalRituals: 0,
                totalMinutes: 0,
                lastActivityAt: null,
                completionRate: 0,
            };
        }
    }
    // Event Handlers
    async logSession(payload) {
        if (!this.storage || !payload.constellationId)
            return;
        try {
            const log = {
                sessionId: payload.sessionId,
                constellationId: payload.constellationId,
                startedAt: new Date(Date.now() - payload.actualDuration * 1000).toISOString(),
                completedAt: new Date().toISOString(),
                durationSeconds: payload.actualDuration,
                plannedDuration: payload.actualDuration, // TODO: Get from SessionStarted event
                wasCompleted: payload.wasCompleted,
            };
            await this.storage.insert('session_logs', log);
            console.log(`Logged session for constellation: ${payload.constellationId}`);
        }
        catch (error) {
            console.error('Failed to log session:', error);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateRitualLog(_payload) {
        // Note: RitualOS already logs to ritual_logs, and the schema now includes constellationId
        // This is handled by the updated RitualOS module
        // This method is a placeholder for future enhancements
    }
}
