# LemOS / Lemstation

**Version:** v0.1 (Phase 0 Skeleton)

LemOS is a modular personal operating environment for ritual, work, and play - a local-first system that integrates focused activity, creative rituals, and symbolic computation.

## Repository Structure

```
apps/web             # React web app (UI shell)
packages/core        # @lemos/core - event bus, runtime, types
packages/ui          # @lemos/ui   - small design system
packages/modules/    # optional modules (hello-world, etc.)
docs/                # Specs, standards, design notes
```

## Quick Start

```bash
pnpm install
pnpm dev --filter web
```

Open http://localhost:5173 and check the console for event logs.

## Development Philosophy

- **Readme Driven Development:** each module begins with documentation, not code.
- **Event-Driven Architecture:** every component talks via typed events on the Core bus.
- **Tracer Bullet Workflow:** build thin end-to-end slices before expanding features.
- **Local First:** SQLite / IndexedDB in early stages, cloud adapters later.

## Where to Start

- docs/DEV-STANDARDS.md
- docs/MODULE-GUIDE.md
- docs/LEMOS-SPEC.md
