// =============================================================================
//  /api/feed  —  Daily Videos / Tips / Ads Feed (Vercel Serverless Function)
//  - Refreshes the feed every 24 hours (re-stamps items as "new").
//  - Items older than 24h are pruned (removed) before being returned,
//    so the user always sees a fresh daily set and stale items disappear.
//  - The visible set is randomly sampled from a curated pool so the daily
//    feed changes each day.
// =============================================================================

import fs from 'fs';

const CACHE_FILE = '/tmp/feed-cache.json';
const FEED_TTL = 24 * 60 * 60 * 1000; // 24 hours
const DAILY_COUNT = 9;
const NEWS_COUNT = 8;

// ---------------------------------------------------------------------------
//  Medical news sources (RSS). Fetched live so the feed carries real, current
//  headlines; if a source is unreachable it is simply skipped.
// ---------------------------------------------------------------------------
const DEFAULT_NEWS_SOURCES: { name: string; site: string; feed: string }[] = [
  { name: 'سیب مگزین', site: 'https://seebmagazine.com/', feed: 'https://seebmagazine.com/feed/' },
  { name: 'Medscape', site: 'https://www.medscape.com/', feed: 'https://www.medscape.com/cx/rssfeeds/2700.xml' },
  { name: 'Medical News Today', site: 'https://www.medicalnewstoday.com/', feed: 'https://www.medicalnewstoday.com/rss' },
  { name: 'Modern Healthcare', site: 'https://www.modernhealthcare.com/', feed: 'https://www.modernhealthcare.com/section/rss' },
  { name: 'دکتر مایکو (پوست، مو و زیبایی)', site: 'https://drmyco.ir/blog/medical-and-health/skin-hair-and-beauty/', feed: 'https://drmyco.ir/blog/medical-and-health/skin-hair-and-beauty/feed/' },
];

// NEWS_FEEDS_JSON allows overriding the sources (used by the test suite and to
// swap a feed URL in production without a code change).
const NEWS_SOURCES: { name: string; site: string; feed: string }[] = (() => {
  try {
    const raw = process.env.NEWS_FEEDS_JSON;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* fall back to defaults */ }
  return DEFAULT_NEWS_SOURCES;
})();

const stripTags = (s: string) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
   .replace(/<[^>]*>/g, ' ')
   .replace(/&nbsp;/g, ' ')
   .replace(/&amp;/g, '&')
   .replace(/&quot;/g, '"')
   .replace(/&#8217;|&rsquo;/g, "'")
   .replace(/&lt;/g, '<')
   .replace(/&gt;/g, '>')
   .replace(/\s+/g, ' ')
   .trim();

const pick = (block: string, tag: string): string => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? stripTags(m[1]) : '';
};

/** Parses RSS 2.0 <item> and Atom <entry> blocks into feed items. */
function parseFeed(xml: string, sourceName: string, siteUrl: string): Omit<FeedItem, 'id'>[] {
  const out: Omit<FeedItem, 'id'>[] = [];
  const blocks = [
    ...(xml.match(/<item[\s\S]*?<\/item>/gi) || []),
    ...(xml.match(/<entry[\s\S]*?<\/entry>/gi) || []),
  ];
  for (const b of blocks.slice(0, 6)) {
    const title = pick(b, 'title');
    if (!title) continue;

    let link = pick(b, 'link');
    if (!link) {
      const href = b.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = href ? href[1] : siteUrl;
    }

    const desc = pick(b, 'description') || pick(b, 'summary') || pick(b, 'content:encoded');
    const dateRaw = pick(b, 'pubDate') || pick(b, 'published') || pick(b, 'updated');
    const parsedDate = dateRaw ? Date.parse(dateRaw) : NaN;

    const img = b.match(/<enclosure[^>]*url=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i)
      || b.match(/<media:(?:content|thumbnail)[^>]*url=["']([^"']+)["']/i)
      || b.match(/<img[^>]*src=["']([^"']+)["']/i);

    out.push({
      kind: 'news',
      title: title.slice(0, 160),
      text: (desc || `آخرین خبر منتشرشده در ${sourceName}.`).slice(0, 260),
      url: link || siteUrl,
      thumbnail: img ? img[1] : undefined,
      actionLabel: `مطالعه در ${sourceName}`,
      source: sourceName,
      publishedAt: Number.isFinite(parsedDate) ? parsedDate : Date.now() - Math.floor(Math.random() * 6 * 3600e3),
    });
  }
  return out;
}

async function fetchNews(): Promise<FeedItem[]> {
  const results = await Promise.all(NEWS_SOURCES.map(async (src) => {
    try {
      const r = await fetch(src.feed, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HamyarDaneshjooBot/1.0)', Accept: 'application/rss+xml, application/xml, text/xml, */*' },
        signal: AbortSignal.timeout(7000),
      });
      if (!r.ok) return [];
      const xml = await r.text();
      return parseFeed(xml, src.name, src.site);
    } catch {
      return [];
    }
  }));

  // Interleave sources so one outlet cannot dominate the news tab.
  const lists = results.filter((l) => l.length);
  const merged: Omit<FeedItem, 'id'>[] = [];
  for (let i = 0; merged.length < NEWS_COUNT && lists.some((l) => l[i]); i++) {
    for (const l of lists) {
      if (l[i] && merged.length < NEWS_COUNT) merged.push(l[i]);
    }
  }
  return merged.map((n, i) => ({ ...n, id: `news-${i}-${Date.now()}` }));
}

type FeedItem = {
  id: string;
  kind: 'video' | 'tip' | 'ad' | 'news';
  title: string;
  text: string;
  url?: string;
  thumbnail?: string;
  actionLabel?: string;
  actionView?: string;
  source?: string;
  publishedAt: number;
};

// Curated pool. Real, relevant links for a Persian pharmacy-student audience.
const POOL: Omit<FeedItem, 'id' | 'publishedAt'>[] = [
  // ---- VIDEOS ----
  { kind: 'video', title: 'فیزیولوژی و پاتولوژی سیستم قلبی‌عروقی (Osmosis)', text: 'دوره جامع انیمیشنی قلب، نارسایی قلبی و آریتمی‌ها با انیمیشن‌های بی‌نظیر Osmosis.', url: 'https://www.osmosis.org/learn/Cardiovascular_system', thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop&q=80' },
  { kind: 'video', title: 'آموزش دست‌نویس بیماری‌ها (Armando Hasudungan)', text: 'ویدیوهای تصویری دست‌نویس برای درک عمیق بیماری‌ها و فارماکولوژی.', url: 'https://www.youtube.com/@ArmandoHasudungan', thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=80' },
  { kind: 'video', title: 'جامع‌ترین ویدیوهای علوم پایه (Dr. Najeeb)', text: 'بیش از ۵۰۰ ویدیو آموزشی رایگان برای دانشجویان پزشکی و آمادگی USMLE.', url: 'https://www.drnajeeblectures.com', thumbnail: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&auto=format&fit=crop&q=80' },
  { kind: 'video', title: 'آموزش رایگان علوم پزشکی (Khan Academy)', text: 'درس‌های رایگان آناتومی، فیزیولوژی و بهداشت از Khan Academy Medicine.', url: 'https://www.khanacademy.org/science/health-and-medicine', thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=80' },
  { kind: 'video', title: 'فارماکولوژی بالینی (Medscape)', text: 'مرجع ویدیویی دوز، تداخلات و اورژانس دارویی از Medscape.', url: 'https://www.medscape.com', thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&auto=format&fit=crop&q=80' },

  // ---- TIPS (نکات کاری) ----
  { kind: 'tip', title: '۳ تکنیک طلایی مطالعه برای امتحانات پزشکی', text: 'Spaced repetition + Active recall + تدریس به دیگران؛ مثلث طلایی یادگیری بلندمدت دانشجوی پزشکی.', actionLabel: 'مشاهده منابع آموزشی', actionView: 'education' },
  { kind: 'tip', title: 'چک‌لیست تداخل دارویی قبل از تجویز', text: 'همیشه قبل از ثبت دارو، تداخل با وارفارین/آسپرین و مکمل‌های آهن/کلسیم را بررسی کن. فاصله ۲ ساعته رعایت شود.', actionLabel: 'جستجوی دارو', actionView: 'drug-search' },
  { kind: 'tip', title: 'رزومه دانشجویی برای کار پاره‌وقت پزشکی', text: 'مهارت‌های ترجمه علمی، تدریس و ثبت مقاله را در رزومه پررنگ کن؛ کارفرمایان دانشجوی پزشکی را برای تولید محتوا می‌خواهند.', actionLabel: 'مشاهده فرصت‌های کار', actionView: 'jobs' },
  { kind: 'tip', title: 'آمادگی آزمون OSCE با سناریوی بیمار', text: 'هر روز یک سناریوی ایستا/پویا تمرین کن؛ شرح حال‌گیری، لمس بالینی و ارائه پلن را جلوی آینه ضبط کن.', actionLabel: 'منابع آموزشی', actionView: 'education' },
  { kind: 'tip', title: 'مهاجرت تحصیلی: مدارک را ۶ ماه زودتر آماده کن', text: 'توصیه‌نامه، ریزنمرات ترجمه‌شده و مدرک زبان را حداقل ۶ ماه قبل از ددلاین اپلای آماده کن.', actionLabel: 'مشاوره مهاجرت', actionView: 'study-abroad' },
  { kind: 'tip', title: 'مدیریت خواب و انرژی در دوران امتحانات', text: 'خواب ۷ ساعته، هیدراتاسیون و ویتامین D3/Zinc؛ کلید تمرکز دانشجویی در شب‌های امتحان.', actionLabel: 'جستجوی مکمل', actionView: 'drug-search' },

  // ---- ADS (تبلیغات / محصولات فروشگاه) ----
  { kind: 'ad', title: '🔥 ۴۰٪ تخفیف: ست ابزار پزشکی وارداتی چین', text: 'ست استتوسکوپ + گوشی پزشکی + قیچی جراحی با ۴۰٪ زیر نرخ بازار، ارسال ۱۰ تا ۲۰ روز کاری.', actionLabel: 'ثبت سفارش در فروشگاه', actionView: 'shop' },
  { kind: 'ad', title: '🎁 خریداری وسایل دندانپزشکی مستقیم از چین', text: 'تحویل ایمن با ۵۰٪ زیر قیمت بازار ایران. فقط در فروشگاه همیار دانشجو.', actionLabel: 'مشاهده فروشگاه', actionView: 'shop' },
  { kind: 'ad', title: '⚡ سفارش اختصاصی هر کالای دانشجویی', text: 'لینک کالا از آمازون/علی‌اکسپرس را بده؛ ما با ۴۰ تا ۷۰٪ تخفیف واردات مستقیم انجام می‌دهیم.', actionLabel: 'ثبت سفارش سفارشی', actionView: 'shop' },
  { kind: 'ad', title: '📚 دانلود رایگان کتاب‌های لاتین پزشکی', text: 'بیش از هزار کتاب افست و PDF از LibGen و منابع رایگان دانشگاهی.', actionLabel: 'منابع آموزشی', actionView: 'education' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function regenerate(): FeedItem[] {
  const now = Date.now();
  const picked = shuffle(POOL).slice(0, DAILY_COUNT);
  return picked.map((item, i) => ({
    ...item,
    id: `${item.kind}-${i}-${now}`,
    // Stagger publish times across the last ~20h so the feed looks natural.
    publishedAt: now - Math.floor(Math.random() * (FEED_TTL * 0.8)),
  }));
}

export default async function handler(_req: any, res: any) {
  let cache: { refreshedAt: number; items: FeedItem[] } | null = null;
  try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch { /* no cache yet */ }

  const now = Date.now();
  if (!cache || !cache.refreshedAt || now - cache.refreshedAt > FEED_TTL) {
    cache = { refreshedAt: now, items: regenerate() };
    try { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache)); } catch { /* ignore write errors */ }
  }

  // Prune curated items older than 24h (old ones removed).
  const fresh = (cache.items || []).filter((it) => now - it.publishedAt <= FEED_TTL);

  // Medical news is fetched live on every request so headlines are always current.
  let news: FeedItem[] = [];
  try { news = await fetchNews(); } catch { news = []; }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({
    refreshedAt: cache.refreshedAt,
    ttl: FEED_TTL,
    items: [...fresh, ...news],
    newsSources: NEWS_SOURCES.map((n) => ({ name: n.name, site: n.site })),
  }));
}
