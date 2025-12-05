import type { BaseEvent, EventListener } from './types.js';

export class EventBus {
  private listeners = new Map<string, EventListener[]>();

  on<T>(type: string, listener: EventListener<T>): void {
    const existing = this.listeners.get(type) ?? [];
    existing.push(listener as EventListener);
    this.listeners.set(type, existing);
  }

  off<T>(type: string, listener: EventListener<T>): void {
    const existing = this.listeners.get(type) ?? [];
    const filtered = existing.filter((fn) => fn !== listener);
    this.listeners.set(type, filtered);
  }

  emit<T>(event: BaseEvent<T>): void {
    const list = this.listeners.get(event.type) ?? [];
    list.forEach((fn) => fn(event));
  }
}
