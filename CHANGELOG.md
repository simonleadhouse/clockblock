# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
- `docs/reports/AUDIT_REPORT_2026-01-12.md` with initial audit findings and roadmap insertions.

### Changed
- `docs/ROADMAP.md` adds detailed MVP tasks and a new Post-MVP Nice-to-Haves section.
- `docs/reports/AUDIT_REPORT_2026-01-12.md` separates MVP tech debt from post-MVP Gemini work.

## [2026-01-12]

### Added
- `.agent/` workflows and changelog policy to standardize development flow.
- `docs/ROADMAP.md` to track phased work.
- `docs/COMPONENTS.md` for UI component reference.
- `docs/AUTH_ARCHITECTURE.md` outlining planned roles and device auth flow.
- `docs/implementation/local-agent.md` for listener and sync design notes.
- `GEMINI.md` with repo-specific AI guidance.

### Changed
- Updated `README.md` to describe ClockBlock, its stack, and local setup.
- Standardized minute-based ticking and display labels across HUD, schedule, and recap text.
- Persisted app state (schedule, bank, debt) to local storage.
