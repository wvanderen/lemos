import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { LemOSCore } from '@lemos/core';
import { IndexedDBStorage } from '@lemos/platform-storage-local';
import { manifest as helloWorldManifest, init as helloWorldInit } from '@lemos/modules-hello-world';
import { manifest as sessionTimerManifest, init as sessionTimerInit, getTimerInstance } from '@lemos/modules-session-timer';
import { manifest as dopamineHeroManifest, init as dopamineHeroInit, getHeroInstance } from '@lemos/modules-dopamine-hero';
import { manifest as ritualOSManifest, init as ritualOSInit, getRitualOSInstance } from '@lemos/modules-ritual-os';
import { manifest as constellationOSManifest, init as constellationOSInit, getConstellationOSInstance } from '@lemos/modules-constellation-os';
import { manifest as contextManifest, init as contextInit, getContextManager } from '@lemos/modules-context';
import { manifest as loggerManifest, init as loggerInit, getLoggerInstance } from '@lemos/modules-logger';
import { manifest as ritualEditorManifest, init as ritualEditorInit, getRitualEditorInstance } from '@lemos/modules-ritual-editor';
import { ThemeEngine, Panel, SessionControlV2, EnergyDisplay, RitualControl, ConstellationList, ContextControl, JournalEntry, LogViewer, RitualLibrary, ThemeSwitcher } from '@lemos/ui';

// Import CSS
import '@lemos/ui/styles/globals.css';
import '@lemos/ui/styles/themes.css';

function App(): JSX.Element {
  const [core, setCore] = useState<LemOSCore | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing LemOS...');

      const lemosCore = new LemOSCore();

      // Create storage and wait for it to initialize
      console.log('Creating storage...');
      const storage = new IndexedDBStorage();

      console.log('Waiting for storage to initialize...');
      await storage.waitForInit();
      console.log('Storage initialized successfully');

      lemosCore.registerStorage(storage);

      // Register modules
      lemosCore.registerModule(helloWorldManifest, helloWorldInit);
      lemosCore.registerModule(sessionTimerManifest, sessionTimerInit);
      lemosCore.registerModule(dopamineHeroManifest, (bus) => dopamineHeroInit(bus, storage));
      lemosCore.registerModule(ritualOSManifest, (bus) => ritualOSInit(bus, storage));
      lemosCore.registerModule(constellationOSManifest, (bus) => constellationOSInit(bus, storage));

      // Initialize context module first to ensure it's available for logger
      lemosCore.registerModule(contextManifest, (bus) => contextInit(bus));
      const contextManager = getContextManager();

      // Logger depends on context manager, so initialize it after
      lemosCore.registerModule(loggerManifest, (bus) =>
        loggerInit(bus, storage, () => contextManager.getSnapshot())
      );

      // Initialize ritual editor with storage access (Phase 6)
      lemosCore.registerModule(ritualEditorManifest, (bus) => ritualEditorInit(bus, storage));

      lemosCore.start();
      setCore(lemosCore);

      console.log('LemOS Phase 6: Ritual Editing & Content Management initialized');

      // Expose database reset helper for development
      (window as unknown as { resetDatabase?: () => Promise<void> }).resetDatabase = async () => {
        console.warn('Resetting database...');
        await IndexedDBStorage.resetDatabase();
        console.log('Database reset complete. Refreshing page...');
        window.location.reload();
      };
      console.log('💡 Tip: Run resetDatabase() in console to upgrade the database schema');
    };

    initializeApp().catch(err => {
      console.error('Failed to initialize app:', err);
    });
  }, []);

  if (!core) {
    return (
      <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif', background: '#0b1021', minHeight: '100vh' }}>
        <div style={{ color: '#e8ecf1' }}>Loading...</div>
      </div>
    );
  }

  const timer = getTimerInstance();
  const hero = getHeroInstance();
  const ritualOS = getRitualOSInstance();
  const constellationOS = getConstellationOSInstance();
  const contextManager = getContextManager();
  const logger = getLoggerInstance();
  const ritualEditor = getRitualEditorInstance();

  return (
    <ThemeEngine
      bus={core.bus}
      contextProvider={() => contextManager.getSnapshot()}
    >
      <div className="p-6 font-body">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-text-primary" style={{ margin: 0 }}>
                LemOS Phase 7
              </h1>
              <p className="text-text-secondary" style={{ margin: 0 }}>
                Theming Engine & Component Design System
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm text-text-secondary">Theme:</span>
              <ThemeSwitcher bus={core.bus} />
            </div>
          </div>

          <Panel>
            <EnergyDisplay bus={core.bus} hero={hero} />
          </Panel>

          <Panel>
            <ContextControl bus={core.bus} contextManager={contextManager} constellationOS={constellationOS} ritualOS={ritualOS} />
          </Panel>

          <Panel>
            <JournalEntry bus={core.bus} />
          </Panel>

          <Panel>
            <LogViewer bus={core.bus} logger={logger} constellationOS={constellationOS} ritualOS={ritualOS} />
          </Panel>

          <Panel>
            <RitualLibrary
              bus={core.bus}
              ritualEditor={ritualEditor}
            />
          </Panel>

          <Panel>
            <ConstellationList bus={core.bus} constellationOS={constellationOS} />
          </Panel>

          <Panel>
            <RitualControl bus={core.bus} ritualOS={ritualOS} ritualEditor={ritualEditor} />
          </Panel>

          <SessionControlV2 bus={core.bus} timer={timer} />
        </div>
      </div>
    </ThemeEngine>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
