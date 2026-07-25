import React, { useState, useEffect, useCallback } from 'react';
import { ActiveView, FeedItem } from '../../types';
import { queryFeedApi } from '../../utils/telegram';
import {
  RefreshCw,
  Video,
  Lightbulb,
  Megaphone,
  ExternalLink,
  ArrowLeft,
  Clock,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

type Tab = 'all' | 'video' | 'tip' | 'ad';

const KIND_META: Record<FeedItem['kind'], { label: string; icon: React.ReactNode; color: string; ring: string }> = {
  video: { label: 'ویدیو', icon: <Video className="w-4 h-4" />, color: 'text-indigo-300', ring: 'border-indigo-500/40 bg-indigo-500/10' },
  tip: { label: 'نکته کاری', icon: <Lightbulb className="w-4 h-4" />, color: 'text-amber-300', ring: 'border-amber-500/40 bg-amber-500/10' },
  ad: { label: 'تبلیغات', icon: <Megaphone className="w-4 h-4" />, color: 'text-pink-300', ring: 'border-pink-500/40 bg-pink-500/10' },
};

const timeAgo = (ts: number): string => {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3.6e6);
  const m = Math.floor((diff % 3.6e6) / 6e4);
  if (h <= 0) return `حدود ${Math.max(1, m)} دقیقه پیش`;
  if (h < 24) return `حدود ${h} ساعت پیش`;
  return `حدود ${Math.floor(h / 24)} روز پیش`;
};

export const DailyFeedView: React.FC<{ onNavigate: (view: ActiveView) => void }> = ({ onNavigate }) => {
  const [tab, setTab] = useState<Tab>('all');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await queryFeedApi();
    if (data && Array.isArray(data.items)) {
      setItems(data.items);
      setRefreshedAt(data.refreshedAt || Date.now());
      setError(false);
    } else {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 10 minutes so the 24h rotation is picked up quickly.
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const filtered = tab === 'all' ? items : items.filter(i => i.kind === tab);
  const counts = {
    video: items.filter(i => i.kind === 'video').length,
    tip: items.filter(i => i.kind === 'tip').length,
    ad: items.filter(i => i.kind === 'ad').length,
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-3xl border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 p-[1.5px] shadow-lg shadow-purple-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">فید روزانه ویدیو، نکات و تبلیغات</h2>
            <p className="text-xs text-slate-300">
              ویدیوهای آموزشی، نکات کاربردی دانشجویی و تبلیغات ویژه — هر ۲۴ ساعت به‌روزرسانی و قدیمی‌ها حذف می‌شوند.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="self-stretch sm:self-auto flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>به‌روزرسانی</span>
        </button>
      </div>

      {/* Updated-at note */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
        <Clock className="w-3.5 h-3.5 text-purple-400" />
        <span>
          {refreshedAt ? `آخرین به‌روزرسانی: ${timeAgo(refreshedAt)}` : 'در حال بارگذاری فید...'}
          <span className="text-slate-500"> • چرخه تازه‌سازی: ۲۴ ساعت</span>
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold max-w-md mx-auto w-full overflow-x-auto no-scrollbar">
        {([
          { id: 'all', label: 'همه', count: items.length },
          { id: 'video', label: 'ویدیو', count: counts.video },
          { id: 'tip', label: 'نکات', count: counts.tip },
          { id: 'ad', label: 'تبلیغات', count: counts.ad },
        ] as { id: Tab; label: string; count: number }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${tab === t.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            {t.label} {t.count > 0 && <span className="opacity-70">({t.count})</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Sparkles className="w-8 h-8 text-pink-400 animate-spin" />
          <span className="text-sm">در حال بارگذاری فید روزانه...</span>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center text-slate-300 text-sm">
          فید در دسترس نیست. اگر برنامه را به تازگی مستقر کرده‌اید، چند لحظه صبر کنید یا دکمه به‌روزرسانی را بزنید.
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center text-slate-300 text-sm">
          موردی در این دسته یافت نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => {
            const meta = KIND_META[item.kind];
            return (
              <div key={item.id} className="glass-panel rounded-3xl p-4 border border-white/10 hover:border-purple-500/40 transition-all space-y-3 animate-fadeIn">
                {item.thumbnail && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden bg-black/40">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${meta.ring} ${meta.color}`}>
                    {meta.icon}
                    <span>{meta.label}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(item.publishedAt)}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>

                <div className="pt-1">
                  {item.actionView ? (
                    <button
                      onClick={() => onNavigate(item.actionView!)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs transition-all active:scale-95"
                    >
                      {item.kind === 'ad' ? <ShoppingBag className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                      <span>{item.actionLabel || 'مشاهده'}</span>
                    </button>
                  ) : item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all"
                    >
                      <ExternalLink className="w-4 h-4 text-purple-300" />
                      <span>{item.actionLabel || 'مشاهده منبع'}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
