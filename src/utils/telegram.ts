import { TelegramUser } from '../types';

// Owner / bot identifiers (used for display + Telegram deep links).
export const BOT_TOKEN = '8783007968:AAEX6jKE96SXKVhs7maFSYKKOUVD8KXyCQs';
export const DEVELOPER_TELEGRAM_ID = 'Shiravi4333';
export const PRODUCER_NAME = 'تکتم عباسپور و محمد شیروی';

// -----------------------------------------------------------------------------
//  Internal helper: POST to one of our own serverless endpoints (/api/*).
//  Runs same-origin in production (Vercel) so there is no browser CORS problem.
//  Returns parsed JSON, or null on any failure (so callers can fall back).
// -----------------------------------------------------------------------------
async function callBackend(path: string, payload: any, timeoutMs = 12000): Promise<any | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
//  AI proxy: Gemini -> Cloudflare Workers AI -> Ollama (via /api/ai).
//  Returns { text, provider }. On total failure returns an empty text so the
//  UI can show its built-in medical synthesizer instead of breaking.
// -----------------------------------------------------------------------------
export const queryAiApi = async (
  prompt: string,
  systemInstruction: string = 'You are an expert clinical pharmacology assistant.'
): Promise<{ ok: boolean; text: string; provider: string; tried?: string[] }> => {
  const data = await callBackend('/api/ai', { prompt, systemInstruction }, 30000);
  if (data && typeof data.text === 'string' && data.text.trim()) {
    return { ok: true, text: data.text, provider: data.provider || 'AI Engine', tried: data.tried };
  }
  return { ok: false, text: '', provider: '', tried: data?.tried };
};

/** Health probe: which AI providers are currently reachable. */
export const checkAiProviders = async (): Promise<any | null> => {
  try {
    const res = await fetch('/api/ai', { method: 'GET' });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
};

// Backwards-compatible alias (some modules still import this name).
export const queryMultiModelAi = queryAiApi;

// -----------------------------------------------------------------------------
//  Live drug information: OpenFDA + RxNorm.
//  Primary path is the serverless /api/drug (uses the API key server-side).
//  As a robust fallback it also queries OpenFDA + RxNorm directly from the
//  browser — both APIs send CORS headers, so this works without the backend
//  too (anonymous, rate-limited; fine for a fallback / local dev).
// -----------------------------------------------------------------------------
const clean = (s: string) => (s || '').replace(/[\[\]]/g, '').trim();
const first = (arr: any, max = 360) => (Array.isArray(arr) && arr.length ? clean(String(arr[0])).slice(0, max) : '');

export const queryDrugDirect = async (query: string): Promise<any | null> => {
  const enc = (s: string) => encodeURIComponent(s);
  try {
    for (const search of [
      `openfda.brand_name:"${enc(query)}"+OR+openfda.generic_name:"${enc(query)}"+OR+openfda.substance_name:"${enc(query)}"`,
      enc(query),
    ]) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const r = await fetch(`https://api.fda.gov/drug/label.json?search=${search}&limit=1`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!r.ok) continue;
      const d: any = await r.json();
      const res0 = d?.results?.[0];
      if (!res0) continue;
      const openFda = res0.openfda || {};
      const purpose = first(res0.purpose, 900) || first(res0.indications_and_usage, 900);
      const dosage = first(res0.dosage_and_administration, 900);
      if (!purpose && !dosage) continue;
      return {
        found: true,
        source: 'OpenFDA / DailyMed (برچسب رسمی دارو)',
        data: {
          brandName: first(openFda.brand_name, 120) || query,
          genericName: first(openFda.generic_name, 120) || first(openFda.substance_name, 120) || query,
          purpose,
          dosage,
          mechanism: first(res0.mechanism_of_action, 900) || first(res0.clinical_pharmacology, 900),
          warnings: first(res0.warnings, 900) || first(res0.warnings_and_cautions, 900),
          adverseReactions: first(res0.adverse_reactions, 700),
          drugInteractions: first(res0.drug_interactions, 700),
          pregnancyCategory: first(res0.pregnancy, 200),
          pharmClass: first(openFda.pharm_class_epc, 160),
          forms: Array.isArray(openFda.route) ? openFda.route.slice(0, 4) : [],
        },
      };
    }
  } catch { /* ignore */ }
  return null;
};

export const queryDrugApi = async (query: string): Promise<any | null> => {
  const data = await callBackend('/api/drug', { query }, 20000);
  if (data && data.found) return data;
  return await queryDrugDirect(query);
};

// -----------------------------------------------------------------------------
//  Daily feed: videos / tips / ads (via /api/feed). GET request.
// -----------------------------------------------------------------------------
export const queryFeedApi = async (): Promise<any | null> => {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch('/api/feed', { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

// -----------------------------------------------------------------------------
//  Telegram delivery: actually sends order / support / service messages to the
//  owner's Telegram via the server-side /api/notify endpoint. Falls back to
//  opening a Telegram deep-link if the backend is unavailable.
// -----------------------------------------------------------------------------
export const sendToTelegramAdmin = async (
  subject: string,
  message: string,
  type: string = 'درخواست'
): Promise<boolean> => {
  triggerHaptic('success');

  const tgUser = (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user) || null;
  const data = await callBackend('/api/notify', { subject, message, type, user: tgUser }, 12000);
  if (data && data.ok) return true;

  // Fallback: open a prefilled Telegram message so the user can send manually.
  try {
    const fullText = `🌟 【 همیار دانشجو | ${type} 】 🌟\n\n📌 موضوع: ${subject}\n\n${message}`;
    const encoded = encodeURIComponent(fullText);
    const direct = `https://t.me/${DEVELOPER_TELEGRAM_ID}?text=${encoded}`;
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(direct);
    } else if (typeof window !== 'undefined') {
      window.open(direct, '_blank');
    }
  } catch { /* ignore */ }
  return false;
};

// -----------------------------------------------------------------------------
//  Telegram WebApp + helpers
// -----------------------------------------------------------------------------
export const initTelegramWebApp = () => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    const tg = (window as any).Telegram.WebApp;
    tg.ready();
    tg.expand();
    return tg;
  }
  return null;
};

export const getTelegramUser = (): TelegramUser => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
    return (window as any).Telegram.WebApp.initDataUnsafe.user;
  }
  // Fallback simulated user for browser preview
  return {
    id: 100200300,
    first_name: 'دانشجوی',
    last_name: 'پزشکی',
    username: 'MedicalStudent_IR',
    is_premium: true,
    photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
  };
};

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
    const hf = (window as any).Telegram.WebApp.HapticFeedback;
    if (style === 'success' || style === 'warning' || style === 'error') {
      hf.notificationOccurred(style);
    } else {
      hf.impactOccurred(style);
    }
  }
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

// Left in for backward-compatibility; no longer calls the Bot API from the browser.
export const logToBotApi = async (text: string) => {
  try {
    console.log('[Telegram]', text);
  } catch { /* ignore */ }
};

// Keep the global Window typing for the Telegram WebApp SDK.
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: TelegramUser;
          auth_date?: number;
          hash?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        expand: () => void;
        close: () => void;
        ready: () => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        openTelegramLink: (url: string) => void;
        openLink: (url: string) => void;
      };
    };
  }
}
