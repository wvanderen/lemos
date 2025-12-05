import { EventBus, IStorage } from '@lemos/core';
import manifest from '../module.manifest.json';
import { ConstellationOS } from './domain/ConstellationOS.js';

export { manifest };
export { ConstellationOS };

let instance: ConstellationOS | null = null;

export function init(bus: EventBus, storage?: IStorage): void {
  instance = new ConstellationOS(bus, storage);
}

export function getConstellationOSInstance(): ConstellationOS {
  if (!instance) {
    throw new Error(
      'ConstellationOS not initialized. Call init(bus, storage) first.'
    );
  }
  return instance;
}
