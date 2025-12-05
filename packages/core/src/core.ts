import { EventBus } from './eventBus';
import type { LemOSModuleManifest } from './types';
import type { IStorage } from './storage';

export class LemOSCore {
  readonly bus = new EventBus();
  private storage: IStorage | null = null;

  registerModule(manifest: LemOSModuleManifest, initFn: (bus: EventBus) => void): void {
    // Registration is intentionally light for Phase 0; lifecycle hooks live here later.
    console.log(`Registering module: ${manifest.name} (${manifest.id})`);
    initFn(this.bus);
  }

  registerStorage(storageProvider: IStorage): void {
    console.log('Registering storage provider');
    this.storage = storageProvider;
  }

  getStorage(): IStorage {
    if (!this.storage) {
      throw new Error('Storage provider not registered. Call registerStorage() first.');
    }
    return this.storage;
  }

  start(): void {
    console.log('LemOS Core started');
  }
}
