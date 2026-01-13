# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [2026-01-13]

### Fixed
- **Vite import-analysis crash (`parse is not a function`)**:
  - _Issue_: `npm run dev` failed on `index.tsx` with Rollup parse error.
  - _Cause_: `@rollup/rollup-linux-arm64-gnu` was aliased to `@rollup/wasm-node`, which doesn't export `parse`.
  - _Solution_: Removed the Rollup wasm alias from `package.json` and corrected `package-lock.json` metadata so the native Rollup binding is installed on linux/arm64.

## [2026-01-12]

### Added
- `.agent/` workflows and changelog policy to standardize development flow.
- `docs/ROADMAP.md` to track phased work.
- `docs/COMPONENTS.md` for UI component reference.
- `docs/AUTH_ARCHITECTURE.md` outlining planned roles and device auth flow.
- `docs/implementation/local-agent.md` for listener and sync design notes.
- `GEMINI.md` with repo-specific AI guidance.
- `docs/reports/AUDIT_REPORT_2026-01-12.md` with initial audit findings and roadmap insertions.
- `.env.example` documenting Gemini key placeholders for Vite env usage.
- `build:ci` script to run `npm ci` before `npm run build` for clean checkout builds.

### Changed
- Updated `README.md` to describe ClockBlock, its stack, and local setup.
- Standardized minute-based ticking and display labels across HUD, schedule, and recap text.
- Persisted app state (schedule, bank, debt) to local storage.
- `docs/ROADMAP.md` adds detailed MVP tasks and a new Post-MVP Nice-to-Haves section.
- Marked the Phase 1 build-script checklist item complete in `docs/ROADMAP.md`.
- `docs/reports/AUDIT_REPORT_2026-01-12.md` separates MVP tech debt from post-MVP Gemini work.
- Switched Gemini client config to `import.meta.env.VITE_GEMINI_API_KEY` and removed `process.env` injection in `vite.config.ts`.
- Replaced the simulated day-reset alert with an in-app modal summary (`App.tsx`).
