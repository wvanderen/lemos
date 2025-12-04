import { EventBus } from '@lemos/core';
import manifest from '../module.manifest.json';

export { manifest };

export function init(bus: EventBus): void {
  console.log('Hello World module loaded');
  bus.on('Ping', (event) => {
    console.log('Hello World received:', event.payload);
    bus.emit({
      id: crypto.randomUUID(),
      type: 'Pong',
      timestamp: new Date().toISOString(),
      payload: { msg: 'Pong from HelloWorld' },
    });
  });
}
