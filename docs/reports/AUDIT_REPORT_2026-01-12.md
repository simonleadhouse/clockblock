# Audit Report: 2026-01-12

## 1. Executive Summary
- **Project Context**: React 19 + Vite + TypeScript / Prototype
- **Overall Health**: Needs Attention
- **Verdict**: Strong prototype foundation, but key security and build reproducibility issues need attention before any public deployment.

## 2. High-Priority Risks (Must Fix)
| Risk | Impact | Suggested Fix |
| :--- | :--- | :--- |
| Gemini API key exposed to the browser bundle (`vite.config.ts` injects `process.env.*` and `services/geminiService.ts` calls Gemini client-side) | Key leakage, unexpected billing, and abuse if the app is ever hosted | Move Gemini calls behind a serverless/edge proxy; keep API key server-side only. Use client requests to your backend instead of direct SDK calls. |
| `npm run build` fails in a clean environment (`vite` not found) | Critical - Broken Build in CI or fresh checkouts | Ensure `npm install`/`npm ci` runs before build in any pipeline, or document it explicitly in a CI script or build instructions. |

## 3. Improvements (Nice to Have / Technical Debt)
These are MVP tech-debt items only. Post-MVP nice-to-haves are listed separately in Section 4.
- [ ] Replace `process.env.*` usage in client code with Vite’s `import.meta.env` for non-secret config.
- [ ] Add `.env.example` to document required variables without risking real keys.
- [ ] Consider exposing the dev server port via env (e.g., `VITE_PORT`) to avoid hard-coded defaults.

## 4. Roadmap Insertions

| Priority | Suggested Task | Target Phase | Insertion Point (after which line/task) | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Medium | `- [ ] Add .env.example and switch non-secret config to import.meta.env` | Phase 1 | After `- [ ] Persist app state (schedule, bank, debt) to local storage.` | Improves onboarding clarity and aligns with Vite env best practices. |
| Medium | `- [ ] Add CI/build script that runs npm ci before npm run build` | Phase 1 | After `- [ ] Replace alert-based day reset with an in-app modal.` | Prevents “vite not found” failures on clean machines/CI. |

Post-MVP Nice-to-Haves (separate list)

| Priority | Suggested Task | Target Phase | Insertion Point (after which line/task) | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Low | `- [ ] Move Gemini calls to serverless proxy; keep API key server-side only` | Post-MVP | Add a new `## Post-MVP Nice-to-Haves` section at end of `docs/ROADMAP.md` | Keeps AI features out of MVP while resolving client-side key exposure when revisited. |

---

## 5. Next Steps (User Action Required)

After reviewing this report:
1. **Confirm Roadmap Insertions**: Tell me which items from the table above you approve.
2. **I will update `ROADMAP.md`**: Once confirmed, I can directly insert the approved tasks.
3. **Start Fixing**: Tell me which High-Priority Risk to tackle first.

---

**Final Note**: If you approve all insertions, say "Apply roadmap changes". I will modify `ROADMAP.md` accordingly.
