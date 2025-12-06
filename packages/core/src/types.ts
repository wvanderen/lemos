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
  constellationId?: string; // Optional constellation association (Phase 3)
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
  constellationId?: string; // Optional constellation association (Phase 3)
}

export interface EnergyUpdatedPayload {
  current: number;
  delta: number;
  source: string;
}

// Ritual Events
export interface RitualStartedPayload {
  ritualId: string;
  sessionId: string;
  steps: Array<{ id: string; prompt: string; durationHint: number }>;
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
  constellationId?: string; // Optional constellation association (Phase 3)
}

export interface RitualAbandonedPayload {
  ritualId: string;
  sessionId: string;
  stepsCompleted: number;
}

// Persistence Events
export interface StateHydratedPayload {
  module: string;
  success: boolean;
}

export interface StatePersistedPayload {
  module: string;
  key: string;
}

// Constellation Events (Phase 3)
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

// Context Events (Phase 5)
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

export type PlanetaryMode = 'sun' | 'moon' | 'void';

export interface PlanetaryModeChangedPayload {
  mode: PlanetaryMode;
}

// Global Context (Phase 5)
export interface GlobalContext {
  activeConstellationId: string | null;
  activeRitualId: string | null; // The ritual definition ID (e.g., "morning-anchor")
  activeRitualRunId: string | null; // The specific run/session ID (UUID)
  activeSceneId: string | null;
  planetaryMode: PlanetaryMode;
  timestamp: string; // ISO timestamp of snapshot
}

// Logger Types (Phase 5)
export interface LogEntry<T = unknown> {
  id: string;
  eventType: string; // e.g., "SessionEnded", "NoteCreated"
  timestamp: string; // ISO timestamp
  payload: T; // Original event data

  // Auto-enriched context fields
  constellationId: string | null;
  ritualId: string | null; // The ritual definition ID (e.g., "morning-anchor")
  ritualRunId: string | null; // The specific run/session ID (UUID)
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

// Ritual Template Types (Phase 6)
export type RitualStepType = 'text' | 'movement' | 'sound' | 'prompt' | 'agent' | 'custom';
export type RitualIntensity = 'low' | 'medium' | 'high';

export interface RitualTemplateStep {
  id: string;
  type: RitualStepType;
  content: string;
  duration?: number; // in seconds
}

export interface RitualTemplate {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  steps: RitualTemplateStep[];
  meta: {
    planet?: PlanetaryMode;
    intensity?: RitualIntensity;
    createdAt: string;
    updatedAt: string;
  };
}

// Ritual Editing Events (Phase 6)
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
