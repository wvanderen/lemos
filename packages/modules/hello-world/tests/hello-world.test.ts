import { describe, it, expect } from 'vitest';
import { EventBus } from '@lemos/core';
import { init, manifest } from '../src/index';

describe('Hello World Module', () => {
  it('passes check', () => {
    expect(true).toBe(true);
  });

  it('has a valid manifest', () => {
    expect(manifest).toBeDefined();
    expect(manifest.name).toBe('Hello World Module');
    expect(manifest.id).toBe('hello-world');
  });

  it('initializes without errors', () => {
    const bus = new EventBus();
    expect(() => init(bus)).not.toThrow();
  });

  it('responds to Ping events with Pong', () => {
    const bus = new EventBus();
    init(bus);

    let receivedPong = false;
    bus.on('Pong', (event) => {
      receivedPong = true;
      expect(event.payload).toHaveProperty('msg');
      expect(event.payload.msg).toBe('Pong from HelloWorld');
    });

    bus.emit({
      id: crypto.randomUUID(),
      type: 'Ping',
      timestamp: new Date().toISOString(),
      payload: { message: 'test ping' },
    });

    expect(receivedPong).toBe(true);
  });
});
