import { EventBus, IStorage } from '@lemos/core';
import manifest from '../module.manifest.json';
import { DopamineHero } from './domain/DopamineHero.js';

export { manifest };
export { DopamineHero };

let heroInstance: DopamineHero | null = null;

export function init(bus: EventBus, storage?: IStorage): void {
  heroInstance = new DopamineHero(bus, storage);
  console.log('Dopamine Hero module loaded');
}

export function getHeroInstance(): DopamineHero {
  if (!heroInstance) {
    throw new Error('DopamineHero module not initialized. Call init(bus) first.');
  }
  return heroInstance;
}
