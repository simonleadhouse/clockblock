import React from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'secondary' | 'glass';
  label: string;
  icon?: string;
}

const PixelButton: React.FC<PixelButtonProps> = ({ variant = 'primary', label, icon, className = '', ...props }) => {
  // Chunky, 3D, Rounded styles
  // REFACTOR: Switched from font-display (Impact) to font-sans font-extrabold for legibility.
  // Reduced tracking from widest to wide.
  const baseStyles = `
    relative overflow-hidden group
    min-h-[64px] px-6 py-4 rounded-2xl
    font-sans font-extrabold text-lg tracking-wide uppercase
    transition-all duration-100 ease-out
    active:translate-y-1 active:shadow-none
    flex items-center justify-center gap-3
  `;
  
  const variants = {
    primary: "bg-blue-500 text-white shadow-[0_6px_0_#1e40af] hover:bg-blue-400 hover:shadow-[0_6px_0_#1e40af]",
    // UPDATED: Used #3C8527 (Minecraft Grass Green) for better white-text contrast and theme fit
    success: "bg-[#3C8527] text-white shadow-[0_6px_0_#1E4615] hover:bg-[#4CA032] hover:shadow-[0_6px_0_#1E4615]",
    danger: "bg-red-500 text-white shadow-[0_6px_0_#b91c1c] hover:bg-red-400 hover:shadow-[0_6px_0_#b91c1c]",
    secondary: "bg-slate-600 text-white shadow-[0_6px_0_#334155] hover:bg-slate-500 hover:shadow-[0_6px_0_#334155]",
    glass: "bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 shadow-none active:translate-y-0",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="text-xl">{icon}</span>}
      {/* Removed text-shadow to prevent muddiness */}
      <span className="relative z-10">{label}</span>
      
      {/* Shine effect for glossy feel */}
      {variant !== 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none" />
      )}
    </button>
  );
};

export default PixelButton;