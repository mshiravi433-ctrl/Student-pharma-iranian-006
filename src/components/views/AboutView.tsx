import React from 'react';
import { triggerHaptic } from '../../utils/telegram';
import { Users, Mail, Send, Scale, Globe2, GraduationCap, Heart, Sparkles } from 'lucide-react';

interface TeamMember {
  role: string;
  name: string;
  telegram?: string;
  email?: string;
  accent: string;
  icon: React.ReactNode;
}

const TEAM: TeamMember[] = [
  {
    role: 'تهیه کننده و ایده پرداز',
    name: 'دکتر تکتم عباسپور',
    email: 'Toktam433@gmail.com',
    accent: 'from-pink-500 to-rose-500',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    role: 'تهیه کننده و ایده پرداز',
    name: 'دکتر محمد شیروی',
    telegram: 'Shiravi4333',
    accent: 'from-purple-500 to-indigo-500',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    role: 'رییس بخش بین‌الملل',
    name: 'دکتر مهرشاد شیروی',
    telegram: 'mehrshad7913',
    accent: 'from-cyan-500 to-blue-500',
    icon: <Globe2 className="w-5 h-5" />,
  },
  {
    role: 'رییس بخش حقوقی',
    name: 'جناب آقای عرفان حاج شریفی',
    telegram: 'erfanhajsharifi',
    accent: 'from-amber-500 to-orange-500',
    icon: <Scale className="w-5 h-5" />,
  },
];

const PARTNERS = [
  'Dr M.G.R University of Chennai',
  'JKKNattraja College of Pharmacy (India)',
  'RVS College of Pharmacy (India)',
];

export const AboutView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-6">

      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-purple-500/30 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 p-[1.5px] shadow-lg shadow-purple-500/30 flex-shrink-0">
          <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
            <Users className="w-7 h-7 text-pink-400" />
          </div>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">درباره ما</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            تیم تهیه‌کننده، ایده‌پردازان و همکاران علمی مینی اپ همیار دانشجو
          </p>
        </div>
      </div>

      {/* Team */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-purple-300 flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>تهیه کننده و ایده پردازان</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEAM.map((m, i) => (
            <div
              key={i}
              className="glass-panel rounded-3xl p-4 border border-white/10 hover:border-purple-500/40 transition-all space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${m.accent} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                  {m.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block">{m.role}</span>
                  <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">{m.name}</h4>
                </div>
              </div>

              {m.telegram && (
                <a
                  href={`https://t.me/${m.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('light')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-bold transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 -rotate-45" />
                  <span className="font-mono" dir="ltr">@{m.telegram}</span>
                </a>
              )}

              {m.email && (
                <a
                  href={`mailto:${m.email}`}
                  onClick={() => triggerHaptic('light')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/30 border border-pink-500/40 text-pink-200 hover:text-white text-xs font-bold transition-all active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="font-mono" dir="ltr">{m.email}</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Academic partners */}
      <div className="glass-panel rounded-3xl p-5 border border-cyan-500/30 space-y-3">
        <h3 className="text-sm font-extrabold text-cyan-300 flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          <span>با همکاری و مشارکت</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PARTNERS.map((p, i) => (
            <div
              key={i}
              className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/25 text-xs font-bold text-slate-200 text-center leading-relaxed"
              dir="ltr"
            >
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* Support the project */}
      <a
        href="https://reymit.ir/shiravi"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => triggerHaptic('medium')}
        className="group flex items-center justify-center gap-3 px-6 py-4 rounded-3xl bg-gradient-to-r from-rose-600/30 via-pink-600/30 to-purple-600/30 hover:from-rose-600/50 hover:via-pink-600/50 hover:to-purple-600/50 border-2 border-pink-500/60 hover:border-pink-400 shadow-xl shadow-pink-900/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
      >
        <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
          <Heart className="w-4 h-4 fill-white" />
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-white group-hover:text-pink-200 transition-colors block">
            با حمایت مالی، به تداوم پروژه کمک کنید
          </span>
          <span className="text-[10px] text-pink-300 font-mono block" dir="ltr">
            reymit.ir/shiravi
          </span>
        </div>
      </a>

    </div>
  );
};
