import React, { useState } from 'react';
import { generateWeeklyRecap } from '../services/geminiService';
import { DailyLog } from '../types';
import PixelButton from './ui/PixelButton';
import { MOCK_HISTORY } from '../constants';

interface WeeklyRecapProps {
  currentSessionLog?: DailyLog;
}

const WeeklyRecap: React.FC<WeeklyRecapProps> = ({ currentSessionLog }) => {
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const history = [...MOCK_HISTORY];
    if (currentSessionLog) {
        history.push(currentSessionLog);
    }
    const text = await generateWeeklyRecap(history);
    setStory(text);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      
      {!story ? (
        <div className="text-center p-12 bg-[#24283b] rounded-3xl border border-white/5 shadow-2xl">
            <div className="text-6xl mb-6">📜</div>
            <h3 className="font-display font-black text-3xl text-white mb-4">The Archives</h3>
            <p className="mb-8 text-xl text-white/60 max-w-md mx-auto">
                Summon the Librarian to chronicle your recent gameplay sessions into a legendary tale.
            </p>
            <div className="flex justify-center">
                <PixelButton 
                    label={loading ? "Scribing..." : "Generate Legend"} 
                    onClick={handleGenerate} 
                    disabled={loading}
                    variant="primary"
                    className="w-64"
                />
            </div>
        </div>
      ) : (
        <div className="animate-fade-in bg-[#f5e6c8] text-[#2c1810] rounded-xl p-1 shadow-2xl rotate-1 transform transition-transform hover:rotate-0">
            {/* Book binding look */}
            <div className="border-4 border-[#5d4037] rounded-lg p-8 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] min-h-[400px] flex flex-col">
                <h2 className="font-display font-black text-2xl text-[#5d4037] mb-6 text-center border-b-2 border-[#5d4037]/20 pb-4">Weekly Chronicle</h2>
                <div className="font-serif text-lg leading-relaxed flex-1 whitespace-pre-line">
                    {story}
                </div>
                <div className="mt-8 flex justify-center">
                    <button 
                        onClick={() => setStory(null)}
                        className="font-sans font-black text-[#5d4037] uppercase tracking-wider hover:bg-[#5d4037]/10 px-6 py-3 rounded-lg transition-colors"
                    >
                        Close Tome
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyRecap;