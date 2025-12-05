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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
          Energy
        </div>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
          Energy
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#8b5cf6' }}>
          Level {level}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#8b5cf6' }}>
          {energy}
        </div>
        <div style={{ fontSize: 16, color: '#6b7280' }}>
          +{energyPerSecond}/s
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: '#6b7280' }}>
          Stay focused to earn Energy in real-time
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>
          {xp} XP
        </div>
      </div>
    </div>
  );
}
