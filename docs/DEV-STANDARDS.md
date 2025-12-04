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

## 4. Testing

- Use Vitest for all packages.
- Unit tests required for core logic in `src/domain/`.
- Integration tests optional for early modules.

Run:

```bash
pnpm test -- --coverage
```

---

## 5. Linting / Formatting

- TypeScript strict everywhere.
- ESLint + Prettier enforced via root config.
- No `any` unless justified in comment.

---

## 6. Documentation Hygiene

Each module must have:

- `README.md` (purpose + quick start)
- `/docs/design.md` (domain model + flows)
- `/docs/api.md` (events + public contract)
- `module.manifest.json`

Docs live beside code. Whenever you change behavior, update the markdown file in the same commit.

---

## 7. Architecture Decision Records (ADRs)

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
