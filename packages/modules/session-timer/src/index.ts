import { EventBus } from '@lemos/core';
import manifest from '../module.manifest.json';
import { SessionTimer } from './domain/SessionTimer';

export { manifest };
export { SessionTimer };

let timerInstance: SessionTimer | null = null;

export function init(bus: EventBus): void {
  timerInstance = new SessionTimer(bus);
  console.log('Session Timer module loaded');
}

export function getTimerInstance(): SessionTimer {
  if (!timerInstance) {
    throw new Error('SessionTimer module not initialized. Call init(bus) first.');
  }
  return timerInstance;
}
