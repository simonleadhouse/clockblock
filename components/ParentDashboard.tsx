import React, { useState, useEffect } from 'react';
import { ViewMode, WeeklySchedule } from '../types';
import PixelButton from './ui/PixelButton';
import Scheduler from './Scheduler';

interface ParentDashboardProps {
  setView: (v: ViewMode) => void;
  adjustBudget: (amount: number) => void;
  onSimulateDayEnd: () => void;
  appState: any;
  schedule: WeeklySchedule;
  onUpdateSchedule: (s: WeeklySchedule) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ 
    setView, adjustBudget, onSimulateDayEnd, appState, schedule, onUpdateSchedule 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');

  // Check for existing password on mount
  useEffect(() => {
    const saved = localStorage.getItem('cb_admin_pin');
    if (saved) {
        setHasPassword(true);
    }
  }, []);

  const handleLogin = () => {
    const saved = localStorage.getItem('cb_admin_pin');
    if (inputPassword === saved) {
        setIsAuthenticated(true);
        setError('');
    } else {
        setError('ACCESS DENIED');
        setInputPassword('');
    }
  };

  const handleSetup = () => {
    if (inputPassword.length < 4) {
        setError('PIN must be 4+ chars');
        return;
    }
    localStorage.setItem('cb_admin_pin', inputPassword);
    setHasPassword(true);
    setIsAuthenticated(true);
  };

  // Lock Screen
  if (!isAuthenticated) {
    return (
        <div className="w-full h-full flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-[#24283b] p-8 rounded-3xl border border-white/10 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600"></div>
                 
                 <div className="text-6xl mb-6">⚙️</div>
                 <h2 className="font-display font-black text-3xl text-white mb-2">
                    {hasPassword ? 'OPERATOR LOGIN' : 'SET OP PASSWORD'}
                 </h2>
                 <p className="text-white/50 mb-8 font-medium">
                    {hasPassword ? 'Restricted Area. Enter credential.' : 'Create a password to protect server settings.'}
                 </p>
                 
                 <input 
                    type="password" 
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/10 rounded-xl p-4 text-center text-2xl text-white font-bold tracking-widest focus:border-blue-500 focus:outline-none mb-4 placeholder-white/10"
                    placeholder="****"
                    onKeyDown={(e) => e.key === 'Enter' && (hasPassword ? handleLogin() : handleSetup())}
                    autoFocus
                 />
                 
                 {error && <div className="text-red-400 font-bold mb-4 animate-pulse bg-red-900/20 py-2 rounded">{error}</div>}

                 <div className="flex gap-4">
                    <button 
                        onClick={() => setView(ViewMode.HUD)}
                        className="flex-1 py-4 rounded-xl font-bold text-white/40 hover:bg-white/5 transition-colors uppercase tracking-wide"
                    >
                        Cancel
                    </button>
                    <PixelButton 
                        label={hasPassword ? "UNLOCK" : "SAVE PIN"} 
                        onClick={hasPassword ? handleLogin : handleSetup}
                        className="flex-1"
                        variant="primary"
                    />
                 </div>
            </div>
        </div>
    );
  }

  // Dashboard
  return (
    <div className="w-full max-w-6xl mx-auto p-6 lg:p-12 animate-fade-in h-full overflow-y-auto">
      <div className="bg-[#24283b] rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
        {/* Decorative header bg */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600"></div>

        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="font-display font-black text-4xl md:text-5xl text-white text-shadow tracking-tight mb-2">OPERATOR CONTROL</h2>
                <p className="text-white/50 text-lg leading-relaxed">Server Properties & Administration</p>
            </div>
            <button 
                onClick={() => setView(ViewMode.HUD)} 
                className="text-white/40 hover:text-white font-sans font-black uppercase tracking-wider text-sm px-4 py-2 hover:bg-white/5 rounded transition-colors"
            >
                Disconnect &times;
            </button>
        </div>

        {/* Layout: Vertical Stack */}
        <div className="flex flex-col gap-8">
            
            {/* Top Row: Action Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Intervention */}
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5 shadow-inner">
                    <h3 className="font-display font-bold text-xl text-red-400 mb-6 uppercase tracking-widest border-b border-white/5 pb-2">
                        /effect give
                    </h3>
                    <div className="flex flex-col gap-4">
                        <PixelButton 
                            label="Grant Bonus (+15 min)" 
                            onClick={() => adjustBudget(15)} 
                            variant="success" 
                            icon="+"
                            className="w-full"
                        />
                        <PixelButton 
                            label="Apply Penalty (-15 min)" 
                            onClick={() => adjustBudget(-15)} 
                            variant="danger" 
                            icon="-"
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Simulation */}
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5 shadow-inner">
                     <h3 className="font-display font-bold text-xl text-blue-400 mb-6 uppercase tracking-widest border-b border-white/5 pb-2">
                        /time set night
                     </h3>
                     <div className="space-y-4 mb-4">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-white/60 font-medium">Active Budget</span>
                            <span className="font-display font-black text-2xl text-white tracking-tight">{appState.currentBudget} min</span>
                        </div>
                     </div>
                     <PixelButton 
                        label="Force Day End (4:00 AM)" 
                        onClick={onSimulateDayEnd} 
                        variant="secondary" 
                        icon="🌙"
                        className="w-full"
                     />
                </div>
            </div>

            {/* Bottom Row: Scheduler (Full Width) */}
            <div className="w-full">
                <Scheduler schedule={schedule} onUpdate={onUpdateSchedule} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
