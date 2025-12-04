import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { LemOSCore } from '@lemos/core';
import { manifest as helloWorldManifest, init as helloWorldInit } from '@lemos/modules-hello-world';
import { Panel } from '@lemos/ui';

function App(): JSX.Element {
  const [status, setStatus] = useState('Booting...');
  const [lastEvent, setLastEvent] = useState<string>('');

  useEffect(() => {
    const core = new LemOSCore();
    core.registerModule(helloWorldManifest, helloWorldInit);

    core.bus.on('Pong', (event) => {
      setLastEvent(JSON.stringify(event.payload));
    });

    core.start();
    setStatus('System Started');

    core.bus.emit({
      id: crypto.randomUUID(),
      type: 'Ping',
      timestamp: new Date().toISOString(),
      payload: { msg: 'Hello from UI' },
    });
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif', background: '#0b1021', minHeight: '100vh' }}>
      <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ color: '#e8ecf1', letterSpacing: '0.04em', margin: 0 }}>LemOS Phase 0</h1>
        <Panel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 600, color: '#111827' }}>{status}</div>
            <div style={{ color: '#374151' }}>Ping → Pong path is wired; check console logs for the trace.</div>
            {lastEvent && (
              <div style={{ color: '#0f172a', fontSize: 14 }}>
                Last event payload: <code>{lastEvent}</code>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
