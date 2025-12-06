import { useState, useEffect } from 'react';
import type { EventBus, BaseEvent, EnergyUpdatedPayload, StateHydratedPayload } from '@lemos/core';
import type { DopamineHero } from '@lemos/modules-dopamine-hero';

interface EnergyDisplayProps {
  bus: EventBus;
  hero: DopamineHero;
}

export function EnergyDisplay({ bus, hero }: EnergyDisplayProps): JSX.Element {
  const [energy, setEnergy] = useState<number>(0);
  const [xp, setXP] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [energyPerSecond, setEnergyPerSecond] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleEnergyUpdate = (event: BaseEvent<EnergyUpdatedPayload>) => {
      setEnergy(event.payload.current);
      setXP(hero.getXP());
      setLevel(hero.getLevel());
    };

    const handleStateHydrated = (event: BaseEvent<StateHydratedPayload>) => {
      if (event.payload.module === 'dopamine-hero') {
        setIsLoading(false);
        if (event.payload.success) {
          setEnergy(hero.getEnergy());
          setXP(hero.getXP());
          setLevel(hero.getLevel());
        }
      }
    };

    bus.on('EnergyUpdated', handleEnergyUpdate);
    bus.on('StateHydrated', handleStateHydrated);

    setEnergyPerSecond(hero.getEnergyPerSecond());

    // If hero is already hydrated, update immediately
    if (hero.isStateHydrated()) {
      setIsLoading(false);
      setEnergy(hero.getEnergy());
      setXP(hero.getXP());
      setLevel(hero.getLevel());
    }
  }, [bus, hero]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-sm font-semibold text-text-primary">
          Energy
        </div>
        <div className="text-sm text-text-secondary animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold text-text-primary">
          Energy
        </div>
        <div className="text-xs font-semibold text-accent-primary">
          Level {level}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-5xl font-bold text-accent-primary font-display">
          {energy}
        </div>
        <div className="text-base text-text-secondary">
          +{energyPerSecond}/s
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
        <div className="text-xs text-text-secondary">
          Stay focused to earn Energy
        </div>
        <div className="text-xs font-mono text-text-tertiary">
          {xp} XP
        </div>
      </div>
    </div>
  );
}
