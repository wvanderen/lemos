# Repository Guidelines

## Project Structure & Module Organization
- Monorepo via pnpm/turbo.
- `apps/web` React shell; run-time entry for modules.
- `packages/core` event bus, runtime, shared types.
- `packages/ui` small design system components.
- `packages/modules/<id>` individual modules with `src/`, `docs/`, `module.manifest.json`.
- `docs` specs, standards, ADRs; keep module docs beside code.

## Build, Test, and Development Commands
- `pnpm install` install workspace deps.
- `pnpm dev --filter web` run the web app locally.
- `pnpm test` run Vitest across packages; add `-- --coverage` for coverage.
- `pnpm lint` run ESLint + Prettier formatting checks.
- `pnpm build` compile packages per Turborepo pipeline.

## Coding Style & Naming Conventions
- TypeScript strict; no `any` without justification.
- Prefer event-driven boundaries; no cross-module imports—communicate via typed events.
- Use path aliases from `tsconfig.base.json` for internal imports.
- Branches: `feature/<module>-<topic>` (e.g., `feature/dopamine-hero-ui`).
- Commit messages: `feat(module-id): summary` or similar scoped verbs (`fix`, `chore`).
- Keep modules documented first: update `README.md`, `docs/design.md`, `docs/api.md` before major code.

## Testing Guidelines
- Framework: Vitest; unit tests required for `packages/core/src/domain` and core module logic.
- Naming: co-locate tests with source using `*.test.ts`.
- Coverage: aim for coverage on new core logic; prefer functional over mock-heavy tests.
- Command: `pnpm test -- --coverage`.

## Commit & Pull Request Guidelines
- Open draft PR early; include design intent or link to plan doc.
- PR checklist: docs updated (`design.md`, `api.md`), tests/lint pass, events typed in `@lemos/core`, no cross-module imports.
- Every commit should build and run; keep changes in small, coherent slices.
- Add screenshots or console captures for UI/event flows when relevant.

## Security & Configuration Tips
- Local-first: prefer local stores (SQLite/IndexedDB) during Phase 0; gate any remote adapters.
- Do not share secrets; use `.env.local` for private values (not checked in).
- Keep `module.manifest.json` accurate; manifests drive module registration and UI panel exposure.
