# Roadmap

## Phase 1: Prototype Stabilization (Current Focus)
- [x] Core UI shell with navigation between HUD, History, and Operator views.
- [x] HUD timer, overdraft state, and savings/debt indicators.
- [x] Operator dashboard with PIN gate and schedule editor.
- [x] Onboarding tutorial flow for core rules.
- [ ] Normalize time units (minutes vs seconds) and display format across HUD, logs, and schedule.
- [ ] Persist app state (schedule, bank, debt) to local storage.
- [ ] Replace alert-based day reset with an in-app modal.
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
