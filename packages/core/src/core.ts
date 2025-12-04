import { EventBus } from './eventBus.js';
import type { LemOSModuleManifest } from './types.js';

export class LemOSCore {
  readonly bus = new EventBus();

  registerModule(manifest: LemOSModuleManifest, initFn: (bus: EventBus) => void): void {
    // Registration is intentionally light for Phase 0; lifecycle hooks live here later.
    console.log(`Registering module: ${manifest.name} (${manifest.id})`);
    initFn(this.bus);
  }

  start(): void {
    console.log('LemOS Core started');
  }
}
