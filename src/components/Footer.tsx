import React from 'react';
import { triggerHaptic } from '../utils/telegram';
import { ActiveView } from '../types';
import { Heart, Home, HelpCircle, Users } from 'lucide-react';

interface FooterProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ currentView, onNavigate }) => {
  const handleSupportClick = () => {
    triggerHaptic('medium');
    onNavigate('support');
  };

  const handleHomeClick = () => {
    triggerHaptic('light');
    onNavigate('home');
  };

  const handleAboutClick = () => {
    triggerHaptic('medium');
    onNavigate('about');
  };

  return (
    <footer className="relative z-30 mt-auto pt-8 pb-6 px-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center gap-4">
        
        {/* Quick Navigation Pills */}
        <div className="flex items-center gap-2">
          {currentView !== 'home' && (
            <button
              onClick={handleHomeClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-bold transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>بازگشت به منوی اصلی</span>
            </button>
          )}
          <button
            onClick={handleSupportClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/40 text-xs font-bold transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>پشتیبانی</span>
          </button>
          <button
            onClick={handleAboutClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-bold transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>درباره ما</span>
          </button>
        </div>

        {/* About Us entry (opens the dedicated page) */}
        <button
          onClick={handleAboutClick}
          className="group flex flex-col sm:flex-row items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-indigo-900/30 border border-white/15 hover:border-purple-500/50 shadow-lg transition-all active:scale-95"
        >
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>تیم تهیه‌کننده، ایده‌پردازان و همکاران علمی:</span>
          </span>
          <span className="font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-sm group-hover:from-pink-400 group-hover:to-purple-400 transition-all">
            درباره ما
          </span>
        </button>

        {/* DONATE / SUPPORT BANNER (حمایت مالی و معنوی از پروژه) */}
        <div className="w-full max-w-md mx-auto">
          <a
            href="https://reymit.ir/shiravi"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic('medium')}
            className="group relative flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600/30 via-pink-600/30 to-purple-600/30 hover:from-rose-600/50 hover:via-pink-600/50 hover:to-purple-600/50 border-2 border-pink-500/60 hover:border-pink-400 shadow-xl shadow-pink-900/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md animate-bounce" style={{ animationDuration: '2.5s' }}>
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div className="text-left rtl:text-right">
              <span className="text-xs sm:text-sm font-black text-white group-hover:text-pink-200 transition-colors block">
                با حمایت مالی، به تداوم پروژه کمک کنید ❤️
              </span>
              <span className="text-[10px] text-pink-300 font-mono block">
                reymit.ir/shiravi - Support the Student Community
              </span>
            </div>
          </a>
        </div>

        {/* System & Security Info */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            مینی‌اپ تلگرام متصل به ربات هوشمند (TMAv3)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span>طراحی با عشق برای دانشجویان</span>
            <Heart className="w-3 h-3 text-pink-500 fill-pink-500 inline" />
          </span>
        </div>

        <p className="text-[10px] text-slate-500 font-mono">
          © {new Date().getFullYear()} Hamyar Daneshjoo Mini App. All rights reserved. Powered by AI Medical Engine.
        </p>
      </div>
    </footer>
  );
};
