import React, { useState } from 'react';
import PixelButton from './ui/PixelButton';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: "🏁",
      title: "The Referee",
      color: "text-white",
      desc: "ClockBlock watches the game. If you turn off the Referee (the app), you get a Red Card.",
      sub: "Manual Penalty applied by Parent."
    },
    {
      icon: "🐷",
      title: "The Bank",
      color: "text-blue-400",
      desc: "Unused minutes don't vanish! They roll over to your Weekend Bank.",
      sub: "Save up for a marathon session on Saturday."
    },
    {
      icon: "💳",
      title: "The Credit Card",
      color: "text-red-400",
      desc: "You can keep playing when time runs out, but it costs DOUBLE for tomorrow.",
      sub: "Example: 10 mins over = -20 mins tomorrow."
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1B26] flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-2xl w-full bg-[#24283b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-2 bg-black/50 w-full">
           <div 
             className="h-full bg-blue-500 transition-all duration-300"
             style={{ width: `${((step + 1) / steps.length) * 100}%` }}
           ></div>
        </div>

        <div className="p-12 flex flex-col items-center text-center">
            <div className={`text-8xl mb-8 drop-shadow-2xl animate-bounce-slight ${currentStep.color}`}>
                {currentStep.icon}
            </div>
            
            <h2 className="font-display text-4xl text-white mb-4 tracking-tight uppercase">
                {currentStep.title}
            </h2>
            
            <p className="font-body text-xl text-white/80 leading-relaxed mb-4 max-w-lg">
                {currentStep.desc}
            </p>

            <div className="bg-black/30 px-6 py-3 rounded-xl border border-white/5 mb-10">
                <p className="font-display text-sm text-yellow-400 uppercase tracking-widest">
                    ⚠️ Rule: {currentStep.sub}
                </p>
            </div>

            <PixelButton 
                label={step === steps.length - 1 ? "I Understand" : "Next Rule"} 
                onClick={handleNext}
                variant="primary"
                className="w-64"
                icon={step === steps.length - 1 ? "👍" : "👉"}
            />
        </div>

        <div className="bg-black/20 p-4 text-center">
            <p className="text-white/30 text-xs font-mono">TUTORIAL SEQUENCE {step + 1} / {steps.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;