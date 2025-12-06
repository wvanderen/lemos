import {
  EventBus,
  IStorage,
  GlobalContext,
  LogEntry,
  LogFilter,
  type BaseEvent,
  type SessionEndedPayload,
  type RitualCompletedPayload,
  type NoteCreatedPayload,
  type TaskCompletedPayload,
  type RitualCreatedPayload,
  type RitualUpdatedPayload,
  type RitualDeletedPayload,
} from '@lemos/core';

export interface ILoggerModule {
  logEvent(eventType: string, payload: object, context?: Partial<GlobalContext>): Promise<void>;
  queryLogs(filters: LogFilter): Promise<LogEntry[]>;
}

export class UnifiedLogger implements ILoggerModule {
  constructor(
    private eventBus: EventBus,
    private storage: IStorage,
    private contextProvider: () => GlobalContext
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen to SessionEnded events
    this.eventBus.on<SessionEndedPayload>('SessionEnded', async (event: BaseEvent<SessionEndedPayload>) => {
      await this.logEvent('SessionEnded', event.payload);
    });

    // Listen to RitualCompleted events
    this.eventBus.on<RitualCompletedPayload>('RitualCompleted', async (event: BaseEvent<RitualCompletedPayload>) => {
      await this.logEvent('RitualCompleted', event.payload);
    });

    // Listen to NoteCreated events
    this.eventBus.on<NoteCreatedPayload>('NoteCreated', async (event: BaseEvent<NoteCreatedPayload>) => {
      await this.logEvent('NoteCreated', event.payload);
    });

    // Listen to TaskCompleted events
    this.eventBus.on<TaskCompletedPayload>('TaskCompleted', async (event: BaseEvent<TaskCompletedPayload>) => {
      await this.logEvent('TaskCompleted', event.payload);
    });

    // Phase 6: Listen to Ritual Editing events
    this.eventBus.on<RitualCreatedPayload>('RitualCreated', async (event: BaseEvent<RitualCreatedPayload>) => {
      await this.logEvent('RitualCreated', event.payload);
    });

    this.eventBus.on<RitualUpdatedPayload>('RitualUpdated', async (event: BaseEvent<RitualUpdatedPayload>) => {
      await this.logEvent('RitualUpdated', event.payload);
    });

    this.eventBus.on<RitualDeletedPayload>('RitualDeleted', async (event: BaseEvent<RitualDeletedPayload>) => {
      await this.logEvent('RitualDeleted', event.payload);
    });
  }

  async logEvent(
    eventType: string,
    payload: object,
    contextOverride?: Partial<GlobalContext>
  ): Promise<void> {
    try {
      // Get current context from the context manager
      const currentContext = this.contextProvider();

      // Merge with any context overrides
      const context = { ...currentContext, ...contextOverride };

      // Create log entry
      const logEntry: LogEntry = {
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
    } catch (error) {
      console.error('Logger: Failed to log event', error);
    }
  }

  async queryLogs(filters: LogFilter): Promise<LogEntry[]> {
    try {
      // Build query filter
      const queryFilter: Record<string, unknown> = {};

      if (filters.eventType && !Array.isArray(filters.eventType)) {
        queryFilter.eventType = filters.eventType;
      }

      if (filters.constellationId) {
        queryFilter.constellationId = filters.constellationId;
      }

      if (filters.ritualRunId) {
        queryFilter.ritualRunId = filters.ritualRunId;
      }

      // Query storage
      const results = await this.storage.query<LogEntry & { payload: string }>('unified_logs', queryFilter);

      // Parse payload strings back to objects
      let logs: LogEntry[] = results.map((entry: LogEntry & { payload: string }) => ({
        ...entry,
        payload: typeof entry.payload === 'string' ? JSON.parse(entry.payload) : entry.payload,
      }));

      // Apply additional filters in memory
      if (filters.eventType && Array.isArray(filters.eventType)) {
        logs = logs.filter((log) => filters.eventType!.includes(log.eventType));
      }

      if (filters.startDate) {
        logs = logs.filter((log) => log.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        logs = logs.filter((log) => log.timestamp <= filters.endDate!);
      }

      // Sort by timestamp descending (most recent first)
      logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      // Apply limit
      if (filters.limit) {
        logs = logs.slice(0, filters.limit);
      }

      return logs;
    } catch (error) {
      console.error('Logger: Failed to query logs', error);
      return [];
    }
  }

  private generateId(): string {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
