import React, { useState } from 'react';
import { ActiveView } from '../types';
import { triggerHaptic } from '../utils/telegram';
import { 
  BookOpen, 
  Briefcase, 
  Plane, 
  ShoppingBag, 
  HeadphonesIcon, 
  Sparkles, 
  ArrowLeft, 
  Stethoscope, 
  Video, 
  GraduationCap, 
  TrendingDown,
  ChevronLeft,
  Calculator,
  FileText,
  Users
} from 'lucide-react';

interface HomeMenuProps {
  onSelectMenu: (view: ActiveView) => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({ onSelectMenu }) => {
  const [transitioningView, setTransitioningView] = useState<ActiveView | null>(null);

  const handleMenuClick = (view: ActiveView) => {
    triggerHaptic('medium');
    setTransitioningView(view);
    
    // Smooth fade-out animation delay before actual navigation
    setTimeout(() => {
      onSelectMenu(view);
    }, 320);
  };

  return (
    <div className={`w-full max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4 transition-all duration-300 ${
      transitioningView ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'
    }`}>
      
      {/* Welcome Banner */}
      <div className="text-center mb-6 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>هوش مصنوعی جامع پزشکی و دستیار دانشجویی تلگرام</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          مینی اپ <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">همیار دانشجو</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          مرجع کامل اطلاعات دارویی و درمانی دو زبانه، کتابخانه آموزشی، کاریابی دانشجویی و واردات مستقیم وسایل با ۴۰٪ تا ۷۰٪ تخفیف
        </p>
      </div>

      {/* OPTION 1: BIGGEST & CENTERED - DRUG & TREATMENT SEARCH */}
      <div 
        onClick={() => handleMenuClick('drug-search')}
        className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card p-5 sm:p-7 border-2 border-purple-500/40 hover:border-pink-500/80 shadow-2xl shadow-purple-900/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
      >
        {/* Glow effect */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-purple-600/40 to-pink-600/40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-gradient-to-tr from-indigo-600/40 to-fuchsia-600/40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center text-center sm:text-right gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 p-0.5 shadow-xl shadow-purple-500/30 flex-shrink-0 flex items-center justify-center group-hover:rotate-6 transition-transform">
            <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex flex-col items-center justify-center gap-1">
              <Stethoscope className="w-9 h-9 sm:w-11 sm:h-11 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black tracking-wider text-purple-300 font-mono">AI ENGINE</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[11px] font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                مرجع جامع دارویاب و کتاب‌های بالینی
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold">
                دو زبانه FA/EN
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-pink-300 transition-colors">
              جستجو دارو و درمان (هوش مصنوعی پزشکی)
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              جستجوی هوشمند نام دارو (ژنریک و برند)، تداخلات و عوارض، دوز و دوسیج، اشکال دارویی، مکانیسم اثر و <strong className="text-pink-300">پروتکل‌های درمانی</strong> (سرماخوردگی، میگرن، ورم معده و...). شامل داروهای شیمیایی و گیاهی.
            </p>
          </div>

          <div className="flex-shrink-0 self-center sm:self-auto">
            <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-pink-500 text-white flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-110">
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* NEW ROW: MEDICAL CALCULATORS & ARTICLE WRITING IN ONE ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* MENU: MEDICAL CALCULATORS (اندازه‌گیری) */}
        <div 
          onClick={() => handleMenuClick('calculators')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card p-5 border border-white/15 hover:border-cyan-500/60 shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-600/30 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                eGFR & BMI & Scores
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                ابزارها و اندازه‌گیری (Calculators)
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                محاسبه آنی شاخص توده بدنی (BMI)، کلیرانس کراتینین، eGFR، ریسک قلب و عروق (CHA₂DS₂-VASc) و اورژانس (CURB-65).
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-blue-300">
            <span className="flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              <span>ورود به ابزارهای اندازه‌گیری</span>
            </span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* MENU: ARTICLE WRITING (نوشتن مقاله) */}
        <div 
          onClick={() => handleMenuClick('article-writing')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card p-5 border border-white/15 hover:border-pink-500/60 shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-pink-600/30 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold">
                Scopus & PubMed & ISI
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-white group-hover:text-pink-300 transition-colors">
                نوشتن و چاپ مقاله (Article Writing)
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                مشاوره و نگارش تضمینی مقالات علمی و پایان‌نامه؛ انتخاب چندگزینه‌ای بین پایگاه‌های Scopus، PubMed و Web of Science *ISI.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-pink-400 group-hover:text-purple-300">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>ثبت درخواست نگارش مقاله</span>
            </span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* ROW 2: TWO MENUS SIDE-BY-SIDE IN GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* MENU 2-A: EDUCATIONAL VIDEOS & BOOKS */}
        <div 
          onClick={() => handleMenuClick('education')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card p-5 border border-white/15 hover:border-purple-500/60 shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/30 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                Osmosis & YouTube
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-white group-hover:text-purple-300 transition-colors">
                فیلم و کتاب آموزشی پزشکی
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                انیمیشن‌های مفهومی Osmosis، لکچرهای یوتیوب، هندبوک Medscape و دانلود رایگان کتاب‌های PDF علوم پایه و بالینی.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-pink-300">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>مشاهده کتابخانه و ویدیوها</span>
            </span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* MENU 2-B: STUDENT JOBS & FREELANCING */}
        <div 
          onClick={() => handleMenuClick('jobs')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card p-5 border border-white/15 hover:border-emerald-500/60 shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-600/30 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                جاب ویژن & پروژه‌ای
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                کار دانشجویی و استخدام
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                فرصت‌های کار ریموت و حضوری از وبسایت‌های جاب ویژن، ترجمه پزشکی، دستیار پژوهشی، تدریس و ورود داده‌ها.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-teal-300">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>مشاهده موقعیت‌های کاری</span>
            </span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* ROW 3: STUDY ABROAD & STUDENT SHOPPING */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* MENU 3: STUDY ABROAD REGISTRATION */}
        <div 
          onClick={() => handleMenuClick('study-abroad')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card p-5 border border-white/15 hover:border-cyan-500/60 shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-600/25 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Plane className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                ارسال به تلگرام
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                ثبت‌نام تحصیل در خارج
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                پزشکی، دندانپزشکی و داروسازی؛ انتخاب بین انگلیس، هلند، چین، هند، روسیه، کانادا، آلمان، سوئد و ایتالیا با انتخاب دو گزینه‌ای.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-blue-300">
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>تکمیل فرم ثبت‌نام و پذیرش</span>
            </span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* MENU 4: STUDENT SHOPPING (DIRECT IMPORT) */}
        <div 
          onClick={() => handleMenuClick('shop')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card p-5 border border-white/15 hover:border-fuchsia-500/60 shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-600/25 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/30 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-extrabold flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                ۴۰٪ تا ۷۰٪ زیر قیمت ایران
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-white group-hover:text-fuchsia-300 transition-colors">
                خرید وسایل دانشجویی (واردات چین)
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                واردات مستقیم با ارسال ۱۰ تا ۲۰ روز کاری. امکان ثبت لینک از <strong className="text-pink-300">آمازون، علی‌بابا و علی‌اکسپرس</strong> یا توضیحات کالا.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-fuchsia-400 group-hover:text-pink-300">
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>ورود به فروشگاه و سفارش</span>
            </span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* ROW 4 / FULL WIDTH: SUPPORT & CONSULTATION */}
      <div 
        onClick={() => handleMenuClick('support')}
        className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card p-4 sm:p-5 border border-white/15 hover:border-pink-500/50 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
            <HeadphonesIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-white group-hover:text-pink-300 transition-colors">
                پشتیبانی
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                آنلاین ۲۴/۷
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              ارسال مستقیم سوالات، پیشنهادات و پیگیری سفارشات — پشتیبانی: <span className="font-mono text-purple-300 font-bold">@Shiravi4333</span>
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex w-10 h-10 rounded-full bg-white/5 group-hover:bg-pink-500/20 text-purple-400 group-hover:text-pink-300 items-center justify-center transition-all">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* ROW 5 / FULL WIDTH: DAILY FEED (videos / tips / ads refreshed every 24h) */}
      <div
        onClick={() => handleMenuClick('daily-feed')}
        className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card p-4 sm:p-5 border border-purple-500/30 hover:border-pink-500/60 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-between"
      >
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-white group-hover:text-pink-300 transition-colors">
                فید روزانه: ویدیو، نکات و تبلیغات
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                هر ۲۴ ساعت
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              ویدیوهای آموزشی، نکات کاربردی دانشجویی و تبلیغات ویژه — به‌روزرسانی روزانه و حذف موارد قدیمی.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex w-10 h-10 rounded-full bg-white/5 group-hover:bg-pink-500/20 text-purple-400 group-hover:text-pink-300 items-center justify-center transition-all">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* ROW 6 / FULL WIDTH: ABOUT US */}
      <div
        onClick={() => handleMenuClick('about')}
        className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card p-4 sm:p-5 border border-white/15 hover:border-indigo-500/50 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors">
              درباره ما
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              تهیه کننده و ایده پردازان، بخش بین‌الملل و حقوقی، و همکاران علمی بین‌المللی
            </p>
          </div>
        </div>

        <div className="hidden sm:flex w-10 h-10 rounded-full bg-white/5 group-hover:bg-indigo-500/20 text-purple-400 group-hover:text-indigo-300 items-center justify-center transition-all">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </div>
      </div>

    </div>
  );
};
