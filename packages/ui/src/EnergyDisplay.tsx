import { useState, useEffect } from 'react';
import type { EventBus, BaseEvent, EnergyUpdatedPayload } from '@lemos/core';
import type { DopamineHero } from '@lemos/modules-dopamine-hero';

interface EnergyDisplayProps {
  bus: EventBus;
  hero: DopamineHero;
}

export function EnergyDisplay({ bus, hero }: EnergyDisplayProps): JSX.Element {
  const [energy, setEnergy] = useState<number>(0);
  const [energyPerSecond, setEnergyPerSecond] = useState<number>(1);

  useEffect(() => {
    const handleEnergyUpdate = (event: BaseEvent<EnergyUpdatedPayload>) => {
      setEnergy(event.payload.current);
    };

    bus.on('EnergyUpdated', handleEnergyUpdate);

    setEnergyPerSecond(hero.getEnergyPerSecond());
  }, [bus, hero]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
        Energy
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#8b5cf6' }}>
          {energy}
        </div>
        <div style={{ fontSize: 16, color: '#6b7280' }}>
          +{energyPerSecond}/s
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>
        Stay focused to earn Energy in real-time
      </div>
    </div>
  );
}
