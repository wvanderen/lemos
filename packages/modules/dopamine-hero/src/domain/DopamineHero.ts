import {
  EventBus,
  BaseEvent,
  SessionTickPayload,
  EnergyUpdatedPayload,
  RitualCompletedPayload,
  StateHydratedPayload,
  DopamineState,
  IStorage
} from '@lemos/core';

export class DopamineHero {
  private bus: EventBus;
  private storage: IStorage | null = null;
  private energy: number = 0;
  private xp: number = 0;
  private level: number = 1;
  private energyPerSecond: number = 1;
  private isHydrated: boolean = false;

  constructor(bus: EventBus, storage?: IStorage) {
    this.bus = bus;
    this.storage = storage ?? null;
    this.setupListeners();

    if (this.storage) {
      this.loadState();
    }
  }

  private setupListeners(): void {
    this.bus.on<SessionTickPayload>('SessionTick', (event: BaseEvent<SessionTickPayload>) => {
      this.handleSessionTick(event.payload);
    });

    this.bus.on<RitualCompletedPayload>('RitualCompleted', (event: BaseEvent<RitualCompletedPayload>) => {
      this.handleRitualCompleted(event.payload);
    });
  }

  private async loadState(): Promise<void> {
    if (!this.storage) return;

    try {
      const state = await this.storage.get<DopamineState>('dopamine-hero:state');

      if (state) {
        this.energy = state.energy;
        this.xp = state.xp;
        this.level = state.level;
        this.isHydrated = true;

        this.bus.emit<StateHydratedPayload>({
          id: crypto.randomUUID(),
          type: 'StateHydrated',
          timestamp: new Date().toISOString(),
          payload: {
            module: 'dopamine-hero',
            success: true,
          },
        });

        // Emit initial energy state
        this.bus.emit<EnergyUpdatedPayload>({
          id: crypto.randomUUID(),
          type: 'EnergyUpdated',
          timestamp: new Date().toISOString(),
          payload: {
            current: this.energy,
            delta: 0,
            source: 'hydration',
          },
        });
      } else {
        this.isHydrated = true;
        this.bus.emit<StateHydratedPayload>({
          id: crypto.randomUUID(),
          type: 'StateHydrated',
          timestamp: new Date().toISOString(),
          payload: {
            module: 'dopamine-hero',
            success: true,
          },
        });
      }
    } catch (error) {
      console.error('Failed to load dopamine-hero state:', error);
      this.bus.emit<StateHydratedPayload>({
        id: crypto.randomUUID(),
        type: 'StateHydrated',
        timestamp: new Date().toISOString(),
        payload: {
          module: 'dopamine-hero',
          success: false,
        },
      });
    }
  }

  private async saveState(): Promise<void> {
    if (!this.storage) return;

    try {
      const state: DopamineState = {
        energy: this.energy,
        xp: this.xp,
        level: this.level,
        updatedAt: new Date().toISOString(),
      };

      await this.storage.set('dopamine-hero:state', state);
    } catch (error) {
      console.error('Failed to save dopamine-hero state:', error);
    }
  }

  private handleSessionTick(payload: SessionTickPayload): void {
    this.addEnergy(this.energyPerSecond, `tick-${payload.sessionId}`);
  }

  private handleRitualCompleted(payload: RitualCompletedPayload): void {
    // Reward calculation is the responsibility of DopamineHero, not RitualOS
    // This allows rewards to be dynamic based on game state (level, streaks, etc.)
    const rewards = this.getRitualReward(payload.ritualId);

    if (rewards.energy > 0) {
      this.addEnergy(rewards.energy, `ritual-${payload.ritualId}`);
    }

    if (rewards.xp > 0) {
      this.addXP(rewards.xp);
    }
  }

  private getRitualReward(ritualId: string): { energy: number; xp: number } {
    // Static rewards for MVP - future: calculate based on game state
    // (e.g., level multipliers, streak bonuses, time-of-day modifiers)
    const rewards: Record<string, { energy: number; xp: number }> = {
      'morning-anchor': { energy: 15, xp: 20 },
    };

    return rewards[ritualId] ?? { energy: 0, xp: 0 };
  }

  private addEnergy(amount: number, source: string): void {
    this.energy += amount;

    this.bus.emit<EnergyUpdatedPayload>({
      id: crypto.randomUUID(),
      type: 'EnergyUpdated',
      timestamp: new Date().toISOString(),
      payload: {
        current: this.energy,
        delta: amount,
        source,
      },
    });

    this.saveState();
  }

  private addXP(amount: number): void {
    this.xp += amount;

    // Simple level-up logic: level = 1 + floor(xp / 100)
    const newLevel = 1 + Math.floor(this.xp / 100);
    if (newLevel > this.level) {
      this.level = newLevel;
      console.log(`Level up! Now level ${this.level}`);
    }

    this.saveState();
  }

  getEnergy(): number {
    return this.energy;
  }

  getXP(): number {
    return this.xp;
  }

  getLevel(): number {
    return this.level;
  }

  isStateHydrated(): boolean {
    return this.isHydrated;
  }

  setEnergyPerSecond(rate: number): void {
    this.energyPerSecond = rate;
  }

  getEnergyPerSecond(): number {
    return this.energyPerSecond;
  }
}
