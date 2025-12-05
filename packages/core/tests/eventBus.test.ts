import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../src/eventBus';
import type { BaseEvent } from '../src/types';

describe('EventBus', () => {
  it('dispatches events to registered listeners', () => {
    const bus = new EventBus();
    const handler = vi.fn((event: BaseEvent<{ msg: string }>) => event.payload.msg);

    bus.on('Ping', handler);
    bus.emit({
      id: crypto.randomUUID(),
      type: 'Ping',
      timestamp: new Date().toISOString(),
      payload: { msg: 'hello' },
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'Ping', payload: { msg: 'hello' } }),
    );
  });
});
