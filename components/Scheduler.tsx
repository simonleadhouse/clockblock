import React from 'react';
import { WeeklySchedule, DayConfig } from '../types';

interface SchedulerProps {
  schedule: WeeklySchedule;
  onUpdate: (newSchedule: WeeklySchedule) => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ schedule, onUpdate }) => {

  const handleDayChange = (index: number, field: keyof DayConfig, value: any) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const copyTo = (isWeekendTarget: boolean) => {
    const source = schedule.find(d => d.isWeekend === !isWeekendTarget); 
    if (!source) return;

    const updated = schedule.map(day => {
      if (day.isWeekend === isWeekendTarget) {
        return { 
          ...day, 
          allowance: source.allowance, 
          windowStart: source.windowStart, 
          windowEnd: source.windowEnd 
        };
      }
      return day;
    });
    onUpdate(updated);
  };

  return (
    <div className="bg-[#1A1B26]/50 rounded-3xl border border-white/10 p-6 md:p-8 shadow-inner w-full">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8 border-b border-white/5 pb-6">
        <div>
          <h3 className="font-display font-black text-3xl text-yellow-400 uppercase tracking-tight drop-shadow-sm flex items-center gap-3">
            <span className="text-4xl">📅</span> Weekly Schedule
          </h3>
          <p className="text-white/40 text-sm font-medium mt-2 max-w-md leading-relaxed">
            Configure daily allowance limits and active hours. Play outside these hours triggers "Night Owl" mode.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
            <button 
                onClick={() => copyTo(false)}
                className="flex-1 xl:flex-none bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
            >
                ⚡ Copy Mon ➔ Weekdays
            </button>
            <button 
                onClick={() => copyTo(true)}
                className="flex-1 xl:flex-none bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
            >
                ⚡ Copy Fri ➔ Weekends
            </button>
        </div>
      </div>

      {/* The Schedule Grid */}
      <div className="grid grid-cols-1 gap-4">
        {schedule.map((day, idx) => {
            const isWeekend = day.isWeekend;
            return (
                <div 
                    key={day.dayName} 
                    className={`
                        relative overflow-hidden rounded-2xl p-1 transition-all duration-200 group
                        ${isWeekend 
                            ? 'bg-gradient-to-r from-purple-900/40 to-purple-900/10 hover:from-purple-900/60' 
                            : 'bg-gradient-to-r from-blue-900/40 to-blue-900/10 hover:from-blue-900/60'
                        }
                    `}
                >
                    {/* Border Accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isWeekend ? 'bg-purple-500' : 'bg-blue-500'}`}></div>

                    <div className="flex flex-col md:flex-row items-stretch gap-4 p-4 pl-6">
                        
                        {/* Day Label */}
                        <div className="flex items-center justify-between md:flex-col md:items-start md:justify-center min-w-[100px]">
                            <span className="font-display font-black text-3xl text-white tracking-wide">{day.dayName}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${isWeekend ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                {isWeekend ? 'Weekend' : 'Weekday'}
                            </span>
                        </div>

                        {/* Controls Container */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Allowance Input */}
                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-center relative group-focus-within:border-white/20 transition-colors">
                                <label className="text-[10px] uppercase font-bold text-white/30 mb-1 flex items-center gap-1">
                                    💎 Daily Limit
                                </label>
                                <div className="flex items-center gap-2">
                                     <input 
                                        type="number" 
                                        value={day.allowance}
                                        onChange={(e) => handleDayChange(idx, 'allowance', parseInt(e.target.value) || 0)}
                                        className="w-full bg-transparent text-3xl font-mono font-bold text-white focus:outline-none placeholder-white/10"
                                     />
                                     <span className="text-sm font-bold text-white/20 uppercase tracking-widest mr-2">min</span>
                                </div>
                            </div>

                            {/* Time Window Input */}
                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-center group-focus-within:border-white/20 transition-colors">
                                <label className="text-[10px] uppercase font-bold text-white/30 mb-1 flex items-center gap-1">
                                    ⏰ Active Hours
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="time" 
                                        value={day.windowStart}
                                        onChange={(e) => handleDayChange(idx, 'windowStart', e.target.value)}
                                        className="bg-[#24283b] text-white font-bold rounded px-2 py-1 text-sm border border-white/10 focus:border-blue-500 focus:outline-none flex-1 [color-scheme:dark]"
                                    />
                                    <span className="text-white/20 font-bold">-</span>
                                    <input 
                                        type="time" 
                                        value={day.windowEnd}
                                        onChange={(e) => handleDayChange(idx, 'windowEnd', e.target.value)}
                                        className="bg-[#24283b] text-white font-bold rounded px-2 py-1 text-sm border border-white/10 focus:border-blue-500 focus:outline-none flex-1 [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default Scheduler;
