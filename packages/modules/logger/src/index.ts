import { EventBus, IStorage, GlobalContext } from '@lemos/core';
import manifest from '../module.manifest.json';
import { UnifiedLogger } from './domain/UnifiedLogger';

export { manifest };
export { UnifiedLogger };

let loggerInstance: UnifiedLogger | null = null;

export function init(
  bus: EventBus,
  storage: IStorage,
  contextProvider: () => GlobalContext
): void {
  loggerInstance = new UnifiedLogger(bus, storage, contextProvider);
  console.log('Unified Logger module loaded');
}

export function getLoggerInstance(): UnifiedLogger {
  if (!loggerInstance) {
    throw new Error('UnifiedLogger not initialized. Call init(bus, storage, contextProvider) first.');
  }
  return loggerInstance;
}
