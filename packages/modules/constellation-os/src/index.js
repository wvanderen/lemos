import manifest from '../module.manifest.json';
import { ConstellationOS } from './domain/ConstellationOS.js';
export { manifest };
export { ConstellationOS };
let instance = null;
export function init(bus, storage) {
    instance = new ConstellationOS(bus, storage);
    console.log('ConstellationOS module loaded');
}
export function getConstellationOSInstance() {
    if (!instance) {
        throw new Error('ConstellationOS not initialized. Call init(bus, storage) first.');
    }
    return instance;
}
