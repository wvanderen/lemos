import { EventBus, IStorage } from '@lemos/core';
import manifest from '../module.manifest.json';
import { ContextManager } from './domain/ContextManager';

export { manifest };
export { ContextManager };

let contextInstance: ContextManager | null = null;
let initializationPromise: Promise<void> | null = null;

export function init(bus: EventBus, storage?: IStorage): Promise<void> {
  contextInstance = new ContextManager(bus, storage);
  initializationPromise = contextInstance.initialize();
  console.log('Context Manager module loaded');
  return initializationPromise;
}

export function getContextManager(): ContextManager {
  if (!contextInstance) {
    throw new Error('ContextManager not initialized. Call init(bus) first.');
  }
  return contextInstance;
}

export async function waitForInitialization(): Promise<void> {
  if (!initializationPromise) {
    throw new Error('ContextManager not initialized. Call init(bus) first.');
  }
  return initializationPromise;
}
