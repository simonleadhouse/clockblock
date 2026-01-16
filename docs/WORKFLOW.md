# ClockBlock Workflow

This guide explains the repeatable workflow for working on ClockBlock. It keeps the roadmap high-level while using plan docs for implementation details.

## Concepts

- **Roadmap** (`docs/ROADMAP.md`) is the high-level task tracker.
- **Plan docs** (`docs/plans/*.md`) are the step-by-step implementation plans for a specific roadmap item.
- **Start/Wrap workflows** live in `.agent/workflows/` and encode the session checklist.

## Step-by-step Workflow

### 1) Start the session
**What:** Open the core docs in order: `docs/PRD.md`, `README.md`, `GEMINI.md`, `docs/ROADMAP.md`, `CHANGELOG.md`.
**Why:** This restores context so decisions match the current scope and constraints.

### 2) Pick the next roadmap item
**What:** Choose the first unchecked, non-checkpoint item in the current phase (or a user-specified task).
**Why:** This keeps work aligned to the agreed MVP sequence.

### 3) Link the plan doc
**What:** Under the chosen roadmap item, add a sub-bullet:
`- Plan: docs/plans/YYYY-MM-DD-<feature>.md`
**Why:** The roadmap stays readable while the plan carries detailed steps.

### 4) Create or update the plan
**What:** If no plan exists, create one in `docs/plans/`. If it exists, review and update it.
**Why:** Plans reduce rework and ensure tasks are executed consistently across sessions.

### 5) Execute the plan
**What:** Work the plan step-by-step. Use tests and verification before marking items done.
**Why:** This prevents partial work from being mistaken as complete and keeps quality high.

### 6) Update documentation
**What:** Mark roadmap items complete when done, and update `CHANGELOG.md`.
**Why:** Documentation is the single source of truth for progress and handoffs.

### 7) Wrap the session
**What:** Run `.agent/workflows/wrap.md` to sync docs and produce a clean handoff.
**Why:** Future sessions pick up quickly with clear next steps.

## File Conventions
- **Roadmap** items are checkboxes; plans are sub-bullets.
- **Plan docs** live in `docs/plans/` and use the `YYYY-MM-DD-<feature>` naming format.
