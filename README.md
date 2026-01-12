# ClockBlock

A connected time-management system for a young Minecraft player that teaches awareness and consequences instead of hard locks. The app displays remaining time, overdraft penalties, and a weekly forecast while parents can adjust rules remotely.

## Features
- Big, bold HUD with remaining minutes and overdraft status.
- Weekly schedule editor with curfew windows.
- Savings bank and overdraft debt mechanics.
- Operator dashboard with PIN gate for overrides.
- Optional Gemini-based storytelling and nudges.

## Tech Stack
- React 19 + Vite + TypeScript
- Gemini API (`@google/genai`) for narrative and nudges
- Planned: Python local agent + Supabase backend

## Quick Start

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set your API key in `.env.local`:
   ```env
   GEMINI_API_KEY=your-key
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev` - Start the dev server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## Project Structure
- `App.tsx` - App shell and state management
- `components/` - HUD, Operator Dashboard, Onboarding, and UI elements
- `services/` - Gemini prompt helpers
- `docs/` - PRD, roadmap, and implementation notes

## Architecture Notes
- Current build is a frontend prototype with mocked state.
- The local listener will be responsible for source-of-truth time tracking.
- Supabase will provide auth, realtime sync, and storage for daily logs.

## Design Guidance
- Keep UI bold and readable from a distance.
- Favor playful Minecraft motifs over “hacker terminal” styling.
