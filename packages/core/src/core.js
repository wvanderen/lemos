import { EventBus } from './eventBus.js';
export class LemOSCore {
    bus = new EventBus();
    registerModule(manifest, initFn) {
        // Registration is intentionally light for Phase 0; lifecycle hooks live here later.
        console.log(`Registering module: ${manifest.name} (${manifest.id})`);
        initFn(this.bus);
    }
    start() {
        console.log('LemOS Core started');
    }
}
