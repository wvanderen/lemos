# DEV-STANDARDS.md

## 1. Development Flow

1. **Pick a constellation (project / module).**
2. **Plan in writing first.**
   - Create or update `packages/modules/<id>/README.md`, `design.md`, `api.md`.
3. **Build a tracer bullet slice** - minimal UI -> event -> core -> module -> response.
4. **Open a draft PR, even if solo.**
   - PR description = summary of design intent or link to plan doc.
5. **Commit in small, complete steps.**

> Code should always be preceded by words.

---

## 2. Branch + Commit Standards

- Branch: `feature/<module>-<topic>` (e.g. `feature/ritualos-runner`)
- Commit message: `feat(dopamine-hero): add energy gain on session end`
- Every commit should build and run.

---

## 3. Pull Request Checklist

- [ ] Module has updated docs (`design.md`, `api.md` as needed)
- [ ] Tests pass (`pnpm test`)
- [ ] No cross-module imports
- [ ] New events typed in `@lemos/core`
- [ ] CI passes

---

## 4. Quality Harness & Required Commands

The project uses an integrated Quality Harness (ADR-0007) to ensure consistent quality across all packages.

### Required Scripts in Every Package

All packages must include these scripts in their `package.json`:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -w -p tsconfig.json",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Root Commands

From the repository root, you can run:

- **`pnpm run typecheck`** – Type check all packages
- **`pnpm run lint`** – Lint all packages
- **`pnpm run test`** – Run all tests
- **`pnpm run test:coverage`** – Run tests with coverage reports
- **`pnpm run check`** – Run typecheck + lint + test (full quality check)
- **`pnpm run build`** – Build all packages

### Git Hooks

Pre-commit and pre-push hooks are enforced via Husky:

- **Pre-commit**: Runs lint, typecheck, and tests
- **Pre-push**: Runs full `pnpm run check`

These hooks ensure bad commits never land in the repo.

### Coverage Requirements

- **Core & modules**: ≥ 70% coverage
- **UI packages**: ≥ 50% coverage
- Coverage reports are uploaded as CI artifacts

---

## 5. Testing

- Use Vitest for all packages.
- Unit tests required for core logic.
- Every module must have at least one test file in `tests/`.
- Tests are executable specs – they document expected behavior.

Run tests:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in a specific package
cd packages/modules/my-module
pnpm test
```

---

## 6. Linting / Formatting

- TypeScript strict mode everywhere.
- ESLint + Prettier enforced via shared configs in `/config`.
- No `any` unless justified in comment.
- Configs are shared across all packages for consistency.

Run lint/format:

```bash
# Check formatting
pnpm run format

# Fix formatting
pnpm run format:write

# Run linter
pnpm run lint
```

---

## 7. Documentation Hygiene

Each module must have:

- `README.md` (purpose + quick start)
- `/docs/design.md` (domain model + flows)
- `/docs/api.md` (events + public contract)
- `module.manifest.json`

Docs live beside code. Whenever you change behavior, update the markdown file in the same commit.

---

## 8. Architecture Decision Records (ADRs)

1. Each major choice -> a file in `docs/ADRs/`.
2. Name pattern: `000x-short-title.md`
3. Keep them < 1 page.

```md
# 0003 - Switch to IndexedDB for Local Storage
## Context
## Decision
## Consequences
```

This is how the system "remembers why."
