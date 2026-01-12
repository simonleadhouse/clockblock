import React, { useEffect, useState } from 'react';
import { WeeklySchedule } from '../types';
import { generateForecasterInsight } from '../services/geminiService';

interface ForecastProps {
  schedule: WeeklySchedule;
  currentDayIndex: number; // 0-6 (Sun-Sat)
  bankBalance: number;
}

const Forecast: React.FC<ForecastProps> = ({ schedule, currentDayIndex, bankBalance }) => {
  const [insight, setInsight] = useState<string>("Reading the tea leaves...");

  useEffect(() => {
    // Get simple insight
    const today = schedule[currentDayIndex];
    const tomorrowIndex = (currentDayIndex + 1) % 7;
    const tomorrow = schedule[tomorrowIndex];

    generateForecasterInsight(
        bankBalance, 
        { day: today.dayName, limit: today.allowance }, 
        { day: tomorrow.dayName, limit: tomorrow.allowance }
    ).then(setInsight);
  }, [bankBalance, currentDayIndex, schedule]);

  return (
    <div className="w-full mt-6 mb-2">
        {/* AI Insight Header */}
        <div className="flex items-center gap-3 mb-4 bg-purple-900/20 p-3 rounded-xl border border-purple-500/20 backdrop-blur-sm">
            <span className="text-2xl">🔮</span>
            <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-purple-300 font-bold mb-0.5">The Forecaster</div>
                <div className="text-sm text-purple-100 font-medium italic">"{insight}"</div>
            </div>
        </div>

        {/* Forecast Row */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {schedule.map((day, idx) => {
                const isToday = idx === currentDayIndex;
                const isPast = false; // Simplified for this view, we assume list is static Mon-Sun or we can rotate. 
                // Let's just show the static week, highlighting today.
                
                return (
                    <div 
                        key={day.dayName}
                        className={`
                            flex-1 min-w-[70px] flex flex-col items-center p-3 rounded-xl border relative overflow-hidden transition-all
                            ${isToday 
                                ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] transform scale-105 z-10' 
                                : 'bg-white/5 border-white/5 opacity-60'
                            }
                        `}
                    >
                        {isToday && (
                             <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-bl-md shadow-sm"></div>
                        )}
                        
                        <span className={`text-xs uppercase font-bold mb-1 ${isToday ? 'text-white' : 'text-white/50'}`}>
                            {day.dayName}
                        </span>
                        
                        <div className="text-xl font-display tracking-tight text-white mb-1">
                            {day.allowance}
                        </div>
                        
                        <div className={`h-1 w-full rounded-full ${day.isWeekend ? 'bg-purple-500' : 'bg-blue-500/50'}`}></div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default Forecast;