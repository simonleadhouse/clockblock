# Roadmap

## Phase 1: Prototype Stabilization (Current Focus)
- [x] Core UI shell with navigation between HUD, History, and Operator views.
- [x] HUD timer, overdraft state, and savings/debt indicators.
- [x] Operator dashboard with PIN gate and schedule editor.
- [x] Onboarding tutorial flow for core rules.
- [x] Normalize time units (minutes vs seconds) and display format across HUD, logs, and schedule.
- [x] Persist app state (schedule, bank, debt) to local storage.
- [x] Add `.env.example` and switch non-secret config to `import.meta.env`; expected: `.env.example` documents `GEMINI_API_KEY` placeholder and any other required vars, and client code no longer references `process.env.*` for non-secret config.
- [x] Replace alert-based day reset with an in-app modal.
- [x] Add a build script or CI note that runs `npm ci` before `npm run build`; expected: a clean checkout builds successfully without manual steps.
- [ ] Add offline indicator to Operator view (not just HUD).
- [ ] Checkpoint: wrap/handoff.

## Phase 2: Local Agent + Sync
- [ ] Implement Python listener to detect `Minecraft.exe` and emit heartbeat.
- [ ] Local cache for offline tracking and reconnection sync.
- [ ] Supabase schema and RPCs for daily logs.
- [ ] Real-time heartbeat status on HUD (Online/Offline/Last Seen).
- [ ] Checkpoint: wrap/handoff.

## Phase 3: Multi-Device + Access Control
- [ ] Supabase auth for parent/child roles.
- [ ] Device pairing flow (child PC to parent dashboard).
- [ ] Remote parent dashboard (mobile) with override actions.
- [ ] Deployment (Vercel + Supabase).
- [ ] Checkpoint: wrap/handoff.

## Post-MVP Nice-to-Haves
- [ ] Move Gemini calls to a serverless/edge proxy and keep API keys server-side only; expected: no direct Gemini SDK usage in the browser bundle, and the client calls a backend endpoint for nudges/recaps.
