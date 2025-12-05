import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { LemOSCore } from '@lemos/core';
import { IndexedDBStorage } from '@lemos/platform-storage-local';
import { manifest as helloWorldManifest, init as helloWorldInit } from '@lemos/modules-hello-world';
import { manifest as sessionTimerManifest, init as sessionTimerInit, getTimerInstance } from '@lemos/modules-session-timer';
import { manifest as dopamineHeroManifest, init as dopamineHeroInit, getHeroInstance } from '@lemos/modules-dopamine-hero';
import { manifest as ritualOSManifest, init as ritualOSInit, getRitualOSInstance } from '@lemos/modules-ritual-os';
import { Panel, SessionControl, EnergyDisplay, RitualControl } from '@lemos/ui';

function App(): JSX.Element {
  const [core, setCore] = useState<LemOSCore | null>(null);

  useEffect(() => {
    const lemosCore = new LemOSCore();

    // Register storage provider
    const storage = new IndexedDBStorage();
    lemosCore.registerStorage(storage);

    // Register modules
    lemosCore.registerModule(helloWorldManifest, helloWorldInit);
    lemosCore.registerModule(sessionTimerManifest, sessionTimerInit);
    lemosCore.registerModule(dopamineHeroManifest, (bus) => dopamineHeroInit(bus, storage));
    lemosCore.registerModule(ritualOSManifest, (bus) => ritualOSInit(bus, storage));

    lemosCore.start();
    setCore(lemosCore);

    console.log('LemOS Phase 2: Ritual Slice initialized');
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

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif', background: '#0b1021', minHeight: '100vh' }}>
      <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ color: '#e8ecf1', letterSpacing: '0.04em', margin: 0 }}>LemOS Phase 2</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>The Ritual Slice</p>

        <Panel>
          <EnergyDisplay bus={core.bus} hero={hero} />
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
