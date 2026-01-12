import React, { useState, useEffect, useRef } from 'react';
import HUD from './components/HUD';
import ParentDashboard from './components/ParentDashboard';
import WeeklyRecap from './components/WeeklyRecap';
import Onboarding from './components/Onboarding';
import { AppState, ViewMode, DailyLog, WeeklySchedule } from './types';
import { DEFAULT_CONFIG, DEFAULT_WEEKLY_SCHEDULE } from './constants';

const BUDGET_TICK_MS = 60_000;

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.ONBOARDING);
  
  // -- CONFIG STATE (Section 3.F) --
  // Initialize with default schedule
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(DEFAULT_WEEKLY_SCHEDULE);

  // Helper to get today's limit
  const getTodayLimit = () => {
      const dayIndex = new Date().getDay(); // 0 = Sun
      return weeklySchedule[dayIndex].allowance;
  };

  // -- APP STATE --
  // Initialize currentBudget based on Today's Schedule (not static constant)
  const [currentBudget, setCurrentBudget] = useState(getTodayLimit());
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [overdraftAccumulated, setOverdraftAccumulated] = useState(0);
  const [weekendBank, setWeekendBank] = useState(0);
  
  // Debt applied to the *current* day (from yesterday)
  const [prevDayPenalty, setPrevDayPenalty] = useState(0);
  
  // Logo error handling state
  const [logoError, setLogoError] = useState(false);

  // Timer Ref
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -- LOGIC --
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentBudget((prev) => {
          const newValue = prev - 1; 
          if (newValue < 0) {
             setOverdraftAccumulated(od => od + 1);
          }
          return newValue;
        });
      }, BUDGET_TICK_MS); 
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const isOverdraft = currentBudget < 0;
  const totalDebt = prevDayPenalty + (overdraftAccumulated * DEFAULT_CONFIG.overdraftMultiplier);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const adjustBudget = (amount: number) => {
    setCurrentBudget(prev => prev + amount);
  };

  // PRD Section 3.C: Economy Logic
  const handleSimulateDayEnd = () => {
      // 1. Calculate Overdraft Penalty for TOMORROW
      let newPenalty = 0;
      if (currentBudget < 0) {
          newPenalty = Math.abs(currentBudget) * DEFAULT_CONFIG.overdraftMultiplier;
      }

      // 2. Calculate Bank Rollover
      let newBank = weekendBank;
      if (currentBudget > 0) {
          const toBank = Math.min(currentBudget, DEFAULT_CONFIG.bankCap - weekendBank);
          newBank += toBank;
      }

      // 3. Reset for "Tomorrow"
      setPrevDayPenalty(newPenalty); 
      setWeekendBank(newBank);
      setOverdraftAccumulated(0);
      setIsPlaying(false);
      
      // CRITICAL: Get *Tomorrow's* limit.
      // For simulation purposes, we just reload "Today's" limit from the schedule for simplicity in this demo,
      // but in production this would rotate the day index.
      // Let's grab the limit from the current schedule state.
      const dailyLimit = getTodayLimit();
      setCurrentBudget(dailyLimit - newPenalty);
      
      alert(`DAY RESET COMPLETE (Simulated)\n\nBanked: ${newBank} min\nPenalty Applied: -${newPenalty} min\nNew Budget: ${dailyLimit - newPenalty} min`);
  };

  const getCurrentLog = (): DailyLog => ({
      date: new Date().toISOString().split('T')[0],
      minutesPlayed: getTodayLimit() - currentBudget + (currentBudget < 0 ? Math.abs(currentBudget) : 0),
      minutesAdded: 0,
      minutesPenalty: prevDayPenalty,
      bankedMinutes: weekendBank,
      overdraftMinutes: overdraftAccumulated
  });

  const NavItem = ({ mode, label, icon }: { mode: ViewMode, label: string, icon: string }) => (
    <button 
        onClick={() => setView(mode)}
        className={`
            w-full flex items-center gap-4 px-6 py-5 transition-all duration-300 ease-out
            border-l-4 group relative overflow-hidden
            ${view === mode 
                ? 'bg-blue-500/10 border-blue-500 text-white shadow-[inset_10px_0_20px_-10px_rgba(59,130,246,0.2)]' 
                : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white hover:border-blue-400/50'
            }
        `}
    >
        <span className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${view === mode ? 'text-blue-400 drop-shadow-md' : ''}`}>{icon}</span>
        {/* UPDATED: font-display is now system sans, so added font-extrabold and tracking-wide to match buttons */}
        <span className="font-display font-extrabold uppercase tracking-wide text-sm">{label}</span>
        {view === mode && <div className="absolute inset-0 bg-blue-400/5 pointer-events-none mix-blend-overlay"></div>}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#1A1B26] text-white overflow-hidden selection:bg-blue-500/30">
        {view === ViewMode.ONBOARDING && (
            <Onboarding onComplete={() => setView(ViewMode.HUD)} />
        )}

        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-purple-600/10 blur-[100px] rounded-full mix-blend-screen opacity-50"></div>
        </div>

        {/* SIDEBAR */}
        <aside className="w-72 bg-glass z-40 flex flex-col shadow-2xl backdrop-blur-xl border-r border-white/5">
            <div className="p-8 pb-10 flex flex-col items-center">
                {/* Logo Section */}
                <div className="w-full mb-6 px-2 flex justify-center items-center min-h-[60px]">
                     {!logoError ? (
                         <img 
                            src="/logo.png" 
                            alt="ClockBlock"
                            className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:scale-105 transition-transform duration-300"
                            onError={() => setLogoError(true)}
                         />
                     ) : (
                         <h1 className="font-display font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 italic tracking-tighter drop-shadow-sm">
                             CLOCK<br/>BLOCK
                         </h1>
                     )}
                </div>

                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold border-t border-white/5 pt-2 inline-block">
                    System v3.5
                </div>
            </div>
            <nav className="flex-1 flex flex-col gap-1">
                <NavItem mode={ViewMode.HUD} label="Dashboard" icon="🎮" />
                <NavItem mode={ViewMode.STORY} label="History" icon="📜" />
                <NavItem mode={ViewMode.PARENT} label="Operator" icon="⚙️" />
            </nav>
            <div className="p-8 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 opacity-60">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-xs font-mono tracking-widest">SERVER ONLINE</span>
                </div>
            </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 relative z-10 overflow-hidden flex flex-col bg-gradient-to-br from-[#1A1B26] to-[#0f1016]">
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                {view === ViewMode.HUD && (
                    <HUD 
                        appState={{
                            currentBudget, 
                            isPlaying, 
                            isOverdraft, 
                            weekendBank, 
                            totalDebt, 
                            dailyLogs: []
                        }} 
                        togglePlay={togglePlay}
                        setView={setView}
                        schedule={weeklySchedule}
                    />
                )}

                {view === ViewMode.PARENT && (
                    <div className="h-full flex flex-col justify-center">
                        <ParentDashboard 
                            setView={setView} 
                            adjustBudget={adjustBudget}
                            onSimulateDayEnd={handleSimulateDayEnd}
                            appState={{ currentBudget, totalDebt, weekendBank }}
                            schedule={weeklySchedule}
                            onUpdateSchedule={setWeeklySchedule}
                        />
                    </div>
                )}

                {view === ViewMode.STORY && (
                    <div className="h-full pt-16">
                        <WeeklyRecap currentSessionLog={getCurrentLog()} />
                    </div>
                )}
            </div>
        </main>
    </div>
  );
};

export default App;
