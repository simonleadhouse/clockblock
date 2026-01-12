import React, { useState, useEffect } from 'react';
import { generateVillagerNudge } from '../services/geminiService';

interface VillagerNudgeProps {
  remainingMinutes: number;
  isOverdraft: boolean;
  isPlaying: boolean;
}

const VillagerNudge: React.FC<VillagerNudgeProps> = ({ remainingMinutes, isOverdraft, isPlaying }) => {
  const [message, setMessage] = useState<string>("Hrmm. Watching the clock.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const shouldUpdate = 
      isPlaying && (
        remainingMinutes % 10 === 0 || 
        remainingMinutes === 5 || 
        remainingMinutes === 1 || 
        remainingMinutes === 0 || 
        remainingMinutes === -1 
      );

    if (shouldUpdate) {
        setLoading(true);
        generateVillagerNudge(remainingMinutes, isOverdraft, isPlaying)
            .then(msg => setMessage(msg))
            .catch(() => setMessage("Hrmm."))
            .finally(() => setLoading(false));
    }
  }, [remainingMinutes, isOverdraft, isPlaying]);

  return (
    <div className="flex items-end gap-3 max-w-3xl mx-auto mt-8 animate-fade-in-up">
      {/* Villager Avatar - Rounded Square with heavy border */}
      <div className="w-16 h-16 rounded-xl bg-[#b67446] border-4 border-black/20 shadow-lg relative flex-shrink-0 overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10"></div>
         {/* Simple face rep */}
         <div className="w-4 h-8 bg-[#8f563b] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3 rounded-sm shadow-sm"></div>
         <div className="flex gap-4 absolute top-4 left-1/2 -translate-x-1/2">
             <div className="w-3 h-2 bg-white rounded-sm"><div className="w-1.5 h-1.5 bg-emerald-600 ml-1"></div></div>
             <div className="w-3 h-2 bg-white rounded-sm"><div className="w-1.5 h-1.5 bg-emerald-600"></div></div>
         </div>
      </div>

      {/* Chat Bubble - Minecraft Chat Style */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl p-4 shadow-xl">
        <h4 className="text-yellow-400 font-display text-sm tracking-wider mb-1 flex items-center gap-2">
            Generic Villager <span className="text-xs text-white/40 font-body font-normal bg-white/10 px-1.5 rounded">NPC</span>
        </h4>
        <div className="text-white font-body text-lg leading-snug">
            {loading ? <span className="animate-pulse opacity-50">Thinking...</span> : `"${message}"`}
        </div>
      </div>
    </div>
  );
};

export default VillagerNudge;