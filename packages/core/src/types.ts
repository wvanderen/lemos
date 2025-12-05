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
