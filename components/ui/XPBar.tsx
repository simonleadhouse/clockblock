import React from 'react';

interface XPBarProps {
  current: number;
  max: number;
  isOverdraft: boolean;
}

const XPBar: React.FC<XPBarProps> = ({ current, max, isOverdraft }) => {
  const percentage = isOverdraft ? 100 : Math.min(100, Math.max(0, (current / max) * 100));
  
  return (
    <div className="w-full relative group">
      <div className="flex justify-between mb-2 px-2">
        <span className={`font-display font-black tracking-wider text-xl ${isOverdraft ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
            {isOverdraft ? 'CRITICAL OVERDRAFT' : 'ENERGY'}
        </span>
        <span className="font-display font-bold text-xl text-white/80">
            {isOverdraft ? `-${Math.abs(current)} min` : `${current} min`} / {max} min
        </span>
      </div>
      
      {/* Bar Container - Rounded & Deep inset */}
      <div className="h-10 w-full bg-black/60 rounded-full border border-white/10 p-1.5 shadow-inner relative overflow-hidden">
        
        {/* Fill */}
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden
            ${isOverdraft 
                ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]' 
                : 'bg-gradient-to-r from-green-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            }`}
          style={{ width: `${percentage}%` }}
        >
            {/* Glossy Reflection */}
            <div className="absolute top-0 left-0 w-full h-[40%] bg-white/40 rounded-t-full"></div>
            
            {/* Striped Animation overlay */}
            <div className="absolute inset-0 opacity-10" 
                 style={{backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}>
            </div>
        </div>
      </div>
      
      {isOverdraft && (
        <div className="mt-3 text-center text-sm text-red-400 font-bold bg-red-900/30 rounded-lg p-2 border border-red-500/30 animate-pulse">
            ⚠️ COST PENALTY: -{Math.abs(current) * 2} min tomorrow
        </div>
      )}
    </div>
  );
};

export default XPBar;
