// =============================================================================
//  /api/ai  —  Multi-Model AI Proxy (Vercel Serverless Function)
//  Tries:  Google Gemini (AI Studio + Vertex AI)  ->  Cloudflare Workers AI  ->  Ollama
//  All calls happen SERVER-SIDE so there is no browser CORS and API keys stay secret.
//  Secrets fall back to the values supplied by the project owner, but it is
//  recommended to set them as Vercel Environment Variables (see README).
// =============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6I2DPvZkStsgvlm0GQlsEEnmL-h-oIEnNl5sj67aG-t2Q';
const GEMINI_PROJECT_ID = process.env.GEMINI_PROJECT_ID || '135757225029';
const GEMINI_LOCATION = process.env.GEMINI_LOCATION || 'us-central1';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '80ef41399695533ba941e26f8d0cb5a0';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '52157d6e5c6e7abe4c9a1d552cf5ce9e';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'https://ollama.com';
const OLLAMA_LLM_KEY = process.env.OLLAMA_LLM_KEY || '2f08ea46ed4e46a7a2e131d82abe7717.ftWlXS5lpXoVEE45TkJw-pzV';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1';

function readJson(req: any): Promise<any> {
  return new Promise((resolve) => {
    // Already-parsed plain object (some runtimes).
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) && !Array.isArray(req.body)) {
      resolve(req.body);
      return;
    }
    // Already a JSON string.
    if (typeof req.body === 'string' && req.body.length) {
      try { resolve(JSON.parse(req.body)); } catch { resolve({}); }
      return;
    }
    // Otherwise read the raw stream (Vercel Node functions hand an IncomingMessage).
    let body = '';
    req.on('data', (chunk: any) => { body += chunk; });
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

const json = (res: any, code: number, obj: any) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { json(res, 405, { error: 'Method Not Allowed' }); return; }

  const body = await readJson(req);
  const prompt = String(body.prompt || '').trim();
  const systemInstruction = String(body.systemInstruction || 'You are an expert medical AI assistant.').trim();

  if (!prompt) { json(res, 400, { error: 'prompt is required' }); return; }

  const fullPrompt = `${systemInstruction}\n\nUser query: ${prompt}\nProvide a concise, highly structured medical response in bilingual Persian and English.`;

  // ---------------------------------------------------------------------------
  // 1) Google Gemini — AI Studio endpoint (Google AI Studio keys)
  // ---------------------------------------------------------------------------
  try {
    for (const model of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
        signal: AbortSignal.timeout(6000),
      });
      if (r.ok) {
        const d: any = await r.json();
        const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (t) { json(res, 200, { text: t, provider: `Google Gemini AI (${model})` }); return; }
      }
    }
  } catch { /* try next provider */ }

  // ---------------------------------------------------------------------------
  // 1b) Google Gemini — Vertex AI endpoint (project-bound keys)
  // ---------------------------------------------------------------------------
  try {
    for (const model of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
      const url = `https://${GEMINI_LOCATION}-aiplatform.googleapis.com/v1/projects/${GEMINI_PROJECT_ID}/locations/${GEMINI_LOCATION}/publishers/google/models/${model}:generateContent`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GEMINI_API_KEY}` },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
        signal: AbortSignal.timeout(6000),
      });
      if (r.ok) {
        const d: any = await r.json();
        const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (t) { json(res, 200, { text: t, provider: `Google Vertex AI (${model})` }); return; }
      }
    }
  } catch { /* try next provider */ }

  // ---------------------------------------------------------------------------
  // 2) Cloudflare Workers AI (Llama 3 / 3.1 Instruct)
  // ---------------------------------------------------------------------------
  try {
    for (const model of ['@cf/meta/llama-3.1-8b-instruct', '@cf/meta/llama-3-8b-instruct']) {
      const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` },
        body: JSON.stringify({ messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: prompt }] }),
        signal: AbortSignal.timeout(6000),
      });
      if (r.ok) {
        const d: any = await r.json();
        const t = d?.result?.response;
        if (t) { json(res, 200, { text: t, provider: `Cloudflare Workers AI (${model})` }); return; }
      }
    }
  } catch { /* try next provider */ }

  // ---------------------------------------------------------------------------
  // 3) Ollama (hosted or self-hosted). Bearer key is optional.
  // ---------------------------------------------------------------------------
  try {
    const base = OLLAMA_BASE_URL.replace(/\/+$/, '');
    const url = `${base}/api/chat`;
    const headers: any = { 'Content-Type': 'application/json' };
    if (OLLAMA_LLM_KEY) headers['Authorization'] = `Bearer ${OLLAMA_LLM_KEY}`;
    const r = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: prompt }],
        stream: false,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (r.ok) {
      const d: any = await r.json();
      const t = d?.message?.content || d?.response;
      if (t) { json(res, 200, { text: t, provider: `Ollama AI (${OLLAMA_MODEL})` }); return; }
    }
  } catch { /* fall through to fallback */ }

  // ---------------------------------------------------------------------------
  // Fallback — all providers unreachable. Return empty text so the client can
  // show its built-in medical synthesizer instead of breaking.
  // ---------------------------------------------------------------------------
  json(res, 200, { text: '', provider: 'Intelligent AI Medical Engine (Fallback)' });
}
