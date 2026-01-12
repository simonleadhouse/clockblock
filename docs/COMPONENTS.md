# Component Reference Guide

This document provides a technical reference for the core UI components in ClockBlock. It is intended to help contributors understand props, data flow, and integration points.

## Table of Contents
- [App Shell](#app-shell)
- [Core Views](#core-views)
- [Shared UI Components](#shared-ui-components)
- [Services](#services)

## App Shell

### App
The primary application container that owns global state and routes between views.

**Path**: `App.tsx`

**Responsibilities**
- Holds `ViewMode` state (HUD, History, Operator, Onboarding).
- Simulates timer and overdraft logic.
- Owns `weeklySchedule` and budget math.
- Passes state to HUD and Parent Dashboard.

## Core Views

### HUD
The child-facing heads-up display for current time balance and status.

**Path**: `components/HUD.tsx`

**Props**
```ts
interface HUDProps {
  appState: AppState;
  togglePlay: () => void;
  setView: (v: ViewMode) => void;
  schedule: WeeklySchedule;
}
```

### ParentDashboard
Operator view for manual overrides and schedule configuration.

**Path**: `components/ParentDashboard.tsx`

**Props**
```ts
interface ParentDashboardProps {
  setView: (v: ViewMode) => void;
  adjustBudget: (amount: number) => void;
  onSimulateDayEnd: () => void;
  appState: { currentBudget: number; totalDebt: number; weekendBank: number };
  schedule: WeeklySchedule;
  onUpdateSchedule: (s: WeeklySchedule) => void;
}
```

### WeeklyRecap
Generates a Gemini-backed weekly story recap.

**Path**: `components/WeeklyRecap.tsx`

**Props**
```ts
interface WeeklyRecapProps {
  currentSessionLog?: DailyLog;
}
```

### Onboarding
Multi-step tutorial explaining the rules of the system.

**Path**: `components/Onboarding.tsx`

**Props**
```ts
interface OnboardingProps {
  onComplete: () => void;
}
```

### Scheduler
Operator schedule editor for daily limits and curfew windows.

**Path**: `components/Scheduler.tsx`

**Props**
```ts
interface SchedulerProps {
  schedule: WeeklySchedule;
  onUpdate: (newSchedule: WeeklySchedule) => void;
}
```

### Forecast
Child-facing weekly forecast row with AI insight.

**Path**: `components/Forecast.tsx`

**Props**
```ts
interface ForecastProps {
  schedule: WeeklySchedule;
  currentDayIndex: number;
  bankBalance: number;
}
```

### VillagerNudge
AI-driven one-liner nudge based on remaining time.

**Path**: `components/VillagerNudge.tsx`

**Props**
```ts
interface VillagerNudgeProps {
  remainingMinutes: number;
  isOverdraft: boolean;
  isPlaying: boolean;
}
```

## Shared UI Components

### PixelButton
Chunky action button used across the UI.

**Path**: `components/ui/PixelButton.tsx`

**Props**
```ts
interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'secondary' | 'glass';
  label: string;
  icon?: string;
}
```

### XPBar
Progress bar representing remaining minutes or overdraft state.

**Path**: `components/ui/XPBar.tsx`

**Props**
```ts
interface XPBarProps {
  current: number;
  max: number;
  isOverdraft: boolean;
}
```

## Services

### Gemini Service
Wrapper for Gemini prompts used by `VillagerNudge`, `Forecast`, and `WeeklyRecap`.

**Path**: `services/geminiService.ts`

**Notes**
- Requires `GEMINI_API_KEY` in `.env.local`.
- Current usage runs client-side; for production, move calls to a serverless API to avoid exposing keys.
