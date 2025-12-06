export interface BaseEvent<T = unknown> {
    id: string;
    type: string;
    timestamp: string;
    payload: T;
}
export type EventListener<T = unknown> = (event: BaseEvent<T>) => void;
export interface LemOSModuleManifest {
    id: string;
    name: string;
    version: string;
}
export interface SessionStartedPayload {
    sessionId: string;
    intendedDuration: number;
    constellationId?: string;
}
export interface SessionTickPayload {
    sessionId: string;
    remaining: number;
    elapsed: number;
}
export interface SessionEndedPayload {
    sessionId: string;
    actualDuration: number;
    wasCompleted: boolean;
    constellationId?: string;
}
export interface EnergyUpdatedPayload {
    current: number;
    delta: number;
    source: string;
}
export interface RitualStartedPayload {
    ritualId: string;
    sessionId: string;
    steps: Array<{
        id: string;
        prompt: string;
        durationHint: number;
    }>;
}
export interface RitualStepCompletedPayload {
    ritualId: string;
    sessionId: string;
    stepId: string;
    stepIndex: number;
}
export interface RitualCompletedPayload {
    ritualId: string;
    sessionId: string;
    totalDuration: number;
    completedAt: string;
    constellationId?: string;
}
export interface RitualAbandonedPayload {
    ritualId: string;
    sessionId: string;
    stepsCompleted: number;
}
export interface StateHydratedPayload {
    module: string;
    success: boolean;
}
export interface StatePersistedPayload {
    module: string;
    key: string;
}
export interface ConstellationCreatedPayload {
    id: string;
    name: string;
    color: string;
    icon: string;
}
export interface ConstellationUpdatedPayload {
    id: string;
    changes: {
        name?: string;
        description?: string;
        color?: string;
        icon?: string;
        archived?: boolean;
    };
}
export interface ConstellationArchivedPayload {
    id: string;
}
export interface ConstellationSelectedPayload {
    id: string | null;
}
export interface RitualStartedContextPayload {
    runId: string;
    ritualId: string;
}
export interface RitualEndedContextPayload {
    runId: string;
}
export interface SceneChangedPayload {
    sceneId: string | null;
}
export type PlanetaryMode = 'earth' | 'mars' | 'jupiter' | 'saturn';
export interface PlanetaryModeChangedPayload {
    mode: PlanetaryMode;
}
export interface GlobalContext {
    activeConstellationId: string | null;
    activeRitualId: string | null;
    activeRitualRunId: string | null;
    activeSceneId: string | null;
    planetaryMode: PlanetaryMode;
    timestamp: string;
}
export interface LogEntry<T = unknown> {
    id: string;
    eventType: string;
    timestamp: string;
    payload: T;
    constellationId: string | null;
    ritualId: string | null;
    ritualRunId: string | null;
    sceneId: string | null;
    planetaryMode: PlanetaryMode;
}
export interface LogFilter {
    eventType?: string | string[];
    constellationId?: string;
    ritualRunId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
}
export interface NoteCreatedPayload {
    noteId: string;
    text: string;
    timestamp: string;
}
export interface TaskCompletedPayload {
    taskId: string;
    completedAt: string;
}
export interface RitualCreatedPayload {
    ritualId: string;
    name: string;
    tags?: string[];
}
export interface RitualUpdatedPayload {
    ritualId: string;
    changes: Partial<RitualTemplate>;
}
export interface RitualDeletedPayload {
    ritualId: string;
}
export type RitualStepType = 'text' | 'movement' | 'sound' | 'prompt' | 'agent' | 'custom';
export type RitualIntensity = 'low' | 'medium' | 'high';
export interface RitualTemplateStep {
    id: string;
    type: RitualStepType;
    content: string;
    duration?: number;
}
export interface RitualTemplate {
    id: string;
    name: string;
    description?: string;
    tags?: string[];
    steps: RitualTemplateStep[];
    meta: {
        planet?: string;
        intensity?: RitualIntensity;
        createdAt: string;
        updatedAt: string;
    };
}
