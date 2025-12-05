import { EventBus, BaseEvent, SessionTickPayload, EnergyUpdatedPayload } from '@lemos/core';

export class DopamineHero {
  private bus: EventBus;
  private energy: number = 0;
  private energyPerSecond: number = 1;

  constructor(bus: EventBus) {
    this.bus = bus;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.bus.on<SessionTickPayload>('SessionTick', (event: BaseEvent<SessionTickPayload>) => {
      this.handleSessionTick(event.payload);
    });
  }

  private handleSessionTick(payload: SessionTickPayload): void {
    this.addEnergy(this.energyPerSecond, `tick-${payload.sessionId}`);
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
  }

  getEnergy(): number {
    return this.energy;
  }

  setEnergyPerSecond(rate: number): void {
    this.energyPerSecond = rate;
  }

  getEnergyPerSecond(): number {
    return this.energyPerSecond;
  }
}
