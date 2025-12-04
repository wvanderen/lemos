import { EventBus } from './eventBus.js';
import type { LemOSModuleManifest } from './types.js';
export declare class LemOSCore {
    readonly bus: EventBus;
    registerModule(manifest: LemOSModuleManifest, initFn: (bus: EventBus) => void): void;
    start(): void;
}
