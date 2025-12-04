# Dev Standards

- Use pnpm for package management and Turborepo for task orchestration.
- Prefer TypeScript path aliases defined in `tsconfig.base.json` for cross-package imports.
- Keep modules small and event-driven; modules should only communicate via the event bus.
- Add unit tests with Vitest alongside new primitives; Phase 0 requires the event bus test to pass.
- Run `pnpm lint` and `pnpm test` before opening a PR; CI enforces these tasks.
