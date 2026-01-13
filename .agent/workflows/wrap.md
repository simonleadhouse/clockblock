---
description: Session Wrap-Up Protocol
---

# Session Wrap-Up Protocol

***SYSTEM INSTRUCTION: ADOPT PERSONA***
You are a release manager preparing a clean handoff.
- Scope: documentation-only changes unless explicitly requested.
- Tone: concise, factual, checklist-driven.
- Output: include a final handoff summary with exact files touched.

We are now going to wrap up this chat and move on to another instance with a fresh context window.

Please execute the following Session Wrap-Up Protocol to ensure a seamless handoff to the next developer and AI instance:

## Phase 1: Documentation Sync

Scan the repository root and `/docs`. Based on the work completed in this session, update the following documents to reflect the latest state, adhering to their existing structure and formatting:

1. **Root Documents**
   - Confirm today's date before editing `CHANGELOG.md` (use `date +%Y-%m-%d`).
   - `CHANGELOG.md`: Add a concise entry for today's changes.
     - If a dated section for today exists, move the entry out of `[Unreleased]` into that section.
   - `README.md`: Update setup/usage instructions if changed.

2. **Core Documentation**
   - `docs/PRD.md`: Update status of requirements.
   - `docs/ROADMAP.md`: Check off completed items and adjust timelines.
   - `GEMINI.md`: Log any significant architectural choices or technical decisions (`Key Technical Decisions` section).
   - `README.md`: Update architecture or scope if shifted (`Architecture` section).

If a document does not need updates, explicitly state “no change” rather than editing it.

## Phase 2: Persist Implementation Plans (Critical)

If you created an implementation plan or coding roadmap during this session that hasn't been fully coded yet:

1. **Persist**: Add the plan directly under the relevant phase in `docs/ROADMAP.md`.
   - Naming: use a clear, feature-specific subheading.
2. **Reference**: If needed, add a short note in the phase checklist pointing to the new subheading.

## Phase 3: Handoff Summary

1. **Check Status**: Run `git status` to identify all modified and untracked files. // turbo
2. **Commit Message**: Draft a single-line commit message that matches the completed work scope.
2. **Summary**: Provide a final Handoff Summary listing exactly which files were modified in this session, noting any pre-existing dirty files, and confirming that the context is safe to reset.
Also include a one-line recommendation on whether to commit now, merge into main, or keep working on the current dev branch, with a brief reason.
Use this decision rubric for the recommendation:
- **Commit now** if at least one roadmap checkbox was completed, a discrete feature slice was finished, or you would be comfortable resetting context without losing clarity.
- **Merge into main** only if a phase milestone gate or checkpoint is fully satisfied and the change set is low-risk.
- **Keep going on dev branch** if the work is mid-slice, tests/QA or follow-ups are still needed, or more related tasks are planned before a checkpoint.
- **Workflow Optimization Suggestion** based on your experience with the various workflows used in this chat including this one suggest 1 to 3 optimizations for each workflow used.

## Changelog Policy (Always On)
Maintain `CHANGELOG.md` as a living working history.

### Rules
- Update continuously as you work, especially after solving problems or making architectural decisions.
- Do NOT create separate `walkthrough.md` files; summarize verification results, visual changes, and implementation details in the changelog instead.
- Use Keep a Changelog format with `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- Include the date for new entries.
- Be concise but specific about files/components touched.

### Philosophy
- Educate future instances: document why things are the way they are and pitfalls to avoid.
- Keep a working history: preserve what didn't work and how it was fixed.
- Periodically refine and consolidate minor updates without losing technical detail.

### Fixed Entry Requirement
For `Fixed` items (and "What didn't work"), include Issue, Cause, Solution:
```markdown
- **Hydration Error**:
  - _Issue_: Mismatch between server and client HTML.
  - _Cause_: Browser extensions injecting attributes.
  - _Solution_: Added `suppressHydrationWarning` to `<html>` tag.
```
