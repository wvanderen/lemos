import { EventBus } from '@lemos/core';
import { RitualEditor } from './domain/RitualEditor';
import manifest from './module.manifest.json';

export { manifest };
export { RitualEditor };

let editorInstance: RitualEditor | null = null;

export function init(bus: EventBus, storage?: any): void {
  editorInstance = new RitualEditor(bus, storage);
  console.log('Ritual Editor module loaded');
}

export function getRitualEditorInstance(): RitualEditor {
  if (!editorInstance) {
    throw new Error('RitualEditor module not initialized. Call init(bus) first.');
  }
  return editorInstance;
}