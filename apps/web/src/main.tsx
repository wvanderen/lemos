import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { LemOSCore } from '@lemos/core';
import { manifest as helloWorldManifest, init as helloWorldInit } from '@lemos/modules-hello-world';
import { manifest as sessionTimerManifest, init as sessionTimerInit, getTimerInstance } from '@lemos/modules-session-timer';
import { manifest as dopamineHeroManifest, init as dopamineHeroInit, getHeroInstance } from '@lemos/modules-dopamine-hero';
import { Panel, SessionControl, EnergyDisplay } from '@lemos/ui';

function App(): JSX.Element {
  const [core, setCore] = useState<LemOSCore | null>(null);

  useEffect(() => {
    const lemosCore = new LemOSCore();

    lemosCore.registerModule(helloWorldManifest, helloWorldInit);
    lemosCore.registerModule(sessionTimerManifest, sessionTimerInit);
    lemosCore.registerModule(dopamineHeroManifest, dopamineHeroInit);

    lemosCore.start();
    setCore(lemosCore);

    console.log('LemOS Phase 1: Focus Slice initialized');
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

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif', background: '#0b1021', minHeight: '100vh' }}>
      <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ color: '#e8ecf1', letterSpacing: '0.04em', margin: 0 }}>LemOS Phase 1</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>The Focus Slice</p>

        <Panel>
          <EnergyDisplay bus={core.bus} hero={hero} />
        </Panel>

        <Panel>
          <SessionControl bus={core.bus} timer={timer} />
        </Panel>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
