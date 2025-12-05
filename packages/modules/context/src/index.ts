import { EventBus } from '@lemos/core';
import manifest from '../module.manifest.json';
import { ContextManager } from './domain/ContextManager';

export { manifest };
export { ContextManager };

let contextInstance: ContextManager | null = null;

export function init(bus: EventBus): void {
  contextInstance = new ContextManager(bus);
  console.log('Context Manager module loaded');
}

export function getContextManager(): ContextManager {
  if (!contextInstance) {
    throw new Error('ContextManager not initialized. Call init(bus) first.');
  }
  return contextInstance;
}
