import React, { useState } from 'react';
import { searchMedical, DRUG_REFERENCE_SITES, MedicalSearchResult } from '../../data/drugsData';
import { DrugMonograph, TreatmentProtocol } from '../../types';
import { triggerHaptic } from '../../utils/telegram';
import {
  Search,
  Sparkles,
  Languages,
  Stethoscope,
  Pill,
  Leaf,
  Activity,
  AlertTriangle,
  ShieldAlert,
  BookOpen,
  Clock,
  Heart,
  CheckCircle2,
  SearchX,
  FileText,
  ExternalLink,
  Globe,
} from 'lucide-react';

const hasText = (s?: string) => !!(s && s.trim());
const hasList = (a?: string[]) => Array.isArray(a) && a.filter(x => x && x.trim()).length > 0;

export const DrugSearchView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [drug, setDrug] = useState<DrugMonograph | null>(null);
  const [protocol, setProtocol] = useState<TreatmentProtocol | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState<null | MedicalSearchResult>(null);
  const [lastQuery, setLastQuery] = useState('');

  const runSearch = async (q: string) => {
    const query = q.trim();
    if (!query) return;
    triggerHaptic('medium');
    setLoading(true);
    setDrug(null);
    setProtocol(null);
    setNotFound(null);
    setLastQuery(query);
    try {
      const result = await searchMedical(query);
      if (result.found && result.protocol) setProtocol(result.protocol);
      else if (result.found && result.drug) setDrug(result.drug);
      else setNotFound(result);
    } catch {
      setNotFound({ found: false, reason: 'ai-down' });
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(searchQuery);
  };

  const toggleBookmark = (id: string) => {
    triggerHaptic('light');
    setBookmarkedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const toggleLang = () => {
    triggerHaptic('light');
    setLang(prev => (prev === 'fa' ? 'en' : 'fa'));
  };

  const showResult = !!(drug || protocol);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-3xl border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 p-[1.5px] shadow-lg shadow-purple-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-pink-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">جستجو دارو و بیماری</h2>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold">
                دارویاب + FDA + AI
              </span>
            </div>
            <p className="text-xs text-slate-300">
              نام هر دارو یا بیماری را بنویسید تا اطلاعات واقعی از مراجع دارویی و موتورهای هوش مصنوعی دریافت شود.
            </p>
          </div>
        </div>

        <button
          onClick={toggleLang}
          className="self-stretch sm:self-auto flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all transform active:scale-95"
        >
          <Languages className="w-4 h-4" />
          <span>تغییر زبان: {lang === 'fa' ? 'فارسی (FA) 🇮🇷' : 'English (EN) 🇬🇧'}</span>
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'fa'
              ? 'نام دارو یا بیماری را بنویسید (مثلاً: متفورمین، دیابت، آموکسی‌سیلین، میگرن)...'
              : 'Type any drug or disease (e.g. Metformin, Diabetes, Amoxicillin, Migraine)...'}
            className="w-full pl-28 pr-12 py-4 rounded-2xl glass-input text-sm sm:text-base font-medium placeholder:text-slate-400 shadow-xl"
          />
          <Search className="absolute right-4 w-5 h-5 text-purple-400 pointer-events-none" />

          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="absolute left-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>در حال جستجو...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>جستجو</span>
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="glass-panel rounded-3xl p-8 border border-white/10 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto animate-spin" />
          <p className="text-sm text-slate-200 font-bold">
            در حال دریافت اطلاعات «{lastQuery}» از مراجع دارویی و موتورهای هوش مصنوعی...
          </p>
        </div>
      )}

      {/* ============================ NOT FOUND ============================ */}
      {!loading && notFound && (
        <div className="glass-panel rounded-3xl p-8 border border-white/10 text-center space-y-3">
          <SearchX className="w-10 h-10 text-slate-400 mx-auto opacity-70" />
          <p className="text-base text-white font-black">چیزی پیدا نشد</p>
          <p className="text-xs text-slate-400">
            برای «{lastQuery}» اطلاعات معتبری یافت نشد. لطفاً املای نام دارو یا بیماری را بررسی کنید یا نام لاتین آن را وارد نمایید.
          </p>
        </div>
      )}

      {/* ============================ DRUG MONOGRAPH ============================ */}
      {!loading && drug && (
        <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-white/15 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 left-0 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                  drug.type === 'herbal'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                }`}>
                  {drug.type === 'herbal' ? <Leaf className="w-3.5 h-3.5" /> : <Pill className="w-3.5 h-3.5" />}
                  {drug.type === 'herbal' ? 'داروی گیاهی / طبیعی' : 'داروی شیمیایی بالینی'}
                </span>
                {hasText(drug.pregnancyCategory) && drug.pregnancyCategory !== '—' && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-mono">
                    {drug.pregnancyCategory}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white">
                {lang === 'fa' ? drug.nameFa : drug.nameEn}
              </h3>

              <p className="text-xs sm:text-sm text-purple-300 font-medium">
                {lang === 'fa' ? `نام ژنریک: ${drug.genericNameFa}` : `Generic: ${drug.genericNameEn}`}
                {hasText(drug.category) && <> • <span className="text-slate-400">{drug.category}</span></>}
              </p>
            </div>

            <button
              onClick={() => toggleBookmark(drug.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                bookmarkedIds.includes(drug.id)
                  ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/30'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
              title="ذخیره در علاقه‌مندی‌ها"
            >
              <Heart className={`w-5 h-5 ${bookmarkedIds.includes(drug.id) ? 'fill-white' : ''}`} />
            </button>
          </div>

          <div className="space-y-4 relative z-10">
            {hasText(lang === 'fa' ? drug.indications.fa : drug.indications.en) && (
              <Section icon={<BookOpen className="w-4 h-4 text-purple-400" />} title={lang === 'fa' ? 'موارد مصرف (Indications)' : 'Indications'}>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {lang === 'fa' ? drug.indications.fa : drug.indications.en}
                </p>
              </Section>
            )}

            {hasText(lang === 'fa' ? drug.mechanism.fa : drug.mechanism.en) && (
              <Section icon={<Activity className="w-4 h-4 text-cyan-400" />} title={lang === 'fa' ? 'مکانیسم اثر (Mechanism)' : 'Mechanism of Action'}>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {lang === 'fa' ? drug.mechanism.fa : drug.mechanism.en}
                </p>
              </Section>
            )}

            {(hasText(drug.dosageAndAdministration.adults.fa) || hasText(drug.dosageAndAdministration.adults.en)) && (
              <Section icon={<Clock className="w-4 h-4 text-pink-400" />} title={lang === 'fa' ? 'دوز و نحوه مصرف (Dosage)' : 'Dosage & Administration'}>
                <div className="space-y-2 text-sm text-slate-200">
                  <p><strong className="text-purple-300">بزرگسالان: </strong>{lang === 'fa' ? drug.dosageAndAdministration.adults.fa : drug.dosageAndAdministration.adults.en}</p>
                  {(hasText(drug.dosageAndAdministration.pediatrics.fa) || hasText(drug.dosageAndAdministration.pediatrics.en)) && (
                    <p><strong className="text-purple-300">کودکان: </strong>{lang === 'fa' ? drug.dosageAndAdministration.pediatrics.fa : drug.dosageAndAdministration.pediatrics.en}</p>
                  )}
                  {drug.dosageAndAdministration.elderly && hasText(drug.dosageAndAdministration.elderly.fa) && (
                    <p><strong className="text-purple-300">سالمندان: </strong>{lang === 'fa' ? drug.dosageAndAdministration.elderly.fa : drug.dosageAndAdministration.elderly.en}</p>
                  )}
                </div>
              </Section>
            )}

            {hasList(drug.forms) && (
              <Section icon={<Pill className="w-4 h-4 text-indigo-400" />} title={lang === 'fa' ? 'اشکال دارویی موجود' : 'Available Forms'}>
                <div className="flex flex-wrap gap-2">
                  {drug.forms.map((f, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200">{f}</span>
                  ))}
                </div>
              </Section>
            )}

            {hasList(lang === 'fa' ? drug.sideEffects.fa : drug.sideEffects.en) && (
              <Section icon={<AlertTriangle className="w-4 h-4 text-amber-400" />} title={lang === 'fa' ? 'عوارض جانبی (Side Effects)' : 'Side Effects'}>
                <ul className="space-y-1.5 text-sm text-slate-200">
                  {(lang === 'fa' ? drug.sideEffects.fa : drug.sideEffects.en).map((e, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" /><span>{e}</span></li>
                  ))}
                </ul>
              </Section>
            )}

            {hasList(lang === 'fa' ? drug.interactions.fa : drug.interactions.en) && (
              <Section icon={<ShieldAlert className="w-4 h-4 text-rose-400" />} title={lang === 'fa' ? 'تداخلات دارویی (Interactions)' : 'Drug Interactions'}>
                <ul className="space-y-1.5 text-sm text-slate-200">
                  {(lang === 'fa' ? drug.interactions.fa : drug.interactions.en).map((e, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" /><span>{e}</span></li>
                  ))}
                </ul>
              </Section>
            )}

            {hasText(lang === 'fa' ? drug.precautions.fa : drug.precautions.en) && (
              <Section icon={<ShieldAlert className="w-4 h-4 text-orange-400" />} title={lang === 'fa' ? 'هشدارها و ملاحظات' : 'Precautions & Warnings'}>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {lang === 'fa' ? drug.precautions.fa : drug.precautions.en}
                </p>
              </Section>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-medium relative z-10">
            <span>📚 منبع: <strong className="text-purple-300">{drug.source}</strong></span>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2 relative z-10">
            <span className="text-[11px] font-extrabold text-slate-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>جستجوی مستقیم «{lang === 'fa' ? drug.nameFa : drug.nameEn}» در پایگاه‌های مرجع:</span>
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { name: 'Darooyab (ایران)', url: `https://www.darooyab.ir/Search?Query=${encodeURIComponent(drug.nameFa.split(' ')[0])}` },
                { name: 'DailyMed NIH', url: `https://www.dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(drug.genericNameEn.split(' ')[0])}` },
                { name: 'Drugs@FDA', url: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=BasicSearch.process' },
                { name: 'Medscape', url: 'https://www.medscape.com/index/list_89/a' },
                { name: 'GuideToPharmacology', url: `https://www.guidetopharmacology.org/GRAC/DatabaseSearchForward?searchString=${encodeURIComponent(drug.genericNameEn.split(' ')[0])}` },
              ].map((db, i) => (
                <a key={i} href={db.url} target="_blank" rel="noopener noreferrer" onClick={() => triggerHaptic('light')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-purple-600/30 border border-white/15 hover:border-purple-500/60 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all">
                  <span>{db.name}</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================ TREATMENT PROTOCOL ============================ */}
      {!loading && protocol && (
        <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-white/15 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 right-0 w-60 h-60 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1 pb-5 border-b border-white/10 relative z-10">
            <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span>پروتکل درمانی بالینی</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'fa' ? protocol.diseaseNameFa : protocol.diseaseNameEn}
            </h3>
          </div>

          {hasText(lang === 'fa' ? protocol.overview.fa : protocol.overview.en) && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 relative z-10">
              <h4 className="text-xs font-extrabold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-pink-400" />
                <span>{lang === 'fa' ? 'نمای کلی بیماری' : 'Disease Overview'}</span>
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                {lang === 'fa' ? protocol.overview.fa : protocol.overview.en}
              </p>
            </div>
          )}

          {protocol.firstLineTherapy.length > 0 && (
            <div className="space-y-3 relative z-10">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>{lang === 'fa' ? '💊 داروهای خط اول درمانی:' : '💊 First-Line Pharmacotherapy:'}</span>
              </h4>
              <div className="space-y-3">
                {protocol.firstLineTherapy.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                      <h5 className="text-sm font-extrabold text-purple-300 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-purple-400" />
                        <span>{item.drugName}</span>
                      </h5>
                      {hasText(item.duration) && item.duration !== '—' && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-white text-xs font-mono font-bold self-start sm:self-auto">
                          طول درمان: {item.duration}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {hasText(item.dosage) && item.dosage !== '—' && (
                        <div>
                          <span className="text-slate-400 font-bold block">دوز مصرفی:</span>
                          <span className="text-white font-medium">{item.dosage}</span>
                        </div>
                      )}
                      {hasText(item.frequency) && item.frequency !== '—' && (
                        <div>
                          <span className="text-slate-400 font-bold block">دفعات مصرف:</span>
                          <span className="text-pink-300 font-bold">{item.frequency}</span>
                        </div>
                      )}
                    </div>
                    {hasText(lang === 'fa' ? item.notesFa : item.notesEn) && (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">💡 نکته بالینی:</span>
                        <span>{lang === 'fa' ? item.notesFa : item.notesEn}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {protocol.adjunctiveHerbalTherapy.length > 0 && (
            <div className="space-y-3 relative z-10">
              <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                <span>{lang === 'fa' ? '🌿 درمان‌های مکمل گیاهی:' : '🌿 Adjunctive Herbal Therapies:'}</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {protocol.adjunctiveHerbalTherapy.map((herb, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5 text-xs">
                    <h5 className="font-extrabold text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{herb.name}</span>
                    </h5>
                    {hasText(herb.usage) && <p className="text-slate-300 font-medium"><strong className="text-slate-400">مصرف:</strong> {herb.usage}</p>}
                    {hasText(herb.benefit) && <p className="text-emerald-200/90"><strong className="text-emerald-400">اثر:</strong> {herb.benefit}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasList(lang === 'fa' ? protocol.lifestyleAdviceFa : protocol.lifestyleAdviceEn) && (
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5 relative z-10 text-xs sm:text-sm">
              <h4 className="font-extrabold text-cyan-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'fa' ? '🥗 توصیه‌های تغذیه و سبک زندگی:' : '🥗 Lifestyle & Nutrition:'}</span>
              </h4>
              <ul className="space-y-2 text-slate-200">
                {(lang === 'fa' ? protocol.lifestyleAdviceFa : protocol.lifestyleAdviceEn).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ============================ EMPTY / IDLE STATE ============================ */}
      {!loading && !showResult && !notFound && (
        <div className="glass-panel rounded-3xl p-8 border border-white/10 text-center space-y-3">
          <FileText className="w-10 h-10 text-purple-400 mx-auto opacity-70" />
          <p className="text-sm text-white font-bold">نام دارو یا بیماری مورد نظر را جستجو کنید</p>
          <p className="text-xs text-slate-400">
            اطلاعات از مراجع رسمی دارویی (دارویاب، FDA، DailyMed) و موتورهای هوش مصنوعی دریافت می‌شود.
          </p>
        </div>
      )}

      {/* Reference portals (always visible) */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3">
        <h3 className="text-xs sm:text-sm font-extrabold text-purple-300 flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>پایگاه‌های رسمی مرجع دارویی</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DRUG_REFERENCE_SITES.map((site, idx) => (
            <a key={idx} href={site.url} target="_blank" rel="noopener noreferrer" onClick={() => triggerHaptic('light')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/50 transition-all flex items-center justify-between group transform active:scale-95">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-lg flex-shrink-0">{site.icon}</span>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">{site.name}</h4>
                  <span className="text-[10px] text-slate-400 block line-clamp-1">{site.desc}</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 flex-shrink-0 ml-1" />
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
    <h4 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
      {icon}<span>{title}</span>
    </h4>
    {children}
  </div>
);
