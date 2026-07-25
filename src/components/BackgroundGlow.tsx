import React from 'react';

export const BackgroundGlow: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-slate-950">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#070712] via-[#0d0a1a] to-[#0a0512] opacity-90" />

      {/* Animated RGB Glowing Blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-[110px] animate-blob-1 animate-rgb-glow" />
      <div className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] bg-pink-600/25 rounded-full blur-[120px] animate-blob-2 animate-rgb-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] bg-indigo-600/25 rounded-full blur-[130px] animate-blob-3 animate-rgb-glow" style={{ animationDelay: '4s' }} />
      <div className="absolute top-2/3 right-1/3 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-[100px] animate-blob-1" style={{ animationDelay: '6s' }} />

      {/* Subtle Grid Overlay for modern high-tech clinical feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Faded Medical Snake Logo (Rod of Asclepius) in background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] select-none transform scale-150 sm:scale-125">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          className="w-[38rem] h-[38rem] text-purple-400 blur-[1px]"
        >
          {/* Rod */}
          <line x1="12" y1="2" x2="12" y2="22" strokeLinecap="round" strokeWidth="1" />
          {/* Snake coiling around the rod */}
          <path 
            d="M8.5 6.5C8.5 4 15.5 4 15.5 6.5C15.5 9 8.5 9 8.5 11.5C8.5 14 15.5 14 15.5 16.5C15.5 19 9.5 19 9.5 21" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            strokeWidth="0.8"
          />
          {/* Snake Head & Eye */}
          <path d="M15.5 6.5L16.8 5.2C17.2 4.8 17.2 4.2 16.8 3.8L16 3" strokeLinecap="round" />
          <circle cx="16" cy="4.5" r="0.4" fill="currentColor" />
          {/* Top Emblem Wings / Bowl rays */}
          <path d="M6 5C8.5 5 10.5 3 12 2C13.5 3 15.5 5 18 5" strokeLinecap="round" strokeWidth="0.6" />
        </svg>
      </div>
    </div>
  );
};
