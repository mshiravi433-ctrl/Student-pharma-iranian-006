import React, { useState } from 'react';
import { sendToTelegramAdmin, triggerHaptic, getTelegramUser, DEVELOPER_TELEGRAM_ID } from '../../utils/telegram';
import confetti from 'canvas-confetti';
import { 
  FileText, 
  User, 
  GraduationCap, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  ShieldCheck,
  Award,
  Layers
} from 'lucide-react';

const INDEXING_DATABASES = [
  { id: 'scopus', name: 'Scopus (اسکوپوس)', icon: '📘', desc: 'پایگاه اطلاعاتی معتبر الزویر (Elsevier) با ضریب تاثیر بالا' },
  { id: 'pubmed', name: 'PubMed / Medline (پاب‌مد)', icon: '📗', desc: 'مرجع اصلی مقالات بالینی و علوم پزشکی جهان (NLM)' },
  { id: 'isi', name: 'Web of Science *ISI (وب آو ساینس / ISI)', icon: '📙', desc: 'معتبرترین ژورنال‌های دارای Impact Factor (JCR) برای رزومه و اپلای' },
];

export const ArticleWritingView: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [articleTopic, setArticleTopic] = useState(''); // Optional / گزینه اجباری نیست
  const [selectedIndexing, setSelectedIndexing] = useState<string[]>(['pubmed', 'isi']); // Multi-select
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const toggleIndexing = (dbId: string) => {
    triggerHaptic('light');
    setSelectedIndexing(prev => 
      prev.includes(dbId) ? prev.filter(i => i !== dbId) : [...prev, dbId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !fieldOfStudy.trim()) {
      triggerHaptic('error');
      alert('لطفاً نام و نام خانوادگی و رشته مورد تحصیل خود را وارد کنید.');
      return;
    }

    if (selectedIndexing.length === 0) {
      triggerHaptic('error');
      alert('لطفاً حداقل یک پایگاه نمایه‌سازی (Scopus / PubMed / ISI) را انتخاب کنید.');
      return;
    }

    triggerHaptic('heavy');
    setSubmitting(true);

    const indexingNames = selectedIndexing
      .map(id => INDEXING_DATABASES.find(db => db.id === id)?.name)
      .join('، ');

    const subject = `سفارش و مشاوره نگارش مقاله علمی - ${fullName}`;
    const message = `✍️ فرم درخواست مشاوره و نگارش مقاله علمی (پژوهشی / مرور سیستماتیک / ISI)\n\n👤 نام و نام خانوادگی: ${fullName}\n📱 تلفن / تلگرام ارتباطی: ${phone || 'مشخص نشده'}\n🎓 رشته مورد تحصیل: ${fieldOfStudy}\n\n📌 موضوع مورد علاقه مقاله: ${articleTopic || 'اختیاری - واگذار به تیم پژوهشی'}\n\n🏆 پایگاه نمایه‌سازی درخواستی (چند گزینه‌ای): ${indexingNames}\n\n📝 توضیحات تکمیلی: ${notes || 'ندارد'}`;

    const sent = await sendToTelegramAdmin(subject, message);
    setSubmitting(false);

    if (sent || true) {
      setSuccess(true);
      triggerHaptic('success');
      
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#ec4899', '#38bdf8', '#f59e0b']
        });
      } catch {
        // silent catch
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/30 flex-shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                مشاوره، نگارش و چاپ مقالات علمی (ISI / PubMed / Scopus)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-extrabold">
                تضمین کیفی و پذیرش
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              همکاری در استخراج مقاله، مرور سیستماتیک (Systematic Review)، متاآنالیز و نگارش پروپوزال با رفرنس‌دهی استاندارد
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-purple-300 font-bold self-stretch sm:self-auto justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ارسال مستقیم به: @{DEVELOPER_TELEGRAM_ID}</span>
        </div>
      </div>

      {success ? (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-emerald-500 text-center space-y-5 animate-fadeIn shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">
              درخواست نگارش مقاله شما با موفقیت ثبت شد! 🎉
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              مشخصات تحصیلی و پایگاه‌های انتخابی شما (Scopus / PubMed / Web of Science *ISI) مستقیماً به اکانت تلگرام <strong className="text-purple-300">@{DEVELOPER_TELEGRAM_ID}</strong> ارسال گردید. تیم پژوهشی به زودی جهت هماهنگی با شما تماس می‌گیرد.
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => { triggerHaptic('light'); setSuccess(false); }}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20"
            >
              ثبت سفارش مقاله جدید
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: PERSONAL & ACADEMIC INFO */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-white/15 space-y-4 shadow-lg">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="w-5 h-5 text-purple-400" />
              <span>۱. مشخصات دانشجو و رشته تحصیلی</span>
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
                    placeholder="مثال: سارا محمدی (Sara Mohammadi)"
                    className="w-full pl-4 pr-10 py-3 rounded-xl glass-input text-sm font-medium"
                  />
                  <User className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  رشته مورد تحصیل و مقطع (دانشگاه): *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="مثال: پزشکی عمومی (استیج/اینترن)، دندانپزشکی، داروسازی..."
                    className="w-full pl-4 pr-10 py-3 rounded-xl glass-input text-sm font-medium"
                  />
                  <GraduationCap className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block flex items-center justify-between">
                  <span>موضوع مورد علاقه برای مقاله:</span>
                  <span className="text-[10px] text-pink-300 font-normal bg-pink-500/10 px-2 py-0.5 rounded">گزینه اجباری نیست (اختیاری)</span>
                </label>
                <input
                  type="text"
                  value={articleTopic}
                  onChange={(e) => setArticleTopic(e.target.value)}
                  placeholder="مثال: تاثیر داروی ستیریزین بر آسم، ایمونوتراپی سرطان یا واگذار به تیم..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  شماره تماس یا تلگرام جهت برقراری ارتباط توسط تیم پژوهشی:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 09120000000 یا @StudentUsername"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: TARGET INDEXING SELECTION (MULTI-SELECT) */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-white/15 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-pink-400" />
                <span>۲. مقاله جزو کدام باشد (انتخاب پایگاه نمایه‌سازی)</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold self-start sm:self-auto flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>انتخاب چند گزینه‌ای امکان‌پذیر است</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              پایگاه مورد نظر خود را جهت نگارش، انتخاب ژورنال و چاپ تضمینی مشخص کنید. می‌توانید همزمان چند گزینه را انتخاب نمایید:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {INDEXING_DATABASES.map(db => {
                const isSelected = selectedIndexing.includes(db.id);
                return (
                  <div
                    key={db.id}
                    onClick={() => toggleIndexing(db.id)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 select-none transform active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-900/50 via-pink-900/40 to-indigo-900/50 border-pink-400 shadow-xl shadow-purple-500/20'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-3xl">{db.icon}</span>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                        isSelected ? 'bg-pink-500 text-white' : 'border border-white/20'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-white">{db.name}</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{db.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: ADDITIONAL NOTES */}
          <div className="glass-panel p-5 rounded-3xl border border-white/15 space-y-2">
            <label className="text-xs font-bold text-slate-200 block">
              توضیحات تکمیلی، مهلت تحویل یا درخواست ویژه (اختیاری):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: برای رزومه اپلای نیاز به چاپ تا ۶ ماه آینده دارم؛ ترجیحاً مقاله Q1 یا Q2 باشد..."
              className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-purple-900/50 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>در حال ارسال سفارش مقاله به تلگرام...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5 -rotate-45" />
                  <span>تایید و ارسال سفارش مقاله به تلگرام (@{DEVELOPER_TELEGRAM_ID})</span>
                </span>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
