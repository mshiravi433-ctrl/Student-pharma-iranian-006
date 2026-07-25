// =============================================================================
//  LIVE smoke test — hits the real provider APIs with your real keys.
//  Run it where outbound internet is available:
//
//      node --env-file=.env.local.keys.txt tests/live.mjs
//      # or:  GEMINI_API_KEY=... MISTRAL_API_KEY=... node tests/live.mjs
//
//  It prints a table showing which AI engines answer and which drug sources
//  return data, so you can confirm every key is valid before/after deploying.
// =============================================================================
const env = (k, d = '') => (process.env[k] || d).trim();

const GEMINI_API_KEY = env('GEMINI_API_KEY');
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
const APIECO_BASE = env('APIECO_BASE_URL', 'https://api.apieco.ir/apitalk/medicine-api').replace(/\/+$/, '');
const APIECO_TOKEN = env('APIECO_TOKEN');
const OPEN_FDA_API_KEY = env('OPEN_FDA_API_KEY');

const PROMPT = 'Reply with the single word: OK';
const T = 20000;

async function post(url, headers, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(T),
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = null; }
  return { status: r.status, ok: r.ok, data, text };
}

const chat = (d) => (d?.choices?.[0]?.message?.content || d?.message?.content || d?.response || '').trim();

const checks = [
  ['Google Gemini', async () => {
    if (!GEMINI_API_KEY) return { skip: true };
    const r = await post('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
      { 'X-goog-api-key': GEMINI_API_KEY },
      { contents: [{ parts: [{ text: PROMPT }] }] });
    const t = r.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return { ok: !!t, status: r.status, answer: t, err: r.data?.error?.message };
  }],
  ['Mistral AI', async () => {
    if (!MISTRAL_API_KEY) return { skip: true };
    const r = await post('https://api.mistral.ai/v1/chat/completions',
      { Authorization: `Bearer ${MISTRAL_API_KEY}` },
      { model: 'mistral-large-latest', messages: [{ role: 'user', content: PROMPT }] });
    return { ok: !!chat(r.data), status: r.status, answer: chat(r.data), err: r.data?.message || r.data?.error?.message };
  }],
  ['AI/ML API', async () => {
    if (!AIMLAPI_KEY) return { skip: true };
    const r = await post('https://api.aimlapi.com/v1/chat/completions',
      { Authorization: `Bearer ${AIMLAPI_KEY}` },
      { model: 'gpt-4o-mini', messages: [{ role: 'user', content: PROMPT }] });
    return { ok: !!chat(r.data), status: r.status, answer: chat(r.data), err: r.data?.message || r.data?.error?.message };
  }],
  ['BazaarLink AI', async () => {
    if (!BAZAARLINK_API_KEY) return { skip: true };
    const r = await post(`${BAZAARLINK_BASE_URL.replace(/\/+$/, '')}/chat/completions`,
      { Authorization: `Bearer ${BAZAARLINK_API_KEY}` },
      { model: 'gpt-4o-mini', messages: [{ role: 'user', content: PROMPT }] });
    return { ok: !!chat(r.data), status: r.status, answer: chat(r.data), err: r.data?.error?.message || r.text?.slice(0, 90) };
  }],
  ['AI Native Studio', async () => {
    if (!AINATIVE_API_KEY) return { skip: true };
    const base = AINATIVE_BASE_URL.replace(/\/+$/, '');
    for (const url of [`${base}/api/v1/chat/completions`, `${base}/v1/chat/completions`]) {
      try {
        const r = await post(url, { Authorization: `Bearer ${AINATIVE_API_KEY}`, 'X-API-Key': AINATIVE_API_KEY },
          { model: 'gpt-4o-mini', messages: [{ role: 'user', content: PROMPT }] });
        if (chat(r.data)) return { ok: true, status: r.status, answer: chat(r.data) };
        var last = r;
      } catch (e) { var last = { status: 0, text: e.message }; }
    }
    return { ok: false, status: last?.status, err: last?.text?.slice(0, 90) };
  }],
  ['Cloudflare Workers AI', async () => {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) return { skip: true };
    const r = await post(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
      { messages: [{ role: 'user', content: PROMPT }] });
    const t = r.data?.result?.response?.trim();
    return { ok: !!t, status: r.status, answer: t, err: r.data?.errors?.[0]?.message };
  }],
  ['Ollama', async () => {
    const h = OLLAMA_LLM_KEY ? { Authorization: `Bearer ${OLLAMA_LLM_KEY}` } : {};
    const r = await post(`${OLLAMA_BASE_URL.replace(/\/+$/, '')}/api/chat`, h,
      { model: OLLAMA_MODEL, messages: [{ role: 'user', content: PROMPT }], stream: false });
    return { ok: !!chat(r.data), status: r.status, answer: chat(r.data), err: r.data?.error || r.text?.slice(0, 90) };
  }],
  ['apieco medicine API', async () => {
    const h = APIECO_TOKEN ? { 'apieco-key': APIECO_TOKEN } : {};
    const r = await post(`${APIECO_BASE}/get_by_formula`, h, { formula: 'acetaminophen' });
    const has = r.ok && r.data && JSON.stringify(r.data).length > 20;
    return { ok: !!has, status: r.status, answer: JSON.stringify(r.data)?.slice(0, 70), err: !r.ok ? r.text?.slice(0, 90) : undefined };
  }],
  ['OpenFDA label', async () => {
    const key = OPEN_FDA_API_KEY ? `api_key=${OPEN_FDA_API_KEY}&` : '';
    const r = await fetch(`https://api.fda.gov/drug/label.json?${key}search=openfda.generic_name:"ibuprofen"&limit=1`, { signal: AbortSignal.timeout(T) });
    const d = await r.json().catch(() => null);
    const name = d?.results?.[0]?.openfda?.brand_name?.[0];
    return { ok: !!name, status: r.status, answer: name };
  }],
  ['NLM RxNorm', async () => {
    const r = await fetch('https://rxnav.nlm.nih.gov/REST/drugs.json?name=ibuprofen', { signal: AbortSignal.timeout(T) });
    const d = await r.json().catch(() => null);
    const n = d?.drugGroup?.conceptGroup?.find((g) => g?.conceptProperties?.length)?.conceptProperties?.[0]?.name;
    return { ok: !!n, status: r.status, answer: n };
  }],
];

console.log('\nLive provider check (real network, real keys)\n' + '─'.repeat(78));
let live = 0, aiLive = 0;
for (const [name, fn] of checks) {
  const started = Date.now();
  let res;
  try { res = await fn(); } catch (e) { res = { ok: false, err: e.name === 'TimeoutError' ? 'timeout' : e.message }; }
  const ms = Date.now() - started;
  if (res.skip) { console.log(`  ⚪ ${name.padEnd(24)} کلید ست نشده (رد می‌شود)`); continue; }
  if (res.ok) {
    live++;
    if (!name.match(/apieco|OpenFDA|RxNorm/)) aiLive++;
    console.log(`  \x1b[32m✓\x1b[0m ${name.padEnd(24)} ${String(ms).padStart(5)}ms  ${(res.answer || '').replace(/\s+/g, ' ').slice(0, 44)}`);
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${name.padEnd(24)} ${String(ms).padStart(5)}ms  HTTP ${res.status ?? '-'}  ${(res.err || '').replace(/\s+/g, ' ').slice(0, 44)}`);
  }
}
console.log('─'.repeat(78));
console.log(`  موتورهای هوش مصنوعی فعال: ${aiLive}/7   |   منابع دارویی فعال بررسی شد`);
console.log(aiLive > 0
  ? '  ✅ حداقل یک موتور کار می‌کند؛ زنجیره fail-over پاسخ می‌دهد.\n'
  : '  ⚠️  هیچ موتوری پاسخ نداد — کلیدها را در Vercel بررسی کنید.\n');
