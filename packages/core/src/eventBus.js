export class EventBus {
    listeners = new Map();
    on(type, listener) {
        const existing = this.listeners.get(type) ?? [];
        existing.push(listener);
        this.listeners.set(type, existing);
    }
    emit(event) {
        const list = this.listeners.get(event.type) ?? [];
        list.forEach((fn) => fn(event));
    }
}
