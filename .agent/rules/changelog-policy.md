---
trigger: always_on
---

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