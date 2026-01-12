import React, { useEffect, useState } from 'react';
import XPBar from './ui/XPBar';
import VillagerNudge from './VillagerNudge';
import PixelButton from './ui/PixelButton';
import Forecast from './Forecast';
import { AppState, ViewMode, WeeklySchedule } from '../types';

interface HUDProps {
  appState: AppState;
  togglePlay: () => void;
  setView: (v: ViewMode) => void;
  schedule: WeeklySchedule;
}

const HUD: React.FC<HUDProps> = ({ appState, togglePlay, setView, schedule }) => {
  const { currentBudget, isPlaying, isOverdraft, weekendBank, totalDebt } = appState;
  
  // Connectivity Check (Section 6.A)
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Determine current day config for Curfew check
  const currentDayIndex = new Date().getDay(); // 0 = Sunday
  const todayConfig = schedule[currentDayIndex];
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Parse window times (e.g., "08:00" -> 480)
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const startMinutes = parseTime(todayConfig.windowStart);
  const endMinutes = parseTime(todayConfig.windowEnd);
  
  const isNightOwl = currentMinutes < startMinutes || currentMinutes > endMinutes;

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-4 lg:p-8 relative">
      
      {/* Offline Banner */}
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-500/90 text-black font-display font-bold text-center py-2 z-50 animate-pulse tracking-widest uppercase text-sm">
            ⚠ OFFLINE MODE - TRACKING LOCALLY
        </div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-2 gap-4 lg:gap-8 mb-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/10 flex items-center gap-5 shadow-xl shadow-black/40 hover:bg-white/10 transition-colors">
             <div className="text-4xl lg:text-5xl drop-shadow-lg">💎</div>
             <div>
                <div className="font-display font-bold text-blue-400 text-xs uppercase tracking-widest mb-1">Savings</div>
                <div className="font-display font-black text-3xl lg:text-4xl text-white tracking-tight text-shadow">{weekendBank}m</div>
             </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/10 flex items-center gap-5 shadow-xl shadow-black/40 hover:bg-white/10 transition-colors">
             <div className="text-4xl lg:text-5xl drop-shadow-lg">❤️</div>
             <div>
                <div className="font-display font-bold text-red-400 text-xs uppercase tracking-widest mb-1">Debt</div>
                <div className="font-display font-black text-3xl lg:text-4xl text-white tracking-tight text-shadow">-{totalDebt}m</div>
             </div>
        </div>
      </div>

      {/* MASSIVE HERO SECTION */}
      <div className="flex-1 flex flex-col justify-center items-center py-2">
          {/* The Big Number */}
          <div className={`
            text-[20vh] lg:text-[22vh] leading-none font-display font-black tracking-tight select-none transition-colors duration-500
            drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]
            ${isOverdraft ? 'text-red-500' : 'text-white'}
          `}>
             {isOverdraft ? '-' : ''}{Math.abs(currentBudget)}
             <span className="text-[5vh] text-white/40 ml-4 font-bold uppercase tracking-normal">MIN</span>
          </div>

          <div className="w-full max-w-4xl mt-8 mb-8 relative">
            <XPBar current={currentBudget} max={todayConfig.allowance} isOverdraft={isOverdraft} />
            
            {/* Curfew Warning */}
            {isNightOwl && (
                <div className="absolute -right-4 -top-10 rotate-3 bg-purple-600 text-white px-3 py-1 font-display font-bold uppercase tracking-widest text-xs border-2 border-white shadow-lg animate-pulse z-20">
                    🌙 Night Owl Active
                </div>
            )}
          </div>

          <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-full border border-white/5 backdrop-blur-sm">
             <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-gray-600'}`}></div>
             <span className="font-display font-bold text-white/70 tracking-widest uppercase text-sm">
                {isPlaying ? 'System Online' : 'System Standby'}
             </span>
          </div>

          {/* New Forecast Section */}
          <div className="w-full max-w-4xl mt-4">
            <Forecast 
                schedule={schedule} 
                currentDayIndex={currentDayIndex} 
                bankBalance={weekendBank} 
            />
          </div>
      </div>

      {/* Footer Area */}
      <div className="mt-auto">
        <div className="mb-6">
             <VillagerNudge 
                remainingMinutes={currentBudget} 
                isOverdraft={isOverdraft}
                isPlaying={isPlaying}
            />
        </div>

        <div className="flex justify-center pb-2">
            <PixelButton 
                label={isPlaying ? "PAUSE GAME" : "RESUME GAME"} 
                onClick={togglePlay} 
                variant={isPlaying ? 'danger' : 'success'}
                className="w-full max-w-xl text-2xl shadow-2xl"
                icon={isPlaying ? "⏸" : "▶"}
            />
        </div>
      </div>
    </div>
  );
};

export default HUD;