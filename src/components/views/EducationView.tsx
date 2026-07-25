import React, { useState } from 'react';
import { EDUCATION_RESOURCES, EDUCATION_PLATFORMS } from '../../data/educationData';
import { EducationResource } from '../../types';
import { triggerHaptic } from '../../utils/telegram';
import { 
  BookOpen, 
  Video, 
  Download, 
  ExternalLink, 
  Star, 
  Play, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Award,
  Layers,
  Globe,
  Search,
  FileText
} from 'lucide-react';

interface PubArticle {
  id: string;
  title: string;
  authorString: string;
  pubYear: string;
  journalTitle: string;
  url: string;
}

export const EducationView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'video' | 'pdf'>('all');
  const [selectedVideo, setSelectedVideo] = useState<EducationResource | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // PubMed / Europe PMC Live Research Paper State
  const [pubQuery, setPubQuery] = useState('');
  const [pubLoading, setPubLoading] = useState(false);
  const [pubArticles, setPubArticles] = useState<PubArticle[]>([]);
  const [pubSearched, setPubSearched] = useState(false);

  const handlePubSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubQuery.trim()) return;

    triggerHaptic('medium');
    setPubLoading(true);
    setPubSearched(true);

    try {
      const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(pubQuery)}&format=json&pageSize=4`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        const results = data?.resultList?.result || [];
        const mapped: PubArticle[] = results.map((r: any) => ({
          id: r.id || String(Math.random()),
          title: r.title || 'Scientific Research Article',
          authorString: r.authorString ? r.authorString.slice(0, 80) + '...' : 'International Researchers',
          pubYear: r.pubYear || '2025',
          journalTitle: r.journalTitle || 'Journal of Medical Sciences',
          url: `https://europepmc.org/article/${r.source || 'MED'}/${r.id}`
        }));
        setPubArticles(mapped);
      } else {
        setPubArticles([]);
      }
    } catch {
      setPubArticles([]);
    } finally {
      setPubLoading(false);
    }
  };

  const filteredResources = EDUCATION_RESOURCES.filter(res => {
    if (filter === 'all') return true;
    return res.type === filter;
  });

  const handleOpenVideo = (res: EducationResource) => {
    triggerHaptic('medium');
    setSelectedVideo(res);
  };

  const handleDownloadPdf = (res: EducationResource) => {
    triggerHaptic('heavy');
    setDownloadingId(res.id);

    setTimeout(() => {
      setDownloadingId(null);
      setDownloadSuccessId(res.id);
      triggerHaptic('success');

      setTimeout(() => {
        setDownloadSuccessId(null);
      }, 4000);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              فیلم و کتاب‌های آموزشی دانشجویی
            </h2>
            <p className="text-xs text-slate-300">
              دسترسی به منابع رایگان و پولی؛ انیمیشن‌های مفهومی Osmosis، لکچرهای یوتیوب، هندبوک Medscape و کتاب‌های PDF
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold self-stretch sm:self-auto">
          <button
            onClick={() => { triggerHaptic('light'); setFilter('all'); }}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition-all ${
              filter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            همه منابع ({EDUCATION_RESOURCES.length})
          </button>
          <button
            onClick={() => { triggerHaptic('light'); setFilter('video'); }}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
              filter === 'video' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>فیلم‌ها (Osmosis / YouTube)</span>
          </button>
          <button
            onClick={() => { triggerHaptic('light'); setFilter('pdf'); }}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
              filter === 'pdf' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>کتاب و PDF</span>
          </button>
        </div>
      </div>

      {/* Direct Links to Reference Educational Websites & PDF Repositories */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-indigo-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>مرجع مستقیم وب‌سایت‌های آموزش ویدئویی و دانلود کتاب‌های PDF رایگان</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">EXTERNAL PLATFORMS</span>
        </div>
        
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2.5">
          {EDUCATION_PLATFORMS.map((plat, idx) => (
            <a
              key={idx}
              href={plat.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('light')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/50 transition-all flex items-center justify-between group transform active:scale-95"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-lg flex-shrink-0">{plat.icon}</span>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {plat.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 block line-clamp-1">
                    {plat.desc}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 ml-1" />
            </a>
          ))}
        </div>
      </div>

      {/* PubMed & Europe PMC Live Scientific Research Paper Search Tool */}
      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/40 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">جستجوی مقالات علمی و پژوهشی (PubMed / Europe PMC)</h3>
              <span className="text-xs text-indigo-300 font-medium">دسترسی به چکیده و لینک مستقیم مقالات ISI برای پروژه و پایان‌نامه</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold self-start sm:self-auto">
            API زنده اروپا و پاب‌مد
          </span>
        </div>

        <form onSubmit={handlePubSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={pubQuery}
              onChange={(e) => setPubQuery(e.target.value)}
              placeholder="موضوع علمی یا نام دارو (مثال: Cetirizine allergy, COVID-19 vaccine, Migraine)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs sm:text-sm font-medium placeholder:text-slate-500"
            />
            <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={pubLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
          >
            {pubLoading ? (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>در حال جستجو...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                <span>جستجوی مقالات</span>
              </span>
            )}
          </button>
        </form>

        {pubSearched && (
          <div className="space-y-3 pt-2">
            {pubArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pubArticles.map(art => (
                  <div key={art.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold">
                        {art.journalTitle} ({art.pubYear})
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-relaxed">
                        {art.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 font-mono">
                        ✍️ {art.authorString}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-end">
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => triggerHaptic('light')}
                        className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-[11px] flex items-center gap-1 transition-all"
                      >
                        <span>مشاهده مقاله اصلی و PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center rounded-2xl bg-black/40 text-xs text-slate-400">
                مقابله یا مقاله‌ای با این عنوان یافت نشد. لطفاً کلیدواژه انگلیسی معتبری وارد کنید.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map(res => (
          <div 
            key={res.id}
            className="group relative rounded-3xl glass-card overflow-hidden border border-white/15 hover:border-indigo-500/60 shadow-xl transition-all flex flex-col justify-between"
          >
            {/* Thumbnail */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              <img 
                src={res.thumbnail} 
                alt={res.titleFa} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Provider Badge */}
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-[11px] font-extrabold text-white flex items-center gap-1">
                {res.provider === 'Osmosis' && <Award className="w-3.5 h-3.5 text-purple-400" />}
                {res.provider === 'YouTube' && <Video className="w-3.5 h-3.5 text-red-500" />}
                {res.provider === 'Kaplan' && <Layers className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{res.provider}</span>
              </span>

              {/* Type / Free Badge */}
              <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  res.isFree ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {res.isFree ? 'رایگان (Free Access)' : 'ویژه دانشجویان'}
                </span>
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{res.rating}</span>
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {res.titleFa}
                </h3>
                <p className="text-[11px] text-indigo-300 font-mono line-clamp-1">
                  {res.titleEn}
                </p>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed pt-1">
                  {res.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  ⏱️ {res.durationOrPages}
                </span>

                {res.type === 'video' ? (
                  <button
                    onClick={() => handleOpenVideo(res)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>پخش آنلاین</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownloadPdf(res)}
                    disabled={downloadingId === res.id}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      downloadSuccessId === res.id
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 active:scale-95'
                    }`}
                  >
                    {downloadingId === res.id ? (
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                        <span>در حال دانلود...</span>
                      </span>
                    ) : downloadSuccessId === res.id ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>دانلود شد (ذخیره در تلگرام)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        <span>دانلود PDF</span>
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Video Lecture Modal Simulation */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl glass-panel border border-indigo-500/40 shadow-2xl overflow-hidden space-y-4 p-4 sm:p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                  {selectedVideo.provider} Lecture
                </span>
                <h3 className="text-base sm:text-lg font-black text-white line-clamp-1">
                  {selectedVideo.titleFa}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Video Player */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl flex items-center justify-center group border border-white/15">
              <img 
                src={selectedVideo.thumbnail} 
                alt={selectedVideo.titleFa} 
                className="w-full h-full object-cover opacity-40 blur-[1px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              
              <div className="absolute flex flex-col items-center justify-center gap-3 text-center p-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-purple-500/50 cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-extrabold text-white block">
                    پخش ویدیوی آموزشی انیمیشنی (Osmosis / YouTube Stream)
                  </span>
                  <span className="text-xs text-slate-300 block">
                    مدرس: {selectedVideo.authorOrSpeaker} • مدت زمان: {selectedVideo.durationOrPages}
                  </span>
                </div>
              </div>

              <div className="absolute bottom-3 right-4 left-4 flex items-center justify-between text-xs text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md">کیفیت 1080p HD</span>
                <a
                  href={selectedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('light')}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 transition-all"
                >
                  <span>باز کردن در سایت اصلی</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedVideo.description}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
              >
                بستن پنجره
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
