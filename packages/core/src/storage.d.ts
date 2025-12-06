export interface IStorage {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    query<T>(table: string, filter?: Record<string, unknown>): Promise<T[]>;
    insert<T>(table: string, record: T): Promise<string>;
    update<T>(table: string, record: T): Promise<void>;
    deleteRecord(table: string, id: string): Promise<void>;
}
export interface RitualLog {
    id: string;
    ritualId: string;
    constellationId: string | null;
    completedAt: string;
    durationSeconds: number;
    stepsCompleted: string[];
}
export interface DopamineState {
    energy: number;
    xp: number;
    level: number;
    updatedAt: string;
}
export interface RitualStep {
    id: string;
    prompt: string;
    durationHint: number;
}
export interface RitualDefinition {
    id: string;
    name: string;
    description: string;
    steps: RitualStep[];
}
export interface ConstellationDefinition {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    createdAt: string;
    archived: boolean;
}
export interface SessionLog {
    id: string;
    sessionId: string;
    constellationId: string | null;
    startedAt: string;
    completedAt: string;
    durationSeconds: number;
    plannedDuration: number;
    wasCompleted: boolean;
}
export interface ConstellationStats {
    constellationId: string;
    totalSessions: number;
    totalRituals: number;
    totalMinutes: number;
    lastActivityAt: string | null;
    completionRate: number;
}
export interface UnifiedLog {
    id: string;
    eventType: string;
    timestamp: string;
    payload: string;
    constellationId: string | null;
    ritualId: string | null;
    ritualRunId: string | null;
    sceneId: string | null;
    planetaryMode: string;
}
export interface ContextSnapshot {
    id: string;
    timestamp: string;
    activeConstellationId: string | null;
    activeRitualRunId: string | null;
    activeSceneId: string | null;
    planetaryMode: string;
}
