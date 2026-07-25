// =============================================================================
//  /api/ai  —  Multi-Provider AI Proxy (Vercel Serverless Function)
//
//  Provider fail-over chain (each one is tried in order; if a provider errors,
//  times out, returns an HTTP error or an empty answer, the NEXT provider is
//  used automatically):
//
//    1) Google Gemini            (generativelanguage.googleapis.com)
//    2) Mistral AI               (api.mistral.ai)
//    3) AI/ML API                (api.aimlapi.com)
//    4) BazaarLink               (bazaarlink.ai/api/v1)   — OpenAI compatible
//    5) AI Native Studio         (api.ainative.studio)    — OpenAI compatible
//    6) Cloudflare Workers AI    (api.cloudflare.com)
//    7) Ollama                   (ollama.com / self-hosted)
//
//  All calls happen SERVER-SIDE (no browser CORS, keys stay server side).
//  Every key comes from an environment variable — see .env.example / README.
//  If EVERY provider fails, the response is { ok:false, text:'' } so the UI can
//  show a plain "nothing found" message instead of fabricated content.
//
//  GET /api/ai?health=1  ->  runs a tiny probe against every provider and
//  reports which ones are actually working (useful for diagnostics).
// =============================================================================

const env = (k: string, d = '') => (process.env[k] || d).trim();

const GEMINI_API_KEY = env('GEMINI_API_KEY');
const GEMINI_PROJECT_ID = env('GEMINI_PROJECT_ID', '135757225029');
const GEMINI_LOCATION = env('GEMINI_LOCATION', 'us-central1');

const MISTRAL_API_KEY = env('MISTRAL_API_KEY');
const AIMLAPI_KEY = env('AIMLAPI_KEY');
const BAZAARLINK_API_KEY = env('BAZAARLINK_API_KEY');
const BAZAARLINK_BASE_URL = env('BAZAARLINK_BASE_URL', 'https://bazaarlink.ai/api/v1');
const AINATIVE_API_KEY = env('AINATIVE_API_KEY');
const AINATIVE_BASE_URL = env('AINATIVE_BASE_URL', 'https://api.ainative.studio');

const CLOUDFLARE_ACCOUNT_ID = env('CLOUDFLARE_ACCOUNT_ID');
const CLOUDFLARE_API_TOKEN = env('CLOUDFLARE_API_TOKEN');
const OLLAMA_BASE_URL = env('OLLAMA_BASE_URL', 'https://ollama.com');
const OLLAMA_LLM_KEY = env('OLLAMA_LLM_KEY');
const OLLAMA_MODEL = env('OLLAMA_MODEL', 'llama3.1');

// -----------------------------------------------------------------------------
//  helpers
// -----------------------------------------------------------------------------
function readJson(req: any): Promise<any> {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) && !Array.isArray(req.body)) {
      resolve(req.body); return;
    }
    if (typeof req.body === 'string' && req.body.length) {
      try { resolve(JSON.parse(req.body)); } catch { resolve({}); }
      return;
    }
    let body = '';
    req.on('data', (c: any) => { body += c; });
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

const json = (res: any, code: number, obj: any) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
};

async function post(url: string, headers: any, body: any, timeout = 15000): Promise<any | null> {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

const pickChat = (d: any): string =>
  (d?.choices?.[0]?.message?.content ||
   d?.choices?.[0]?.text ||
   d?.message?.content ||
   d?.response ||
   d?.output_text ||
   d?.data?.content ||
   '').toString().trim();

const pickGemini = (d: any): string => {
  const parts = d?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) return parts.map((p: any) => p?.text || '').join('').trim();
  return '';
};

type Provider = { name: string; run: (sys: string, user: string, timeout: number) => Promise<string> };

// -----------------------------------------------------------------------------
//  Provider implementations (in fail-over order)
// -----------------------------------------------------------------------------
const providers: Provider[] = [
  {
    name: 'Google Gemini',
    run: async (sys, user, t) => {
      if (!GEMINI_API_KEY) return '';
      const payload = {
        systemInstruction: { parts: [{ text: sys }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
      };
      for (const model of ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-flash']) {
        const base = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        // header-style auth (works for both AI-Studio and the new AQ.* keys)
        let d = await post(base, { 'X-goog-api-key': GEMINI_API_KEY }, payload, t);
        let txt = pickGemini(d);
        if (txt) return txt;
        // query-string auth (classic AI Studio keys)
        d = await post(`${base}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {}, payload, t);
        txt = pickGemini(d);
        if (txt) return txt;
      }
      // Vertex AI project endpoint
      for (const model of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
        const url = `https://${GEMINI_LOCATION}-aiplatform.googleapis.com/v1/projects/${GEMINI_PROJECT_ID}/locations/${GEMINI_LOCATION}/publishers/google/models/${model}:generateContent`;
        const d = await post(url, { Authorization: `Bearer ${GEMINI_API_KEY}` }, payload, t);
        const txt = pickGemini(d);
        if (txt) return txt;
      }
      return '';
    },
  },
  {
    name: 'Mistral AI',
    run: async (sys, user, t) => {
      if (!MISTRAL_API_KEY) return '';
      for (const model of ['mistral-large-latest', 'mistral-small-latest', 'open-mistral-nemo']) {
        const d = await post('https://api.mistral.ai/v1/chat/completions',
          { Authorization: `Bearer ${MISTRAL_API_KEY}` },
          { model, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] }, t);
        const txt = pickChat(d);
        if (txt) return txt;
      }
      return '';
    },
  },
  {
    name: 'AI/ML API',
    run: async (sys, user, t) => {
      if (!AIMLAPI_KEY) return '';
      for (const model of ['gpt-4o-mini', 'openai/gpt-4o-mini', 'mistralai/Mistral-7B-Instruct-v0.2']) {
        const d = await post('https://api.aimlapi.com/v1/chat/completions',
          { Authorization: `Bearer ${AIMLAPI_KEY}` },
          { model, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] }, t);
        const txt = pickChat(d);
        if (txt) return txt;
      }
      return '';
    },
  },
  {
    name: 'BazaarLink AI',
    run: async (sys, user, t) => {
      if (!BAZAARLINK_API_KEY) return '';
      const base = BAZAARLINK_BASE_URL.replace(/\/+$/, '');
      for (const model of ['gpt-4o-mini', 'gpt-4o', 'llama-3.1-70b']) {
        const d = await post(`${base}/chat/completions`,
          { Authorization: `Bearer ${BAZAARLINK_API_KEY}` },
          { model, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] }, t);
        const txt = pickChat(d);
        if (txt) return txt;
      }
      return '';
    },
  },
  {
    name: 'AI Native Studio',
    run: async (sys, user, t) => {
      if (!AINATIVE_API_KEY) return '';
      const base = AINATIVE_BASE_URL.replace(/\/+$/, '');
      const bodies = { messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] };
      for (const url of [`${base}/api/v1/chat/completions`, `${base}/v1/chat/completions`]) {
        for (const model of ['gpt-4o-mini', 'default']) {
          const d = await post(url,
            { Authorization: `Bearer ${AINATIVE_API_KEY}`, 'X-API-Key': AINATIVE_API_KEY },
            { model, ...bodies }, t);
          const txt = pickChat(d);
          if (txt) return txt;
        }
      }
      return '';
    },
  },
  {
    name: 'Cloudflare Workers AI',
    run: async (sys, user, t) => {
      if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) return '';
      for (const model of ['@cf/meta/llama-3.1-8b-instruct', '@cf/meta/llama-3-8b-instruct']) {
        const d = await post(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`,
          { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
          { messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] }, t);
        const txt = (d?.result?.response || '').toString().trim();
        if (txt) return txt;
      }
      return '';
    },
  },
  {
    name: 'Ollama',
    run: async (sys, user, t) => {
      const base = OLLAMA_BASE_URL.replace(/\/+$/, '');
      const headers: any = {};
      if (OLLAMA_LLM_KEY) headers.Authorization = `Bearer ${OLLAMA_LLM_KEY}`;
      const msgs = [{ role: 'system', content: sys }, { role: 'user', content: user }];
      for (const ep of [
        { url: `${base}/api/chat`, body: { model: OLLAMA_MODEL, messages: msgs, stream: false } },
        { url: `${base}/v1/chat/completions`, body: { model: OLLAMA_MODEL, messages: msgs, stream: false } },
      ]) {
        const d = await post(ep.url, headers, ep.body, t);
        const txt = pickChat(d);
        if (txt) return txt;
      }
      return '';
    },
  },
];

// -----------------------------------------------------------------------------
//  Handler
// -----------------------------------------------------------------------------
export default async function handler(req: any, res: any) {
  // ---- health check: which providers are alive right now? --------------------
  if (req.method === 'GET') {
    const results = await Promise.all(providers.map(async (p) => {
      const started = Date.now();
      let text = '';
      try { text = await p.run('You are a helper.', 'Reply with the single word: OK', 12000); } catch { text = ''; }
      return { provider: p.name, ok: !!text, ms: Date.now() - started, sample: text.slice(0, 60) };
    }));
    json(res, 200, { ok: results.some(r => r.ok), providers: results });
    return;
  }

  if (req.method !== 'POST') { json(res, 405, { error: 'Method Not Allowed' }); return; }

  const body = await readJson(req);
  const prompt = String(body.prompt || '').trim();
  const systemInstruction = String(body.systemInstruction || 'You are an expert clinical pharmacology assistant.').trim();
  const timeout = Math.min(Number(body.timeout) || 15000, 25000);

  if (!prompt) { json(res, 400, { error: 'prompt is required' }); return; }

  const tried: string[] = [];
  for (const p of providers) {
    try {
      const text = await p.run(systemInstruction, prompt, timeout);
      if (text) { json(res, 200, { ok: true, text, provider: p.name, tried }); return; }
    } catch { /* keep going */ }
    tried.push(p.name);
  }

  // Every provider failed -> tell the client honestly. NO fabricated content.
  json(res, 200, { ok: false, text: '', provider: '', tried });
}
