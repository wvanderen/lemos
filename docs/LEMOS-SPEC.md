# LemOS Specification (Phase 0)

This document tracks the minimal guarantees for the initial LemOS skeleton:

- A monorepo powered by pnpm and Turborepo.
- Event bus primitive exposes `on` and `emit` for typed events.
- Modules register through `LemOSCore.registerModule(manifest, initFn)` and can emit/respond to events.
- UI shell dispatches a `Ping` event and receives a `Pong` from the demo module.
- Shared packages use TS path aliases to avoid brittle relative imports.
