# Module Guide (Hello World)

1. Define a `module.manifest.json` with `id`, `name`, and `version`.
2. Export `manifest` and an `init(bus)` function from the module entrypoint.
3. In `init`, subscribe to events with `bus.on(type, handler)` and emit new events via `bus.emit(event)`.
4. Avoid direct coupling with other modules; rely on events for communication.
5. Keep logs concise; Phase 0 surfaces the full Ping → Pong trace in the console.
