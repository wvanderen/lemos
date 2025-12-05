import type { BaseEvent, EventListener } from './types.js';
export declare class EventBus {
    private listeners;
    on<T>(type: string, listener: EventListener<T>): void;
    off<T>(type: string, listener: EventListener<T>): void;
    emit<T>(event: BaseEvent<T>): void;
}
