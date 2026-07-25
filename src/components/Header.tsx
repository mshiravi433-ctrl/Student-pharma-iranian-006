import React, { useState, useEffect } from 'react';
import { getTelegramUser, triggerHaptic } from '../utils/telegram';
import { TelegramUser } from '../types';
import { Sparkles, ShieldCheck, Stethoscope } from 'lucide-react';

export const Header: React.FC = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const tgUser = getTelegramUser();
    setUser(tgUser);

    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUserClick = () => {
    triggerHaptic('light');
  };

  return (
    <header className="sticky top-0 z-40 w-full px-3 py-2 sm:px-6 sm:py-3 glass-panel border-b border-white/10 shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo & App Title */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 p-[1.5px] shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-slate-950/90 backdrop-blur-sm rounded-[10px] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-pink-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-purple-300 via-pink-300 to-white bg-clip-text text-transparent">
                همیار دانشجو
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span>دستیار هوشمند پزشکی و دانشگاهی</span>
              <span className="w-1 h-1 rounded-full bg-pink-500" />
              <span className="text-pink-300 font-bold">{time}</span>
            </p>
          </div>
        </div>

        {/* Telegram User Badge / Status */}
        <div 
          onClick={handleUserClick}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer select-none"
        >
          <div className="text-left hidden xs:block sm:block">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-xs font-bold text-slate-200">
                {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'دانشجوی پزشکی'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-[10px] text-purple-300 font-mono text-left">
              {user?.username ? `@${user.username}` : 'تلگرام فعال'}
            </div>
          </div>
          <div className="relative">
            {user?.photo_url ? (
              <img 
                src={user.photo_url} 
                alt={user.first_name} 
                className="w-8 h-8 rounded-lg object-cover border border-purple-500/50"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user ? user.first_name.charAt(0) : 'د'}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-ping" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>
        </div>
      </div>
    </header>
  );
};
