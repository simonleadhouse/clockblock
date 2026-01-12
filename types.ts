export interface DailyLog {
  date: string; // YYYY-MM-DD
  minutesPlayed: number;
  minutesAdded: number;
  minutesPenalty: number;
  bankedMinutes: number;
  overdraftMinutes: number;
}

export interface DayConfig {
  dayName: string; // "Mon", "Tue", etc.
  allowance: number; // minutes
  windowStart: string; // "08:00"
  windowEnd: string; // "20:00"
  isWeekend: boolean;
}

export type WeeklySchedule = DayConfig[];

export interface UserConfig {
  weeklySchedule: WeeklySchedule;
  overdraftMultiplier: number;
  bankCap: number;
}

export interface AppState {
  currentBudget: number; // Remaining minutes for today
  totalDebt: number; // Accumulated debt affecting tomorrow
  weekendBank: number; // Saved minutes
  isPlaying: boolean;
  isOverdraft: boolean;
  dailyLogs: DailyLog[];
}

export enum ViewMode {
  ONBOARDING = 'ONBOARDING',
  HUD = 'HUD',
  PARENT = 'PARENT',
  STORY = 'STORY'
}

export type VillagerMood = 'HAPPY' | 'NEUTRAL' | 'WARNING' | 'ANGRY';