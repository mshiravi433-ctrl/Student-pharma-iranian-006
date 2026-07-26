// =============================================================================
//  /api/jobs  —  Live Student Job Listings (Vercel Serverless Function)
//  Pulls fresh postings from the Iranian job boards used by the app
//  (جابینجا / کارنو / ایران استخدام) via their public RSS/Atom feeds.
//  Sources that are unreachable are simply skipped — the client always keeps
//  its curated base list, so the section never ends up empty.
// =============================================================================

type LiveJob = {
  id: string;
  title: string;
  companyOrClient: string;
  source: string;
  externalUrl: string;
  type: 'remote' | 'on-site' | 'hybrid' | 'project';
  salary: string;
  location: string;
  description: string;
  requirements: string[];
  postedAgo: string;
  category: string;
  isNew: boolean;
  publishedAt: number;
};

const DEFAULT_SOURCES: { name: string; feed: string; site: string }[] = [
  { name: 'جابینجا', site: 'https://jobinja.ir', feed: 'https://jobinja.ir/jobs.rss' },
  { name: 'جابینجا (پزشکی)', site: 'https://jobinja.ir/categories/medical', feed: 'https://jobinja.ir/jobs/category/medical-jobs.rss' },
  { name: 'ایران استخدام', site: 'https://www.iranestekhdam.ir', feed: 'https://www.iranestekhdam.ir/feed/' },
  { name: 'کارنو', site: 'https://karno.ir', feed: 'https://karno.ir/feed/' },
];

// JOB_FEEDS_JSON allows overriding the boards (used by the test suite).
const SOURCES: { name: string; feed: string; site: string }[] = (() => {
  try {
    const raw = process.env.JOB_FEEDS_JSON;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* fall back to defaults */ }
  return DEFAULT_SOURCES;
})();

// Only keep postings plausibly relevant to medical / pharmacy students.
const RELEVANT = /پزشک|پزشکی|دارو|داروساز|پرستار|درمان|بیمارستان|کلینیک|آزمایشگاه|دندان|سلامت|بهداشت|مقاله|پژوهش|تحقیق|ترجمه|تدریس|مدرس|محتوا|تایپ|ورود اطلاعات|spss|medical|pharma|nurse|clinic|research|translat|teach|content/i;

const CATEGORY_RULES: [RegExp, string][] = [
  [/مقاله|پژوهش|تحقیق|research|isi|پایان.?نامه/i, 'research'],
  [/تدریس|مدرس|معلم|teach|tutor/i, 'tutoring'],
  [/ترجمه|مترجم|translat/i, 'translation'],
  [/محتوا|نویس|content|copywrit|سئو|seo/i, 'content'],
  [/داده|اطلاعات|spss|تایپ|data.?entry|اکسل/i, 'data-entry'],
  [/گرافیک|طراح|design|فتوشاپ|ویدیو|تدوین/i, 'design'],
  [/بیمارستان|کلینیک|درمانگاه|پرستار|clinic|hospital/i, 'clinical'],
];

const stripTags = (s: string) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
   .replace(/<[^>]*>/g, ' ')
   .replace(/&nbsp;/g, ' ')
   .replace(/&amp;/g, '&')
   .replace(/&quot;/g, '"')
   .replace(/&lt;/g, '<')
   .replace(/&gt;/g, '>')
   .replace(/\s+/g, ' ')
   .trim();

const pick = (block: string, tag: string): string => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? stripTags(m[1]) : '';
};

const timeAgoFa = (ts: number): string => {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3.6e6);
  if (h < 1) return 'چند دقیقه پیش';
  if (h < 24) return `${h} ساعت پیش`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'دیروز' : `${d} روز پیش`;
};

const detectType = (text: string): LiveJob['type'] => {
  if (/دورکار|remote|از راه دور|غیرحضوری/i.test(text)) return 'remote';
  if (/پروژه|project|فریلنس|freelance/i.test(text)) return 'project';
  if (/ترکیبی|hybrid/i.test(text)) return 'hybrid';
  return 'on-site';
};

const detectCategory = (text: string): string => {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(text)) return cat;
  return 'content';
};

const detectLocation = (text: string): string => {
  const m = text.match(/(تهران|مشهد|اصفهان|شیراز|تبریز|کرج|قم|اهواز|رشت|کرمان|یزد|ارومیه)/);
  if (m) return m[1];
  if (/دورکار|remote|غیرحضوری/i.test(text)) return 'دورکاری (سراسر کشور)';
  return 'محل کار در آگهی اصلی ذکر شده است';
};

const detectSalary = (text: string): string => {
  const m = text.match(/([\u06F0-\u06F90-9,\.]{3,})\s*(میلیون|هزار)?\s*تومان/);
  if (m) return m[0].trim();
  return 'حقوق توافقی — در آگهی اصلی ببینید';
};

function parseFeed(xml: string, source: string, site: string): LiveJob[] {
  const out: LiveJob[] = [];
  const blocks = [
    ...(xml.match(/<item[\s\S]*?<\/item>/gi) || []),
    ...(xml.match(/<entry[\s\S]*?<\/entry>/gi) || []),
  ];

  for (const b of blocks.slice(0, 12)) {
    const title = pick(b, 'title');
    if (!title) continue;

    const desc = pick(b, 'description') || pick(b, 'summary') || pick(b, 'content:encoded');
    const haystack = `${title} ${desc}`;
    if (!RELEVANT.test(haystack)) continue;

    let link = pick(b, 'link');
    if (!link) {
      const href = b.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = href ? href[1] : site;
    }

    const dateRaw = pick(b, 'pubDate') || pick(b, 'published') || pick(b, 'updated');
    const parsed = dateRaw ? Date.parse(dateRaw) : NaN;
    const publishedAt = Number.isFinite(parsed) ? parsed : Date.now();

    out.push({
      id: `live-${source}-${out.length}-${publishedAt}`,
      title: title.slice(0, 150),
      companyOrClient: `${source} (آگهی زنده)`,
      source,
      externalUrl: link || site,
      type: detectType(haystack),
      salary: detectSalary(haystack),
      location: detectLocation(haystack),
      description: (desc || 'برای مشاهده شرح کامل آگهی روی دکمه زیر بزنید.').slice(0, 320),
      requirements: ['شرایط کامل و نحوه ارسال رزومه در آگهی اصلی درج شده است'],
      postedAgo: timeAgoFa(publishedAt),
      category: detectCategory(haystack),
      isNew: Date.now() - publishedAt < 48 * 3600e3,
      publishedAt,
    });
  }
  return out;
}

export default async function handler(_req: any, res: any) {
  const results = await Promise.all(SOURCES.map(async (src) => {
    try {
      const r = await fetch(src.feed, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HamyarDaneshjooBot/1.0)',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(7000),
      });
      if (!r.ok) return [];
      return parseFeed(await r.text(), src.name, src.site);
    } catch {
      return [];
    }
  }));

  // Interleave sources so one board cannot dominate, newest first.
  const lists = results.filter((l) => l.length);
  const merged: LiveJob[] = [];
  for (let i = 0; merged.length < 20 && lists.some((l) => l[i]); i++) {
    for (const l of lists) if (l[i] && merged.length < 20) merged.push(l[i]);
  }
  merged.sort((a, b) => b.publishedAt - a.publishedAt);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({
    ok: true,
    count: merged.length,
    fetchedAt: Date.now(),
    jobs: merged,
    sources: SOURCES.map((s) => ({ name: s.name, site: s.site })),
  }));
}
