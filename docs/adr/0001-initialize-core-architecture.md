# ADR 0001: Initialize Core Architecture

## Status
Done

## Context
We need a minimal but provable skeleton for LemOS that demonstrates monorepo wiring, event-driven communication, and module registration before expanding features.

## Decision
- Use pnpm with Turborepo to orchestrate tasks across packages.
- Build shared primitives in `@lemos/core`, including an `EventBus` and `LemOSCore` registrar.
- Scaffold a demo module `@lemos/modules-hello-world` that listens for `Ping` and emits `Pong`.
- Create a Vite + React shell in `apps/web` that boots the core, registers the module, and emits a `Ping` from the UI.
- Add Vitest for unit coverage of the bus and GitHub Actions CI to enforce lint/test/build.

## Consequences
- Developers have a single `pnpm dev` entrypoint to validate wiring.
- Modules are encouraged to communicate solely via the event bus, avoiding tight coupling.
- Future modules must provide manifests and `init` hooks consistent with this contract.
- CI guardrails reduce early regressions as new slices are added.
