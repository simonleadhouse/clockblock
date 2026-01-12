import { WeeklySchedule } from './types';

export const COLORS = {
  background: '#1A1B26', // Navy
  surface: '#24283b', // Lighter Navy
  primary: '#3b82f6', // Diamond Blue
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Red
  text: '#ffffff',
  border: 'rgba(255,255,255,0.1)',
};

const DEFAULT_WINDOW_START = "08:00";
const DEFAULT_WINDOW_END = "20:00";

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = [
  { dayName: 'Sun', allowance: 60, windowStart: DEFAULT_WINDOW_START, windowEnd: DEFAULT_WINDOW_END, isWeekend: false },
  { dayName: 'Mon', allowance: 60, windowStart: DEFAULT_WINDOW_START, windowEnd: DEFAULT_WINDOW_END, isWeekend: false },
  { dayName: 'Tue', allowance: 60, windowStart: DEFAULT_WINDOW_START, windowEnd: DEFAULT_WINDOW_END, isWeekend: false },
  { dayName: 'Wed', allowance: 60, windowStart: DEFAULT_WINDOW_START, windowEnd: DEFAULT_WINDOW_END, isWeekend: false },
  { dayName: 'Thu', allowance: 60, windowStart: DEFAULT_WINDOW_START, windowEnd: DEFAULT_WINDOW_END, isWeekend: false },
  { dayName: 'Fri', allowance: 120, windowStart: DEFAULT_WINDOW_START, windowEnd: "22:00", isWeekend: true },
  { dayName: 'Sat', allowance: 120, windowStart: DEFAULT_WINDOW_START, windowEnd: "22:00", isWeekend: true },
];

export const DEFAULT_CONFIG = {
  overdraftMultiplier: 2.0,
  bankCap: 60,
};

export const MOCK_HISTORY = [
  { date: '2023-10-23', minutesPlayed: 50, minutesAdded: 0, minutesPenalty: 0, bankedMinutes: 10, overdraftMinutes: 0 },
  { date: '2023-10-24', minutesPlayed: 75, minutesAdded: 0, minutesPenalty: 0, bankedMinutes: 0, overdraftMinutes: 15 },
  { date: '2023-10-25', minutesPlayed: 30, minutesAdded: 0, minutesPenalty: 30, bankedMinutes: 0, overdraftMinutes: 0 },
  { date: '2023-10-26', minutesPlayed: 55, minutesAdded: 10, minutesPenalty: 0, bankedMinutes: 15, overdraftMinutes: 0 },
];