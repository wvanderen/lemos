import { EventBus, IStorage } from '@lemos/core';
import manifest from '../module.manifest.json';
import { RitualOS } from './domain/RitualOS';
import morningAnchor from '../rituals/morning-anchor.json';

export { manifest };
export { RitualOS };

let ritualOSInstance: RitualOS | null = null;

export function init(bus: EventBus, storage?: IStorage): void {
  // Load all ritual definitions
  const ritualDefinitions = [morningAnchor];

  ritualOSInstance = new RitualOS(bus, ritualDefinitions, storage);
  console.log('Ritual OS module loaded');
}

export function getRitualOSInstance(): RitualOS {
  if (!ritualOSInstance) {
    throw new Error('RitualOS module not initialized. Call init(bus) first.');
  }
  return ritualOSInstance;
}
