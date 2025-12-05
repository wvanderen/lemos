import manifest from '../module.manifest.json';
import { UnifiedLogger } from './domain/UnifiedLogger.js';
export { manifest };
export { UnifiedLogger };
let loggerInstance = null;
export function init(bus, storage, contextProvider) {
    loggerInstance = new UnifiedLogger(bus, storage, contextProvider);
    console.log('Unified Logger module loaded');
}
export function getLoggerInstance() {
    if (!loggerInstance) {
        throw new Error('UnifiedLogger not initialized. Call init(bus, storage, contextProvider) first.');
    }
    return loggerInstance;
}
