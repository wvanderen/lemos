import { EventBus } from './eventBus';
import type { LemOSModuleManifest } from './types';
import type { IStorage } from './storage';
export declare class LemOSCore {
    readonly bus: EventBus;
    private storage;
    registerModule(manifest: LemOSModuleManifest, initFn: (bus: EventBus) => void): void;
    registerStorage(storageProvider: IStorage): void;
    getStorage(): IStorage;
    start(): void;
}
