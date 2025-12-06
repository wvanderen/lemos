

# 0007 – Quality Harness & Continuous Validation Framework

**Date:** 2025‑12‑05  
**Status:** Approved  

---

## 1. Context

LemOS has evolved into a multi‑package monorepo with growing complexity:
- `@lemos/core` (event runtime)
- `@lemos/modules/*`
- `@lemos/platform/*`
- `apps/web` and test harnesses.

To keep momentum, we must make **quality checks automatic** and **unavoidable.**  
The goal is to ensure every commit and build runs through the same gates and fails early on type or contract violations.

---

## 2. Decision

Establish an integrated *Quality Harness* composed of:

1. **Type Validation** – strict TypeScript compilation (`noEmit`) across all packages.  
2. **Static Linting / Style Checks** – shared ESLint + Prettier configuration.  
3. **Unit & Integration Testing** – Vitest as default test runner.  
4. **Storybook & Visual Regression Harness** – UI contract verification.  
5. **Continuous Integration (CI)** – one unified workflow on every push/PR.  
6. **Local Developer Hooks** – pre‑commit & pre‑push checks.  
7. **Reporting + Metrics** – coverage and lint summary.

This is codified so quality remains visible, measurable, and uniform across modules.

---

## 3. Architecture & Responsibility

### 3.1 Global Config Package → `@lemos/config`

Create shared configuration stored under `/config` and optionally published as an internal package.

Contents:
```
config/
  eslint.config.js
  prettier.config.js
  vitest.config.ts
  tsconfig.base.json
```

All apps and modules extend these base sets rather than duplicating config.

### 3.2 Repository Scripts

Add standard commands to the root `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc -b --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "test": "vitest run --reporter=default",
    "check": "pnpm run typecheck && pnpm run lint && pnpm run test"
  }
}
```

Individual packages can alias `pnpm run check` so the same command works everywhere.

---

## 4. Continuous Integration

### 4.1 GitHub Actions Workflow
`.github/workflows/quality.yml`

```yaml
name: Quality Harness
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run build --filter=@lemos/core
      - run: pnpm turbo run check
```

### 4.2 Caching
Use Turbo’s built‑in caching and GitHub cache action for node_modules to keep CI speed ≤ 2 minutes.

---

## 5. Testing Strategy

### 5.1 Vitest for Unit + Integration
- Each `packages/*` directory has a `tests/` folder.
- Required coverage threshold:
  - Core & modules: ≥ 70 %
  - UI: ≥ 50 %
- Run coverage in CI:
  ```bash
  pnpm vitest run --coverage
  ```

### 5.2 Storybook for UI Validation
- `apps/ui-playground/` runs Storybook.
- Every significant UI component or panel includes at least one story.
- Optionally integrate Chromatic or Playwright to compare visual baselines later.

---

## 6. Developer Hooks

Adopt **Husky** or **lefthook** for local enforcement:

`.husky/pre-commit`
```bash
pnpm run lint
pnpm run typecheck
pnpm run test -- --run --silent
```

`.husky/pre-push`
```bash
pnpm run check
```

These prevent bad commits from landing and ensure local discipline mirrors CI.

---

## 7. Module‑Level Standards

Each module under `packages/modules/` includes:
- `tests/` folder.  
- Required tests for core behavior and event interactions.  
- Optional snapshot tests for UI fragments.  
- Should import shared configs via `@lemos/config/*`.

### Testing Example
```ts
import { EventBus } from "@lemos/core";
import { init, manifest } from "../src";

test("session ends triggers reward", () => {
  const bus = new EventBus();
  init(bus);
  let received: any = null;
  bus.on("EnergyUpdated", e => (received = e.payload));
  bus.emit({ id: "1", type: "SessionEnded", timestamp: new Date().toISOString(), payload: { duration: 25 } });
  expect(received?.delta).toBeGreaterThan(0);
});
```

---

## 8. Reporting & Transparency

- After every CI run:
  - Publish coverage summary as artifact.
  - Lint + test results in workflow check output.
- Optional dashboard integration:
  - Simple static badge system:
    - Typechecks ✅ | Tests ✅ | Lint ✅ | Coverage XX % | Build ✅
  - Add to root `README.md`.

---

## 9. Consequences

### Positive
- Consistent developer experience across modules.  
- Automatic regression detection.  
- Encourages documentation‑first discipline (tests as executable specs).  
- Enables safe refactors as LemOS scales to dozens of modules.

### Negative
- Slight overhead for small experimental modules.  
  *Mitigation:* mark “experimental” modules with lower coverage requirement, but still run type/lint.  
- Slower first‑time CI runs due to full monorepo checks.  
  *Mitigation:* Turbo caching + concurrency.

---

## 10. Implementation Steps

1.  `Create /config` folder and base configs.  
2.  Install & configure ESLint, Prettier, Vitest, Husky.  
3.  Add `check` pipeline to Turbo config.  
4.  Add workflow file to `.github/workflows/`.  
5.  Update docs/DEV‑STANDARDS.md with new required commands.  
6.  Add badge section to root `README.md`.  
7.  Write first success test “Hello World passes check.”  

---

## 11. Success Criteria

*   `pnpm run check` runs clean on every package.  
*   CI pipeline passes without manual steps.  
*   Coverage report uploaded automatically.  
*   Every module has at least one test file.  
*   Lint + type errors block commits.

---

### Summary

**ADR‑0007** hardens LemOS as a sustainable codebase.  
It cements the dev discipline you defined earlier — “readme first, tracer bullets later, tests always.”  

After implementing ADR‑0007, you’ll have a **living CI harness** that enforces quality the same way LemOS enforces ritual: repeatable precision, continuous feedback, clear reward loops.
