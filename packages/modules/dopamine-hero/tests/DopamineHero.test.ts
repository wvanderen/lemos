import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventBus } from '@lemos/core';
import { DopamineHero } from '../src/domain/DopamineHero.js';

describe('DopamineHero', () => {
  let bus: EventBus;
  let hero: DopamineHero;

  beforeEach(() => {
    bus = new EventBus();
    hero = new DopamineHero(bus);
  });

  it('starts with 0 energy', () => {
    expect(hero.getEnergy()).toBe(0);
  });

  it('starts with 1 energy per second', () => {
    expect(hero.getEnergyPerSecond()).toBe(1);
  });

  it('awards 1 energy per session tick', () => {
    const energyHandler = vi.fn();
    bus.on('EnergyUpdated', energyHandler);

    bus.emit({
      id: crypto.randomUUID(),
      type: 'SessionTick',
      timestamp: new Date().toISOString(),
      payload: {
        sessionId: 'test-session-1',
        remaining: 100,
        elapsed: 1,
      },
    });

    expect(hero.getEnergy()).toBe(1);
    expect(energyHandler).toHaveBeenCalledTimes(1);
    expect(energyHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'EnergyUpdated',
        payload: expect.objectContaining({
          current: 1,
          delta: 1,
        }),
      }),
    );
  });

  it('accumulates energy across multiple ticks', () => {
    for (let i = 1; i <= 10; i++) {
      bus.emit({
        id: crypto.randomUUID(),
        type: 'SessionTick',
        timestamp: new Date().toISOString(),
        payload: {
          sessionId: 'test-session',
          remaining: 100 - i,
          elapsed: i,
        },
      });
    }

    expect(hero.getEnergy()).toBe(10);
  });

  it('allows setting custom energy per second rate', () => {
    hero.setEnergyPerSecond(5);

    bus.emit({
      id: crypto.randomUUID(),
      type: 'SessionTick',
      timestamp: new Date().toISOString(),
      payload: {
        sessionId: 'test-session',
        remaining: 100,
        elapsed: 1,
      },
    });

    expect(hero.getEnergy()).toBe(5);
  });

  it('emits EnergyUpdated event with correct payload', () => {
    const energyHandler = vi.fn();
    bus.on('EnergyUpdated', energyHandler);

    hero.setEnergyPerSecond(3);

    bus.emit({
      id: crypto.randomUUID(),
      type: 'SessionTick',
      timestamp: new Date().toISOString(),
      payload: {
        sessionId: 'test-session',
        remaining: 100,
        elapsed: 1,
      },
    });

    expect(energyHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'EnergyUpdated',
        payload: expect.objectContaining({
          current: 3,
          delta: 3,
          source: 'tick-test-session',
        }),
      }),
    );
  });
});
