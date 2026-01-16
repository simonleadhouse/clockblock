# GEMINI.md

This file provides guidance to AI agents working in this repository.

## Table of Contents
- [Project Overview](#project-overview)
- [Essential Commands](#essential-commands)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Key Technical Decisions & Patterns](#key-technical-decisions--patterns)
- [Design System Notes](#design-system-notes)
- [Troubleshooting](#troubleshooting)

## Git Policy
- Do not run `git commit` or `git push` without explicit user approval.
- Stage changes with `git add` only when preparing for user review.

## Project Overview
ClockBlock is a connected time-management HUD for a young Minecraft player. The current codebase is a React/Vite prototype with mocked state and optional Gemini-powered story output.

## Essential Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Architecture

### Frontend (Current)
- Vite + React 19 + TypeScript
- App state lives in `App.tsx`
- Views are switched via `ViewMode`
- Gemini prompts live in `services/geminiService.ts`

### Planned Backend
- Python listener on the child PC to detect `Minecraft.exe`
- Supabase for auth, realtime status, and daily logs

## File Structure
- `App.tsx` - State owner for budgets, overdraft, schedule, and view mode
- `components/` - HUD, Operator Dashboard, Onboarding, Forecast, and UI elements
- `services/` - Gemini prompt helpers
- `docs/` - PRD, roadmap, and implementation notes

## Key Technical Decisions & Patterns

### 1. Prototype-First State Modeling
State is stored in React hooks, favoring clarity over persistence. Future work will move time tracking to the local agent and sync via Supabase.

### 2. Time & Budget Mechanics
- `weeklySchedule` drives daily limits and curfews.
- Overdraft accumulates as minutes played below zero.
- Rollover bank caps at `DEFAULT_CONFIG.bankCap`.

### 3. Operator Access
The Operator dashboard is gated by a local PIN stored in `localStorage`. This is not a security feature, only a convenience gate for the prototype.

### 4. Gemini Usage
Gemini calls are currently client-side. For production:
- Move calls to a serverless function.
- Do not ship API keys to the browser.

### 5. Component Data Flow
Presentation components receive data via props. The App shell owns state and passes handlers down.

### 6. Local Agent Offline Queue
The listener appends heartbeat payloads to a local JSONL queue when offline and replays them on reconnect. Queue path defaults to `~/.clockblock/heartbeat_queue.jsonl` and is configurable via `CLOCKBLOCK_QUEUE_PATH`.

## Design System Notes
- Prioritize bold, chunky typography and large readable numbers.
- Use bright accent colors (diamond blue, creeper green, TNT red).
- Avoid terminal-style UI; keep it playful and approachable.

## Troubleshooting
- Missing Gemini responses: confirm `GEMINI_API_KEY` in `.env.local`.
- Vite env changes require a dev server restart.
