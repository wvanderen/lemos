export interface IStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  query<T>(table: string, filter?: Record<string, unknown>): Promise<T[]>;
  insert<T>(table: string, record: T): Promise<string>; // returns ID
}

export interface RitualLog {
  id: string;              // UUID
  ritualId: string;        // e.g., "morning-anchor"
  completedAt: string;     // ISO timestamp
  durationSeconds: number; // Total time taken
  stepsCompleted: string[]; // Array of step IDs
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
  durationHint: number; // in seconds
}

export interface RitualDefinition {
  id: string;
  name: string;
  description: string;
  steps: RitualStep[];
}
