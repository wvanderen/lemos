import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { LemOSCore } from '@lemos/core';
import { IndexedDBStorage } from '@lemos/platform-storage-local';
import { manifest as helloWorldManifest, init as helloWorldInit } from '@lemos/modules-hello-world';
import { manifest as sessionTimerManifest, init as sessionTimerInit, getTimerInstance } from '@lemos/modules-session-timer';
import { manifest as dopamineHeroManifest, init as dopamineHeroInit, getHeroInstance } from '@lemos/modules-dopamine-hero';
import { manifest as ritualOSManifest, init as ritualOSInit, getRitualOSInstance } from '@lemos/modules-ritual-os';
import { manifest as constellationOSManifest, init as constellationOSInit, getConstellationOSInstance } from '@lemos/modules-constellation-os';
import { Panel, SessionControl, EnergyDisplay, RitualControl, ConstellationList } from '@lemos/ui';

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

      lemosCore.start();
      setCore(lemosCore);

      console.log('LemOS Phase 3: Constellation Slice initialized');
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

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif', background: '#0b1021', minHeight: '100vh' }}>
      <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ color: '#e8ecf1', letterSpacing: '0.04em', margin: 0 }}>LemOS Phase 3</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>The Constellation Slice</p>

        <Panel>
          <EnergyDisplay bus={core.bus} hero={hero} />
        </Panel>

        <Panel>
          <ConstellationList bus={core.bus} constellationOS={constellationOS} />
        </Panel>

        <Panel>
          <RitualControl bus={core.bus} ritualOS={ritualOS} />
        </Panel>

        <Panel>
          <SessionControl bus={core.bus} timer={timer} />
        </Panel>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
