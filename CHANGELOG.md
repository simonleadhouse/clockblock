# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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

### Changed
- Updated `README.md` to describe ClockBlock, its stack, and local setup.
- Standardized minute-based ticking and display labels across HUD, schedule, and recap text.
- Persisted app state (schedule, bank, debt) to local storage.
- `docs/ROADMAP.md` adds detailed MVP tasks and a new Post-MVP Nice-to-Haves section.
- `docs/reports/AUDIT_REPORT_2026-01-12.md` separates MVP tech debt from post-MVP Gemini work.
- Switched Gemini client config to `import.meta.env.VITE_GEMINI_API_KEY` and removed `process.env` injection in `vite.config.ts`.
