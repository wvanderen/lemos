import {
  EventBus,
  RitualStartedPayload,
  RitualStepCompletedPayload,
  RitualCompletedPayload,
  RitualAbandonedPayload,
  RitualDefinition,
  RitualLog,
  IStorage
} from '@lemos/core';

interface ActiveRitual {
  sessionId: string;
  ritualId: string;
  definition: RitualDefinition;
  currentStepIndex: number;
  startedAt: Date;
  stepsCompleted: string[];
}

export class RitualOS {
  private bus: EventBus;
  private storage: IStorage | null = null;
  private rituals: Map<string, RitualDefinition> = new Map();
  private activeRitual: ActiveRitual | null = null;

  constructor(bus: EventBus, ritualDefinitions: RitualDefinition[], storage?: IStorage) {
    this.bus = bus;
    this.storage = storage ?? null;

    // Load ritual definitions
    ritualDefinitions.forEach(ritual => {
      this.rituals.set(ritual.id, ritual);
    });

    console.log(`Loaded ${this.rituals.size} ritual definitions`);
  }

  getRitualDefinitions(): RitualDefinition[] {
    return Array.from(this.rituals.values());
  }

  getRitualDefinition(ritualId: string): RitualDefinition | null {
    return this.rituals.get(ritualId) ?? null;
  }

  getActiveRitual(): ActiveRitual | null {
    return this.activeRitual;
  }

  startRitual(ritualId: string): void {
    const definition = this.rituals.get(ritualId);

    if (!definition) {
      throw new Error(`Ritual not found: ${ritualId}`);
    }

    if (this.activeRitual) {
      throw new Error(`Ritual already active: ${this.activeRitual.ritualId}`);
    }

    const sessionId = crypto.randomUUID();

    this.activeRitual = {
      sessionId,
      ritualId,
      definition,
      currentStepIndex: 0,
      startedAt: new Date(),
      stepsCompleted: [],
    };

    this.bus.emit<RitualStartedPayload>({
      id: crypto.randomUUID(),
      type: 'RitualStarted',
      timestamp: new Date().toISOString(),
      payload: {
        ritualId,
        sessionId,
        steps: definition.steps,
      },
    });
  }

  completeStep(): void {
    if (!this.activeRitual) {
      throw new Error('No active ritual');
    }

    const currentStep = this.activeRitual.definition.steps[this.activeRitual.currentStepIndex];

    if (!currentStep) {
      throw new Error('No current step');
    }

    const completedStepIndex = this.activeRitual.currentStepIndex;
    this.activeRitual.stepsCompleted.push(currentStep.id);

    // Move to next step BEFORE emitting event so UI reads correct state
    this.activeRitual.currentStepIndex++;

    this.bus.emit<RitualStepCompletedPayload>({
      id: crypto.randomUUID(),
      type: 'RitualStepCompleted',
      timestamp: new Date().toISOString(),
      payload: {
        ritualId: this.activeRitual.ritualId,
        sessionId: this.activeRitual.sessionId,
        stepId: currentStep.id,
        stepIndex: completedStepIndex, // The step we just completed
      },
    });

    // Check if ritual is complete
    if (this.activeRitual.currentStepIndex >= this.activeRitual.definition.steps.length) {
      this.completeRitual();
    }
  }

  private completeRitual(): void {
    if (!this.activeRitual) {
      return;
    }

    const totalDuration = Math.floor((Date.now() - this.activeRitual.startedAt.getTime()) / 1000);

    this.bus.emit<RitualCompletedPayload>({
      id: crypto.randomUUID(),
      type: 'RitualCompleted',
      timestamp: new Date().toISOString(),
      payload: {
        ritualId: this.activeRitual.ritualId,
        sessionId: this.activeRitual.sessionId,
        totalDuration,
        completedAt: new Date().toISOString(),
      },
    });

    // Log to storage
    this.logCompletion(
      this.activeRitual.ritualId,
      totalDuration,
      this.activeRitual.stepsCompleted
    );

    // Clear active ritual
    this.activeRitual = null;
  }

  abandonRitual(): void {
    if (!this.activeRitual) {
      throw new Error('No active ritual');
    }

    const stepsCompleted = this.activeRitual.stepsCompleted.length;

    this.bus.emit<RitualAbandonedPayload>({
      id: crypto.randomUUID(),
      type: 'RitualAbandoned',
      timestamp: new Date().toISOString(),
      payload: {
        ritualId: this.activeRitual.ritualId,
        sessionId: this.activeRitual.sessionId,
        stepsCompleted,
      },
    });

    this.activeRitual = null;
  }

  private async logCompletion(
    ritualId: string,
    durationSeconds: number,
    stepsCompleted: string[]
  ): Promise<void> {
    if (!this.storage) return;

    try {
      const log: Omit<RitualLog, 'id'> = {
        ritualId,
        completedAt: new Date().toISOString(),
        durationSeconds,
        stepsCompleted,
      };

      await this.storage.insert('ritual_logs', log);
      console.log(`Logged ritual completion: ${ritualId}`);
    } catch (error) {
      console.error('Failed to log ritual completion:', error);
    }
  }

  async getRitualHistory(ritualId?: string): Promise<RitualLog[]> {
    if (!this.storage) return [];

    try {
      const filter = ritualId ? { ritualId } : undefined;
      return await this.storage.query<RitualLog>('ritual_logs', filter);
    } catch (error) {
      console.error('Failed to get ritual history:', error);
      return [];
    }
  }
}
