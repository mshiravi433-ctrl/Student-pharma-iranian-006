import React, { useState, useMemo } from 'react';
import { STATIC_DRUGS_DB, TREATMENT_PROTOCOLS_DB, synthesizeAiMedicalData, DRUG_REFERENCE_SITES } from '../../data/drugsData';
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
  Share2, 
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Filter,
  FileText,
  ExternalLink,
  Globe
} from 'lucide-react';

export const DrugSearchView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'chemical' | 'herbal' | 'protocols'>('all');
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [selectedDrug, setSelectedDrug] = useState<DrugMonograph | null>(STATIC_DRUGS_DB[0]); // Default Zyrtec
  const [selectedProtocol, setSelectedProtocol] = useState<TreatmentProtocol | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['zyrtec']);
  const [aiLoading, setAiLoading] = useState(false);

  // Filtered lists
  const filteredDrugs = useMemo(() => {
    return STATIC_DRUGS_DB.filter(drug => {
      if (activeTab === 'chemical' && drug.type !== 'chemical') return false;
      if (activeTab === 'herbal' && drug.type !== 'herbal') return false;
      if (activeTab === 'protocols') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        drug.nameFa.toLowerCase().includes(q) ||
        drug.nameEn.toLowerCase().includes(q) ||
        drug.genericNameFa.toLowerCase().includes(q) ||
        drug.genericNameEn.toLowerCase().includes(q) ||
        drug.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, activeTab]);

  const filteredProtocols = useMemo(() => {
    if (activeTab === 'chemical' || activeTab === 'herbal') return [];
    if (!searchQuery.trim()) return TREATMENT_PROTOCOLS_DB;
    const q = searchQuery.toLowerCase();
    return TREATMENT_PROTOCOLS_DB.filter(p => 
      p.diseaseNameFa.toLowerCase().includes(q) || 
      p.diseaseNameEn.toLowerCase().includes(q)
    );
  }, [searchQuery, activeTab]);

  const handleSelectDrug = (drug: DrugMonograph) => {
    triggerHaptic('light');
    setSelectedDrug(drug);
    setSelectedProtocol(null);
    // Scroll to top of details view on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProtocol = (protocol: TreatmentProtocol) => {
    triggerHaptic('light');
    setSelectedProtocol(protocol);
    setSelectedDrug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    triggerHaptic('medium');
    setAiLoading(true);

    try {
      const { drug, protocol } = await synthesizeAiMedicalData(searchQuery);
      if (protocol) {
        setSelectedProtocol(protocol);
        setSelectedDrug(null);
      } else if (drug) {
        setSelectedDrug(drug);
        setSelectedProtocol(null);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const toggleBookmark = (id: string) => {
    triggerHaptic('light');
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleLang = () => {
    triggerHaptic('light');
    setLang(prev => (prev === 'fa' ? 'en' : 'fa'));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      
      {/* Top Header & Language Switch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-3xl border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 p-[1.5px] shadow-lg shadow-purple-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-pink-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                جستجو دارو و پروتکل‌های درمانی
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold">
                دارویاب + Medscape
              </span>
            </div>
            <p className="text-xs text-slate-300">
              مرجع کامل داروشناسی، دوز و دوسیج، تداخلات، عوارض و درمان بیماری‌ها (شیمیایی و گیاهی)
            </p>
          </div>
        </div>

        {/* Language Toggle Button */}
        <button
          onClick={toggleLang}
          className="self-stretch sm:self-auto flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all transform active:scale-95"
        >
          <Languages className="w-4 h-4" />
          <span>تغییر زبان: {lang === 'fa' ? 'فارسی (FA) 🇮🇷' : 'English (EN) 🇬🇧'}</span>
        </button>
      </div>

      {/* AI Search Bar */}
      <form onSubmit={handleAiSearch} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val.trim()) {
                setSelectedDrug(null);
                setSelectedProtocol(null);
              }
            }}
            placeholder={lang === 'fa' ? "جستجوی نام دارو (مثلاً: زرتیک، آموکسی‌سیلین، آویشن، ژلوفن) یا بیماری (مثلاً: سرماخوردگی، میگرن)..." : "Search drug (e.g. Zyrtec, Amoxicillin, Ibuprofen) or disease (e.g. Cold, Flu, Migraine)..."}
            className="w-full pl-28 pr-12 py-4 rounded-2xl glass-input text-sm sm:text-base font-medium placeholder:text-slate-400 shadow-xl"
          />
          <Search className="absolute right-4 w-5 h-5 text-purple-400 pointer-events-none" />
          
          <button
            type="submit"
            disabled={aiLoading}
            className="absolute left-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {aiLoading ? (
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>در حال سنتز AI...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>جستجو با AI</span>
              </span>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-3 no-scrollbar text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            پربازدیدترین‌ها:
          </span>
          {[
            { label: 'زرتیک (Zyrtec)', type: 'drug', id: 'zyrtec' },
            { label: 'سرماخوردگی و آنفولانزا', type: 'protocol', id: 'common-cold' },
            { label: 'آموکسی‌سیلین', type: 'drug', id: 'amoxicillin' },
            { label: 'سردرد میگرنی دانشجویی', type: 'protocol', id: 'migraine-headache' },
            { label: 'شربت آویشن و عسل', type: 'drug', id: 'thyme-syrup' },
            { label: 'ایبوپروفن (ژلوفن)', type: 'drug', id: 'ibuprofen' },
            { label: 'ورم معده و رفلاکس', type: 'protocol', id: 'gastritis-gerd' },
            { label: 'سنبل‌الطیب (آرام‌بخش)', type: 'drug', id: 'valerian' },
          ].map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                if (chip.type === 'drug') {
                  const found = STATIC_DRUGS_DB.find(d => d.id === chip.id);
                  if (found) handleSelectDrug(found);
                } else {
                  const found = TREATMENT_PROTOCOLS_DB.find(p => p.id === chip.id);
                  if (found) handleSelectProtocol(found);
                }
              }}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white font-medium whitespace-nowrap transition-all"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </form>

      {/* Direct Links to Official Drug Reference Portals & OpenFDA / TTAC / Darooyab */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-purple-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>سایت‌ها و پایگاه‌های رسمی مرجع دارویاب (ایران، FDA و Medscape)</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">REFERENCE DATABASE</span>
        </div>
        
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DRUG_REFERENCE_SITES.map((site, idx) => (
            <a
              key={idx}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('light')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/50 transition-all flex items-center justify-between group transform active:scale-95"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-lg flex-shrink-0">{site.icon}</span>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {site.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 block line-clamp-1">
                    {site.desc}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 flex-shrink-0 ml-1" />
            </a>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Left sidebar (List/Tabs) & Right area (Monograph / Protocol details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / TOP PANEL: Category Tabs & List (4 Columns on LG) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Filter Tabs */}
          <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 lg:grid-cols-2 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold">
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('all'); }}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'all' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>همه موارد</span>
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('chemical'); }}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'chemical' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-cyan-400" />
              <span>شیمیایی</span>
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('herbal'); }}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'herbal' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>گیاهی</span>
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('protocols'); }}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'protocols' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-pink-300" />
              <span>پروتکل درمانی</span>
            </button>
          </div>

          {/* Scrollable Items List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
            
            {/* Treatment Protocols List */}
            {filteredProtocols.length > 0 && (activeTab === 'all' || activeTab === 'protocols') && (
              <div className="space-y-2">
                <div className="text-[11px] font-extrabold text-pink-400 uppercase tracking-wider px-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>پروتکل‌های بالینی و درمانی بیماری‌ها</span>
                </div>
                {filteredProtocols.map(proto => {
                  const isSelected = selectedProtocol?.id === proto.id;
                  return (
                    <div
                      key={proto.id}
                      onClick={() => handleSelectProtocol(proto)}
                      className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-gradient-to-r from-pink-900/40 to-purple-900/40 border-pink-500 shadow-lg shadow-pink-500/10' 
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-pink-500 text-white' : 'bg-pink-500/20 text-pink-400'
                        }`}>
                          <Heart className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">
                            {lang === 'fa' ? proto.diseaseNameFa : proto.diseaseNameEn}
                          </h4>
                          <span className="text-[10px] text-pink-300 font-medium">
                            پروتکل درمانی جامع + گیاهی
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-pink-400 rotate-90' : 'text-slate-500'}`} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Drugs List */}
            {filteredDrugs.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-extrabold text-purple-400 uppercase tracking-wider px-1 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5" />
                  <span>مونوگراف‌های دارویی (شیمیایی و گیاهی)</span>
                </div>
                {filteredDrugs.map(drug => {
                  const isSelected = selectedDrug?.id === drug.id;
                  const isHerbal = drug.type === 'herbal';
                  return (
                    <div
                      key={drug.id}
                      onClick={() => handleSelectDrug(drug)}
                      className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500 shadow-lg shadow-purple-500/10' 
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-purple-600 text-white' : isHerbal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {isHerbal ? <Leaf className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">
                            {lang === 'fa' ? drug.nameFa : drug.nameEn}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium line-clamp-1">
                            {lang === 'fa' ? drug.genericNameFa : drug.genericNameEn}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-purple-400 rotate-90' : 'text-slate-500'}`} />
                    </div>
                  );
                })}
              </div>
            )}

            {filteredDrugs.length === 0 && filteredProtocols.length === 0 && (
              <div className="p-6 text-center glass-panel rounded-2xl border border-white/10 space-y-2">
                <HelpCircle className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
                <p className="text-sm text-slate-300 font-bold">موردی با این نام یافت نشد!</p>
                <p className="text-xs text-slate-400">
                  برای تولید خودکار اطلاعات، دکمه <strong className="text-pink-400">«جستجو با AI»</strong> را در نوار جستجو فشار دهید.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT AREA / DETAILS PANEL (8 Columns on LG) */}
        <div className="lg:col-span-8">
          
          {/* CASE 1: DISPLAY DRUG MONOGRAPH DETAILS */}
          {selectedDrug && (
            <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-white/15 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 left-0 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
              
              {/* Monograph Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      selectedDrug.type === 'herbal' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}>
                      {selectedDrug.type === 'herbal' ? <Leaf className="w-3.5 h-3.5" /> : <Pill className="w-3.5 h-3.5" />}
                      {selectedDrug.type === 'herbal' ? 'داروی گیاهی / طبیعی' : 'داروی شیمیایی بالینی'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-mono">
                      {selectedDrug.pregnancyCategory}
                    </span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {lang === 'fa' ? selectedDrug.nameFa : selectedDrug.nameEn}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-purple-300 font-medium">
                    {lang === 'fa' ? `نام ژنریک: ${selectedDrug.genericNameFa}` : `Generic: ${selectedDrug.genericNameEn}`} • <span className="text-slate-400">{selectedDrug.category}</span>
                  </p>
                </div>

                {/* Bookmark & Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(selectedDrug.id)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      bookmarkedIds.includes(selectedDrug.id) 
                        ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/30' 
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                    title="ذخیره در علاقه‌مندی‌ها"
                  >
                    <Heart className={`w-5 h-5 ${bookmarkedIds.includes(selectedDrug.id) ? 'fill-white' : ''}`} />
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('success');
                      if (navigator.share) {
                        navigator.share({
                          title: selectedDrug.nameFa,
                          text: `اطلاعات دارویی جامع ${selectedDrug.nameFa} در مینی‌اپ همیار دانشجو`,
                          url: window.location.href
                        }).catch(() => {});
                      } else {
                        alert('لینک اطلاعات دارو کپی شد!');
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all"
                    title="اشتراک‌گذاری اطلاعات دارو"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Monograph Sections Grid */}
              <div className="space-y-5 relative z-10 text-slate-200 text-sm sm:text-base leading-relaxed">
                
                {/* 1. Indications (موارد مصرف) */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-extrabold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-pink-400" />
                    <span>{lang === 'fa' ? 'موارد مصرف و اندیکاسیون‌ها (Indications)' : 'Clinical Indications'}</span>
                  </h4>
                  <p className="text-slate-200 font-medium">
                    {lang === 'fa' ? selectedDrug.indications.fa : selectedDrug.indications.en}
                  </p>
                </div>

                {/* 2. Mechanism of Action (مکانیسم اثر) */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
                  <h4 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span>{lang === 'fa' ? 'مکانیسم اثر فارماکولوژیک (Mechanism of Action)' : 'Mechanism of Action'}</span>
                  </h4>
                  <p className="text-slate-200 font-medium">
                    {lang === 'fa' ? selectedDrug.mechanism.fa : selectedDrug.mechanism.en}
                  </p>
                </div>

                {/* 3. Dosage & Administration (دوز و دوسیج و نحوه مصرف) */}
                <div className="space-y-3 p-4.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30">
                  <h4 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>{lang === 'fa' ? 'دوز، دوسیج و دستور مصرف (Dosage & Administration)' : 'Dosage & Administration'}</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                      <span className="text-xs font-bold text-pink-400 block mb-1">
                        {lang === 'fa' ? '👤 دوز بزرگسالان (Adults):' : '👤 Adult Dosage:'}
                      </span>
                      <p className="text-xs text-slate-300">
                        {lang === 'fa' ? selectedDrug.dosageAndAdministration.adults.fa : selectedDrug.dosageAndAdministration.adults.en}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                      <span className="text-xs font-bold text-cyan-400 block mb-1">
                        {lang === 'fa' ? '👶 دوز کودکان (Pediatrics):' : '👶 Pediatric Dosage:'}
                      </span>
                      <p className="text-xs text-slate-300">
                        {lang === 'fa' ? selectedDrug.dosageAndAdministration.pediatrics.fa : selectedDrug.dosageAndAdministration.pediatrics.en}
                      </p>
                    </div>
                  </div>

                  {selectedDrug.dosageAndAdministration.elderly && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                      <span className="text-xs font-bold text-amber-400 block mb-1">
                        {lang === 'fa' ? '🧓 دوز سالمندان و بیماران کلیوی:' : '🧓 Elderly / Renal Impairment:'}
                      </span>
                      <p className="text-xs text-slate-300">
                        {lang === 'fa' ? selectedDrug.dosageAndAdministration.elderly.fa : selectedDrug.dosageAndAdministration.elderly.en}
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Available Forms (اشکال دارویی) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-purple-400" />
                    <span>{lang === 'fa' ? 'اشکال دارویی موجود در بازار (Available Forms)' : 'Available Dosage Forms'}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDrug.forms.map((form, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-purple-200">
                        {form}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5. Side Effects & Interactions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Side Effects */}
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                    <h4 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{lang === 'fa' ? 'عوارض جانبی شایع (Side Effects)' : 'Common Side Effects'}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {(lang === 'fa' ? selectedDrug.sideEffects.fa : selectedDrug.sideEffects.en).map((eff, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{eff}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Drug Interactions */}
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                    <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'fa' ? 'تداخلات دارویی و غذایی (Interactions)' : 'Drug & Food Interactions'}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {(lang === 'fa' ? selectedDrug.interactions.fa : selectedDrug.interactions.en).map((intr, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{intr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* 6. Precautions & Pregnancy */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-slate-300 block">
                      {lang === 'fa' ? '⚠️ هشدارها و احتیاطات بالینی (Precautions):' : '⚠️ Warnings & Precautions:'}
                    </span>
                    <p className="text-xs text-slate-400">
                      {lang === 'fa' ? selectedDrug.precautions.fa : selectedDrug.precautions.en}
                    </p>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center flex-shrink-0">
                    <span className="text-[10px] text-purple-300 block font-bold">دسته بارداری FDA</span>
                    <span className="text-sm font-black text-white">{selectedDrug.pregnancyCategory}</span>
                  </div>
                </div>

              </div>

              {/* Monograph Footer Reference */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-medium">
                <span>📚 مرجع بالینی: <strong className="text-purple-300">{selectedDrug.source}</strong></span>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md self-start sm:self-auto">آپدیت بالینی ۲۰۲۶</span>
              </div>

              {/* 1-Click Search Across Global Reference Databases */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-extrabold text-slate-300 block flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span>جستجوی مستقیم «{lang === 'fa' ? selectedDrug.nameFa : selectedDrug.nameEn}» در پایگاه‌های مرجع دارویی:</span>
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { name: 'Darooyab (ایران)', url: `https://www.darooyab.ir/Search?Query=${encodeURIComponent(selectedDrug.nameFa.split(' ')[0])}` },
                    { name: 'TTAC تی‌تک', url: `https://www.ttac.ir` },
                    { name: 'DailyMed NIH', url: `https://www.dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(selectedDrug.genericNameEn.split(' ')[0])}` },
                    { name: 'Drugs@FDA', url: `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=BasicSearch.process` },
                    { name: 'Medscape Reference', url: `https://www.medscape.com/index/list_89/a` },
                    { name: 'GuideToPharmacology', url: `https://www.guidetopharmacology.org/GRAC/DatabaseSearchForward?searchString=${encodeURIComponent(selectedDrug.genericNameEn.split(' ')[0])}` }
                  ].map((db, idx) => (
                    <a
                      key={idx}
                      href={db.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerHaptic('light')}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-purple-600/30 border border-white/15 hover:border-purple-500/60 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <span>{db.name}</span>
                      <ExternalLink className="w-3 h-3 text-purple-400" />
                    </a>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* CASE 2: DISPLAY TREATMENT PROTOCOL DETAILS (e.g. Common Cold / Migraine / Gastritis) */}
          {selectedProtocol && (
            <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-pink-500/30 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 right-0 w-60 h-60 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
              
              {/* Protocol Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-bold inline-flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                    <span>پروتکل درمانی بالینی و دانشجویی</span>
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {lang === 'fa' ? selectedProtocol.diseaseNameFa : selectedProtocol.diseaseNameEn}
                  </h3>
                  <p className="text-xs text-slate-400">
                    راهنمای قدم به قدم تجویز داروهای خط اول، دوز، مدت مصرف و مکمل‌های گیاهی موثر
                  </p>
                </div>
              </div>

              {/* Overview */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 relative z-10">
                <h4 className="text-xs font-extrabold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-pink-400" />
                  <span>{lang === 'fa' ? 'نمای کلی بیماری و اپروچ درمانی (Overview)' : 'Disease Overview & Therapeutic Approach'}</span>
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {lang === 'fa' ? selectedProtocol.overview.fa : selectedProtocol.overview.en}
                </p>
              </div>

              {/* First-Line Regimen Grid */}
              <div className="space-y-3 relative z-10">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>{lang === 'fa' ? '💊 داروهای خط اول درمانی (رژیم دارویی استاندارد):' : '💊 First-Line Pharmacotherapy Regimen:'}</span>
                </h4>

                <div className="space-y-3">
                  {selectedProtocol.firstLineTherapy.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                        <h5 className="text-sm font-extrabold text-purple-300 flex items-center gap-1.5">
                          <Pill className="w-4 h-4 text-purple-400" />
                          <span>{item.drugName}</span>
                        </h5>
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-white text-xs font-mono font-bold self-start sm:self-auto">
                          طول درمان: {item.duration}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 font-bold block">دوز مصرفی (Dosage):</span>
                          <span className="text-white font-medium">{item.dosage}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">زمان و فواصل مصرف (Frequency):</span>
                          <span className="text-pink-300 font-bold">{item.frequency}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">💡 نکته بالینی:</span>
                        <span>{lang === 'fa' ? item.notesFa : item.notesEn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adjunctive Herbal Therapy */}
              <div className="space-y-3 relative z-10">
                <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  <span>{lang === 'fa' ? '🌿 درمان‌های مکمل گیاهی و طبیعی (Herbal Adjuvants):' : '🌿 Adjunctive Herbal & Natural Therapies:'}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedProtocol.adjunctiveHerbalTherapy.map((herb, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5 text-xs">
                      <h5 className="font-extrabold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{herb.name}</span>
                      </h5>
                      <p className="text-slate-300 font-medium">
                        <strong className="text-slate-400">دستور مصرف:</strong> {herb.usage}
                      </p>
                      <p className="text-emerald-200/90">
                        <strong className="text-emerald-400">اثر درمانی:</strong> {herb.benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifestyle Advice */}
              <div className="p-4.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5 relative z-10 text-xs sm:text-sm">
                <h4 className="font-extrabold text-cyan-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'fa' ? '🥗 توصیه‌های استراحت، تغذیه و سبک زندگی دانشجویی:' : '🥗 Student Lifestyle & Nutritional Recommendations:'}</span>
                </h4>
                <ul className="space-y-2 text-slate-200">
                  {(lang === 'fa' ? selectedProtocol.lifestyleAdviceFa : selectedProtocol.lifestyleAdviceEn).map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
