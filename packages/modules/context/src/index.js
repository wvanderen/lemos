import manifest from '../module.manifest.json';
import { ContextManager } from './domain/ContextManager.js';
export { manifest };
export { ContextManager };
let contextInstance = null;
export function init(bus) {
    contextInstance = new ContextManager(bus);
    console.log('Context Manager module loaded');
}
export function getContextManager() {
    if (!contextInstance) {
        throw new Error('ContextManager not initialized. Call init(bus) first.');
    }
    return contextInstance;
}
