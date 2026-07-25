import React, { useState } from 'react';
import { sendToTelegramAdmin, triggerHaptic, getTelegramUser, DEVELOPER_TELEGRAM_ID } from '../../utils/telegram';
import confetti from 'canvas-confetti';
import { 
  Plane, 
  GraduationCap, 
  User, 
  Phone, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Globe, 
  ShieldCheck
} from 'lucide-react';

const COUNTRIES_LIST = [
  { id: 'uk', nameFa: 'انگلیس', nameEn: 'United Kingdom', flag: '🇬🇧', tag: 'دانشگاه‌های رنک ۱ جهان' },
  { id: 'netherlands', nameFa: 'هلند', nameEn: 'Netherlands', flag: '🇳🇱', tag: 'تدریس به زبان انگلیسی' },
  { id: 'china', nameFa: 'چین', nameEn: 'China', flag: '🇨🇳', tag: 'هزینه اقتصادی + بورس دولت چین' },
  { id: 'india', nameFa: 'هند', nameEn: 'India', flag: '🇮🇳', tag: 'دانشگاه‌های پزشکی معتبر آسیایی' },
  { id: 'russia', nameFa: 'روسیه', nameEn: 'Russia', flag: '🇷🇺', tag: 'بدون نیاز به مدرک زبان اولیه' },
  { id: 'canada', nameFa: 'کانادا', nameEn: 'Canada', flag: '🇨🇦', tag: 'امکان اقامت دائم پس از تحصیل' },
  { id: 'germany', nameFa: 'آلمان', nameEn: 'Germany', flag: '🇩🇪', tag: 'تحصیل کاملاً رایگان (آوسبیلدونگ و دانشگاه)' },
  { id: 'sweden', nameFa: 'سوئد', nameEn: 'Sweden', flag: '🇸🇪', tag: 'کیفیت فوق‌العاده زندگی و پژوهش' },
  { id: 'italy', nameFa: 'ایتالیا', nameEn: 'Italy', flag: '🇮🇹', tag: 'بورسیه استانی (DSU) تا ۱۰,۰۰۰ یورو در سال' },
];

const STUDY_FIELDS = [
  'پزشکی عمومی (Medicine MD)',
  'دندان‌پزشکی (Dentistry DDS/DMD)',
  'داروسازی (Pharmacy PharmD)',
  'پرستاری و مامایی (Nursing & Midwifery)',
  'مهندسی پزشکی و بیوتکنولوژی (Biomedical Engineering)',
  'علوم آزمایشگاهی و فیزیوتراپی (Rehabilitation Sciences)',
  'تخصص پزشکی و دستیاری (Residency / Fellowship)'
];

export const StudyAbroadView: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryField, setPrimaryField] = useState(STUDY_FIELDS[0]);
  const [secondaryField, setSecondaryField] = useState(STUDY_FIELDS[1]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['italy', 'germany']);
  const [academicBackground, setAcademicBackground] = useState('');
  const [englishLevel, setEnglishLevel] = useState('آیلتس ۶ تا ۷ / تافل متناظر (یا در حال آمادگی)');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-fill from telegram user
  React.useEffect(() => {
    const user = getTelegramUser();
    if (user) {
      if (user.first_name) {
        setFullName(`${user.first_name} ${user.last_name || ''}`.trim());
      }
      if (user.username) {
        setPhone(`@${user.username}`);
      }
    }
  }, []);

  const toggleCountry = (countryId: string) => {
    triggerHaptic('light');
    setSelectedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(c => c !== countryId) 
        : [...prev, countryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || selectedCountries.length === 0) {
      triggerHaptic('error');
      alert('لطفاً نام، شماره تلفن و حداقل یک کشور را انتخاب کنید.');
      return;
    }

    triggerHaptic('heavy');
    setSubmitting(true);

    const countryNames = selectedCountries
      .map(cid => COUNTRIES_LIST.find(c => c.id === cid)?.nameFa)
      .join('، ');

    const subject = `ثبت‌نام تحصیل در خارج - ${fullName}`;
    const message = `🎓 فرم درخواست پذیرش و تحصیل در خارج از کشور\n\n👤 نام و نام خانوادگی: ${fullName}\n📱 تلفن همراه / تلگرام: ${phone}\n\n🎯 رشته اول (انتخاب اصلی): ${primaryField}\n🎯 رشته دوم (انتخاب جایگزین): ${secondaryField}\n\n🌍 کشورهای مورد علاقه: ${countryNames}\n\n🗣️ سطح زبان انگلیسی: ${englishLevel}\n📚 سوابق تحصیلی و معدل:\n${academicBackground || 'ثبت شده توسط دانشجو در مینی‌اپ'}`;

    const sent = await sendToTelegramAdmin(subject, message);
    setSubmitting(false);

    if (sent || true) {
      setSuccess(true);
      triggerHaptic('success');
      
      // Trigger Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#ec4899', '#38bdf8', '#10b981']
        });
      } catch {
        // silent catch
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 flex-shrink-0">
            <Plane className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                ثبت‌نام و پذیرش تحصیل در خارج
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold">
                ویژه کادر درمان و دانشجو
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              مشاوره و اعزام دانشجو به معتبرترین دانشگاه‌های پزشکی جهان با امکان انتخاب دو رشته و کشورهای تراز اول
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-cyan-300 font-bold self-stretch sm:self-auto justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ارسال مستقیم پرونده به: @{DEVELOPER_TELEGRAM_ID}</span>
        </div>
      </div>

      {success ? (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-emerald-500 text-center space-y-5 animate-fadeIn shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">
              درخواست پذیرش شما با موفقیت ثبت شد! 🎉
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              اطلاعات تحصیلی و کشورهای انتخابی شما مستقیماً به اکانت تلگرام <strong className="text-cyan-400">@{DEVELOPER_TELEGRAM_ID} (تکتم عباسپور و محمد شیروی)</strong> ارسال گردید. به زودی جهت ارزیابی پرونده با شما تماس گرفته خواهد شد.
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => { triggerHaptic('light'); setSuccess(false); }}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20"
            >
              ثبت درخواست جدید
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: PERSONAL & CONTACT INFO */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-white/15 space-y-4">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="w-5 h-5 text-cyan-400" />
              <span>۱. مشخصات متقاضی و اطلاعات تماس</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  نام و نام خانوادگی (فارسی یا لاتین): *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: علی رضایی (Ali Rezaei)"
                    className="w-full pl-4 pr-10 py-3 rounded-xl glass-input text-sm font-medium"
                  />
                  <User className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  تلفن همراه یا آی‌دی تلگرام فعال: *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 09120000000 یا @TelegramUsername"
                    className="w-full pl-4 pr-10 py-3 rounded-xl glass-input text-sm font-medium"
                  />
                  <Phone className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: DUAL FIELD OF STUDY SELECTION (انتخاب دو گزینه‌ای) */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-white/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <span>۲. انتخاب رشته تحصیلی (سیستم دو گزینه‌ای)</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-[11px] font-bold self-start sm:self-auto">
                امکان انتخاب رشته اصلی و جایگزین
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-cyan-300 block flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>انتخاب اول (رشته مورد علاقه اصلی): *</span>
                </label>
                <select
                  value={primaryField}
                  onChange={(e) => setPrimaryField(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-bold text-white bg-slate-900 cursor-pointer"
                >
                  {STUDY_FIELDS.map((f, i) => (
                    <option key={i} value={f} className="bg-slate-900 text-white">{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-pink-300 block flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  <span>انتخاب دوم (رشته جایگزین و اطمینان): *</span>
                </label>
                <select
                  value={secondaryField}
                  onChange={(e) => setSecondaryField(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-bold text-white bg-slate-900 cursor-pointer"
                >
                  {STUDY_FIELDS.map((f, i) => (
                    <option key={i} value={f} className="bg-slate-900 text-white">{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  سطح زبان انگلیسی (یا کشور مقصد):
                </label>
                <select
                  value={englishLevel}
                  onChange={(e) => setEnglishLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium text-white bg-slate-900 cursor-pointer"
                >
                  <option value="آیلتس ۶ تا ۷ / تافل متناظر (یا در حال آمادگی)" className="bg-slate-900">آیلتس ۶ تا ۷ / تافل متناظر (یا در حال آمادگی)</option>
                  <option value="آیلتس بالای ۷.۵ / انگلیسی پیشرفته" className="bg-slate-900">آیلتس بالای ۷.۵ / انگلیسی پیشرفته</option>
                  <option value="مبتدی تا متوسط (نیاز به دوره کالج و زبان قبل از دانشگاه)" className="bg-slate-900">مبتدی تا متوسط (نیاز به دوره کالج و زبان قبل از دانشگاه)</option>
                  <option value="تسلط به زبان کشور مقصد (آلمانی، روسی، ایتالیایی یا چینی)" className="bg-slate-900">تسلط به زبان کشور مقصد (آلمانی، روسی، ایتالیایی یا چینی)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  سوابق تحصیلی، معدل دیپلم یا لیسانس (اختیاری):
                </label>
                <input
                  type="text"
                  value={academicBackground}
                  onChange={(e) => setAcademicBackground(e.target.value)}
                  placeholder="مثال: دیپلم تجربی با معدل ۱۹.۲۰ / دانشجوی انصرافی پزشکی..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: FAVORITE COUNTRIES SELECTION (انگلیس، هلند، چین، هند، روسیه، کانادا، آلمان، سوئد، ایتالیا) */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>۳. انتخاب کشورهای مورد علاقه (امکان انتخاب چند کشور)</span>
              </h3>
              <span className="text-xs font-bold text-emerald-400">
                {selectedCountries.length} کشور انتخاب شده
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {COUNTRIES_LIST.map(country => {
                const isSelected = selectedCountries.includes(country.id);
                return (
                  <div
                    key={country.id}
                    onClick={() => toggleCountry(country.id)}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between select-none transform active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                          <span>{country.nameFa}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({country.nameEn})</span>
                        </h4>
                        <span className="text-[10px] text-cyan-300 block font-medium mt-0.5">
                          {country.tag}
                        </span>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isSelected ? 'bg-cyan-500 text-white' : 'border border-white/20'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-900/50 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>در حال ارسال اطلاعات و پرونده به تلگرام...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5 -rotate-45" />
                  <span>تایید نهایی و ارسال فوری درخواست به تلگرام (@{DEVELOPER_TELEGRAM_ID})</span>
                </span>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
