import { EventBus } from './eventBus.js';
export class LemOSCore {
    bus = new EventBus();
    storage = null;
    registerModule(manifest, initFn) {
        // Registration is intentionally light for Phase 0; lifecycle hooks live here later.
        console.log(`Registering module: ${manifest.name} (${manifest.id})`);
        initFn(this.bus);
    }
    registerStorage(storageProvider) {
        console.log('Registering storage provider');
        this.storage = storageProvider;
    }
    getStorage() {
        if (!this.storage) {
            throw new Error('Storage provider not registered. Call registerStorage() first.');
        }
        return this.storage;
    }
    start() {
        console.log('LemOS Core started');
    }
}
