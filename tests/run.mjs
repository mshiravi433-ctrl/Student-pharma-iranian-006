// =============================================================================
//  Endpoint verification suite — run with:  node tests/run.mjs
//  Transpiles api/*.ts with esbuild, then exercises every provider branch
//  against a scriptable fetch mock (no outbound network required).
// =============================================================================
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { installFetch, setRouter, invoke, calls, assert, ok, section } from './apiTest.mjs';

// ---- env keys used by the tests --------------------------------------------
Object.assign(process.env, {
  GEMINI_API_KEY: 'TEST_GEMINI',
  GEMINI_PROJECT_ID: '135757225029',
  GEMINI_LOCATION: 'us-central1',
  MISTRAL_API_KEY: 'TEST_MISTRAL',
  AIMLAPI_KEY: 'TEST_AIML',
  BAZAARLINK_API_KEY: 'TEST_BAZAAR',
  BAZAARLINK_BASE_URL: 'https://bazaarlink.ai/api/v1',
  AINATIVE_API_KEY: 'TEST_AINATIVE',
  AINATIVE_BASE_URL: 'https://api.ainative.studio',
  CLOUDFLARE_ACCOUNT_ID: 'acct123',
  CLOUDFLARE_API_TOKEN: 'TEST_CF',
  OLLAMA_BASE_URL: 'https://ollama.com',
  OLLAMA_LLM_KEY: 'TEST_OLLAMA',
  OLLAMA_MODEL: 'llama3.1',
  APIECO_BASE_URL: 'https://api.apieco.ir/apitalk/medicine-api',
  APIECO_TOKEN: 'TEST_APIECO',
  OPEN_FDA_API_KEY: 'TEST_FDA',
});

const dir = mkdtempSync(join(tmpdir(), 'apitest-'));
let loadSeq = 0;
async function load(file) {
  // unique outfile per call so ESM module caching never hides an env change
  const out = join(dir, file.replace(/[\/.]/g, '_') + '_' + (loadSeq++) + '.mjs');
  await build({ entryPoints: [file], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'silent' });
  return (await import(pathToFileURL(out).href)).default;
}

const aiHandler = await load('api/ai.ts');
const drugHandler = await load('api/drug.ts');

let failures = 0;
async function test(name, fn) {
  try { await fn(); ok(name); }
  catch (e) { failures++; console.log(`  \u001b[31m✗ ${name}\u001b[0m\n      ${e.message}`); }
}

const geminiOk = { candidates: [{ content: { parts: [{ text: 'GEMINI ANSWER' }] } }] };
const chatOk = (t) => ({ choices: [{ message: { content: t } }] });

// =============================================================================
section('api/ai — each provider is called with a correct, spec-compliant request');

await test('Gemini: correct endpoint, X-goog-api-key header and contents payload', async () => {
  setRouter(() => ({ status: 200, body: geminiOk }));
  const r = await invoke(aiHandler, 'POST', { prompt: 'metformin', systemInstruction: 'sys' });
  const c = calls[0];
  assert.match(c.url, /^https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-flash-latest:generateContent$/);
  assert.equal(c.method, 'POST');
  assert.equal(c.headers['X-goog-api-key'], 'TEST_GEMINI');
  assert.equal(c.headers['Content-Type'], 'application/json');
  assert.equal(c.body.contents[0].parts[0].text, 'metformin');
  assert.equal(c.body.systemInstruction.parts[0].text, 'sys');
  assert.equal(r.json.ok, true);
  assert.equal(r.json.text, 'GEMINI ANSWER');
  assert.equal(r.json.provider, 'Google Gemini');
});

await test('Gemini: falls back to ?key= query auth when the header form is rejected', async () => {
  setRouter((c) => (c.url.includes('?key=TEST_GEMINI') ? { status: 200, body: geminiOk } : { status: 401, body: {} }));
  const r = await invoke(aiHandler, 'POST', { prompt: 'x' });
  assert.equal(r.json.provider, 'Google Gemini');
  assert.ok(calls.some((c) => c.url.includes('?key=TEST_GEMINI')));
});

await test('Gemini: falls back to the Vertex AI project endpoint (Bearer auth)', async () => {
  setRouter((c) => (c.url.includes('aiplatform.googleapis.com')
    ? { status: 200, body: geminiOk }
    : { status: 403, body: {} }));
  const r = await invoke(aiHandler, 'POST', { prompt: 'x' });
  const v = calls.find((c) => c.url.includes('aiplatform.googleapis.com'));
  assert.ok(v, 'vertex endpoint never called');
  assert.match(v.url, /projects\/135757225029\/locations\/us-central1/);
  assert.equal(v.headers.Authorization, 'Bearer TEST_GEMINI');
  assert.equal(r.json.provider, 'Google Gemini');
});

await test('Mistral: POST /v1/chat/completions with Bearer key and mistral-large-latest', async () => {
  setRouter((c) => (c.url.includes('api.mistral.ai') ? { status: 200, body: chatOk('MISTRAL ANSWER') } : { status: 500, body: {} }));
  const r = await invoke(aiHandler, 'POST', { prompt: 'p', systemInstruction: 's' });
  const m = calls.find((c) => c.url.includes('api.mistral.ai'));
  assert.equal(m.url, 'https://api.mistral.ai/v1/chat/completions');
  assert.equal(m.headers.Authorization, 'Bearer TEST_MISTRAL');
  assert.equal(m.body.model, 'mistral-large-latest');
  assert.deepEqual(m.body.messages, [{ role: 'system', content: 's' }, { role: 'user', content: 'p' }]);
  assert.equal(r.json.text, 'MISTRAL ANSWER');
  assert.equal(r.json.provider, 'Mistral AI');
});

await test('Mistral: tries smaller models when mistral-large-latest is unavailable', async () => {
  setRouter((c) => {
    if (!c.url.includes('api.mistral.ai')) return { status: 500, body: {} };
    return c.body.model === 'mistral-small-latest' ? { status: 200, body: chatOk('SMALL') } : { status: 429, body: {} };
  });
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  assert.equal(r.json.text, 'SMALL');
  assert.equal(r.json.provider, 'Mistral AI');
});

await test('AI/ML API: POST api.aimlapi.com/v1/chat/completions with Bearer key', async () => {
  setRouter((c) => (c.url.includes('aimlapi.com') ? { status: 200, body: chatOk('AIML ANSWER') } : { status: 500, body: {} }));
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  const a = calls.find((c) => c.url.includes('aimlapi.com'));
  assert.equal(a.url, 'https://api.aimlapi.com/v1/chat/completions');
  assert.equal(a.headers.Authorization, 'Bearer TEST_AIML');
  assert.equal(r.json.provider, 'AI/ML API');
});

await test('BazaarLink: OpenAI-compatible base_url + Bearer sk-bl key', async () => {
  setRouter((c) => (c.url.includes('bazaarlink.ai') ? { status: 200, body: chatOk('BAZAAR ANSWER') } : { status: 500, body: {} }));
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  const b = calls.find((c) => c.url.includes('bazaarlink.ai'));
  assert.equal(b.url, 'https://bazaarlink.ai/api/v1/chat/completions');
  assert.equal(b.headers.Authorization, 'Bearer TEST_BAZAAR');
  assert.equal(r.json.provider, 'BazaarLink AI');
});

await test('AI Native Studio: tries /api/v1 and /v1 with both auth header styles', async () => {
  setRouter((c) => (c.url === 'https://api.ainative.studio/v1/chat/completions'
    ? { status: 200, body: chatOk('AINATIVE ANSWER') }
    : { status: 500, body: {} }));
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  const n = calls.filter((c) => c.url.includes('ainative.studio'));
  assert.ok(n.some((c) => c.url === 'https://api.ainative.studio/api/v1/chat/completions'));
  assert.equal(n[0].headers.Authorization, 'Bearer TEST_AINATIVE');
  assert.equal(n[0].headers['X-API-Key'], 'TEST_AINATIVE');
  assert.equal(r.json.provider, 'AI Native Studio');
});

await test('Cloudflare Workers AI: account-scoped run URL + result.response parsing', async () => {
  setRouter((c) => (c.url.includes('api.cloudflare.com')
    ? { status: 200, body: { result: { response: 'CF ANSWER' } } }
    : { status: 500, body: {} }));
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  const cf = calls.find((c) => c.url.includes('api.cloudflare.com'));
  assert.equal(cf.url, 'https://api.cloudflare.com/client/v4/accounts/acct123/ai/run/@cf/meta/llama-3.1-8b-instruct');
  assert.equal(cf.headers.Authorization, 'Bearer TEST_CF');
  assert.equal(r.json.text, 'CF ANSWER');
  assert.equal(r.json.provider, 'Cloudflare Workers AI');
});

await test('Ollama: native /api/chat then OpenAI-compatible /v1/chat/completions', async () => {
  setRouter((c) => (c.url === 'https://ollama.com/v1/chat/completions'
    ? { status: 200, body: chatOk('OLLAMA ANSWER') }
    : { status: 500, body: {} }));
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  const native = calls.find((c) => c.url === 'https://ollama.com/api/chat');
  assert.ok(native, 'native /api/chat not attempted first');
  assert.equal(native.headers.Authorization, 'Bearer TEST_OLLAMA');
  assert.equal(native.body.stream, false);
  assert.equal(r.json.provider, 'Ollama');
});

// =============================================================================
section('api/ai — fail-over chain');

await test('shifts to the next provider on HTTP error, and reports who answered', async () => {
  setRouter((c) => {
    if (c.url.includes('googleapis.com')) return { status: 500, body: {} };
    if (c.url.includes('mistral.ai')) return { status: 401, body: {} };
    if (c.url.includes('aimlapi.com')) return { status: 200, body: chatOk('THIRD PROVIDER') };
    return { status: 500, body: {} };
  });
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  assert.equal(r.json.text, 'THIRD PROVIDER');
  assert.equal(r.json.provider, 'AI/ML API');
  assert.deepEqual(r.json.tried, ['Google Gemini', 'Mistral AI']);
});

await test('shifts on thrown network errors', async () => {
  setRouter((c) => {
    if (c.url.includes('bazaarlink.ai')) return { status: 200, body: chatOk('SURVIVED') };
    return 'throw';
  });
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  assert.equal(r.json.provider, 'BazaarLink AI');
});

await test('shifts on timeouts', async () => {
  setRouter((c) => {
    if (c.url.includes('ollama.com')) return { status: 200, body: chatOk('LAST ONE') };
    return 'timeout';
  });
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  assert.equal(r.json.provider, 'Ollama');
  assert.equal(r.json.ok, true);
});

await test('shifts when a provider returns HTTP 200 but an EMPTY answer', async () => {
  setRouter((c) => {
    if (c.url.includes('googleapis.com')) return { status: 200, body: { candidates: [{ content: { parts: [{ text: '   ' }] } }] } };
    if (c.url.includes('mistral.ai')) return { status: 200, body: chatOk('') };
    if (c.url.includes('aimlapi.com')) return { status: 200, body: chatOk('NON EMPTY') };
    return { status: 500, body: {} };
  });
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  assert.equal(r.json.text, 'NON EMPTY');
  assert.equal(r.json.provider, 'AI/ML API');
});

await test('all 7 providers down -> ok:false with empty text (no fabricated content)', async () => {
  setRouter(() => ({ status: 503, body: {} }));
  const r = await invoke(aiHandler, 'POST', { prompt: 'p' });
  assert.equal(r.status, 200);
  assert.equal(r.json.ok, false);
  assert.equal(r.json.text, '');
  assert.deepEqual(r.json.tried, ['Google Gemini', 'Mistral AI', 'AI/ML API', 'BazaarLink AI', 'AI Native Studio', 'Cloudflare Workers AI', 'Ollama']);
});

await test('a provider with no configured key is skipped, not crashed on', async () => {
  const saved = process.env.MISTRAL_API_KEY;
  process.env.MISTRAL_API_KEY = '';
  const fresh = await load('api/ai.ts');
  setRouter((c) => (c.url.includes('aimlapi.com') ? { status: 200, body: chatOk('OK') } : { status: 500, body: {} }));
  const r = await invoke(fresh, 'POST', { prompt: 'p' });
  assert.ok(!calls.some((c) => c.url.includes('mistral.ai')), 'unkeyed provider was still called');
  assert.equal(r.json.provider, 'AI/ML API');
  process.env.MISTRAL_API_KEY = saved;
});

await test('validation: missing prompt -> 400; GET health probe lists every provider', async () => {
  setRouter(() => ({ status: 500, body: {} }));
  const bad = await invoke(aiHandler, 'POST', {});
  assert.equal(bad.status, 400);

  setRouter((c) => (c.url.includes('mistral.ai') ? { status: 200, body: chatOk('OK') } : { status: 500, body: {} }));
  const health = await invoke(aiHandler, 'GET');
  assert.equal(health.json.providers.length, 7);
  assert.equal(health.json.ok, true);
  const m = health.json.providers.find((p) => p.provider === 'Mistral AI');
  assert.equal(m.ok, true);
  assert.equal(health.json.providers.find((p) => p.provider === 'Ollama').ok, false);
});

// =============================================================================
section('api/drug — Persian source, OpenFDA, RxNorm retry, honest empty result');

const apiecoBody = {
  data: [{ name_fa: 'متفورمین', name_en: 'Metformin', usage: 'درمان دیابت نوع ۲', dose: '۵۰۰ میلی‌گرم دو بار در روز' }],
};

await test('apieco is queried first with the documented get_by_formula endpoint', async () => {
  setRouter((c) => (c.url.endsWith('/get_by_formula') ? { status: 200, body: apiecoBody } : { status: 500, body: {} }));
  const r = await invoke(drugHandler, 'POST', { query: 'metformin' });
  const a = calls[0];
  assert.equal(a.url, 'https://api.apieco.ir/apitalk/medicine-api/get_by_formula');
  assert.equal(a.method, 'POST');
  assert.equal(a.headers['apieco-key'], 'TEST_APIECO');
  assert.deepEqual(a.body, { formula: 'metformin' });
  assert.equal(r.json.found, true);
  assert.equal(r.json.data.persian.nameFa, 'متفورمین');
  assert.equal(r.json.data.persian.indications, 'درمان دیابت نوع ۲');
  assert.ok(!calls.some((c) => c.url.includes('api.fda.gov')), 'should not hit FDA when apieco answered');
});

await test('falls back to OpenFDA (exact phrase search first) when apieco fails', async () => {
  setRouter((c) => {
    if (c.url.includes('apieco')) return 'throw';
    if (c.url.includes('api.fda.gov')) {
      return { status: 200, body: { results: [{
        openfda: { brand_name: ['Glucophage'], generic_name: ['metformin hydrochloride'], pharm_class_epc: ['Biguanide'] },
        indications_and_usage: ['Adjunct to diet in type 2 diabetes.'],
        dosage_and_administration: ['500 mg twice daily with meals.'],
        adverse_reactions: ['Diarrhea, nausea.'],
      }] } };
    }
    return { status: 500, body: {} };
  });
  const r = await invoke(drugHandler, 'POST', { query: 'metformin' });
  const f = calls.find((c) => c.url.includes('api.fda.gov'));
  assert.match(f.url, /api_key=TEST_FDA/);
  assert.match(f.url, /openfda\.brand_name%3A|openfda\.brand_name:/);
  assert.equal(r.json.found, true);
  assert.equal(r.json.data.brandName, 'Glucophage');
  assert.equal(r.json.data.genericName, 'metformin hydrochloride');
  assert.equal(r.json.data.purpose, 'Adjunct to diet in type 2 diabetes.');
  assert.equal(r.json.data.pharmClass, 'Biguanide');
});

await test('OpenFDA hit with no usable text is rejected (no empty monograph)', async () => {
  setRouter((c) => {
    if (c.url.includes('apieco')) return { status: 500, body: {} };
    if (c.url.includes('api.fda.gov')) return { status: 200, body: { results: [{ openfda: { brand_name: ['Ghost'] } }] } };
    return { status: 200, body: {} };
  });
  const r = await invoke(drugHandler, 'POST', { query: 'ghost' });
  assert.equal(r.json.found, false);
});

await test('RxNorm resolves a misspelling and OpenFDA is retried with the corrected name', async () => {
  setRouter((c) => {
    if (c.url.includes('apieco')) return { status: 500, body: {} };
    if (c.url.includes('rxnav.nlm.nih.gov')) {
      return { status: 200, body: { drugGroup: { conceptGroup: [{}, { conceptProperties: [{ name: 'ibuprofen 200 MG' }] }] } } };
    }
    if (c.url.includes('api.fda.gov')) {
      const corrected = decodeURIComponent(c.url).includes('ibuprofen');
      return corrected
        ? { status: 200, body: { results: [{ openfda: { brand_name: ['Advil'], generic_name: ['ibuprofen'] }, purpose: ['Pain reliever'] }] } }
        : { status: 404, body: {} };
    }
    return { status: 500, body: {} };
  });
  const r = await invoke(drugHandler, 'POST', { query: 'ibuprofn' });
  assert.equal(r.json.found, true);
  assert.equal(r.json.data.brandName, 'Advil');
});

await test('every source down -> { found:false } and never throws', async () => {
  setRouter(() => 'throw');
  const r = await invoke(drugHandler, 'POST', { query: 'zzzzz' });
  assert.equal(r.status, 200);
  assert.equal(r.json.found, false);
});

await test('validation: short/missing query -> 400, wrong method -> 405', async () => {
  setRouter(() => ({ status: 200, body: {} }));
  assert.equal((await invoke(drugHandler, 'POST', { query: 'a' })).status, 400);
  assert.equal((await invoke(drugHandler, 'GET', {})).status, 405);
  assert.equal((await invoke(aiHandler, 'DELETE', {})).status, 405);
});

// =============================================================================
section('client search flow — no fabricated content on failure');

const { searchMedical } = await (async () => {
  const out = join(dir, 'drugsData.mjs');
  await build({
    entryPoints: ['src/data/drugsData.ts'], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'silent',
    // route the browser helpers to our local endpoints instead of window.fetch('/api/..')
  });
  return import(pathToFileURL(out).href);
})();

// searchMedical calls fetch('/api/ai') and fetch('/api/drug'); wire those to the handlers.
function wireClient(routerFn) {
  setRouter(routerFn);
  const inner = global.fetch;
  global.fetch = async (url, opts = {}) => {
    const u = String(url);
    if (u === '/api/drug' || u === '/api/ai') {
      const body = opts.body ? JSON.parse(opts.body) : undefined;
      const handler = u === '/api/ai' ? aiHandler : drugHandler;
      const saved = global.fetch;
      global.fetch = inner;                       // handlers use the mocked upstream
      const r = await invoke(handler, opts.method || 'POST', body);
      global.fetch = saved;
      return { ok: true, status: r.status, json: async () => r.json };
    }
    return inner(url, opts);
  };
}

await test('known drug: returns a real monograph sourced from the Persian API', async () => {
  wireClient((c) => (c.url.endsWith('/get_by_formula') ? { status: 200, body: apiecoBody } : { status: 500, body: {} }));
  const r = await searchMedical('metformin');
  assert.equal(r.found, true);
  assert.equal(r.drug.nameFa, 'متفورمین');
  assert.match(r.provider, /apieco|فارسی/);
});

await test('unknown term with every source down: found=false, no drug, no protocol', async () => {
  wireClient(() => ({ status: 503, body: {} }));
  const r = await searchMedical('asdkjhqwe');
  assert.equal(r.found, false);
  assert.equal(r.drug, undefined);
  assert.equal(r.protocol, undefined);
  assert.equal(r.reason, 'ai-down');
});

await test('AI replying {"kind":"unknown"} yields found=false rather than filler text', async () => {
  wireClient((c) => {
    if (c.url.includes('googleapis.com')) return { status: 200, body: { candidates: [{ content: { parts: [{ text: '{"kind":"unknown"}' }] } }] } };
    return { status: 503, body: {} };
  });
  const r = await searchMedical('qqqqzzz');
  assert.equal(r.found, false);
  assert.equal(r.reason, 'no-result');
});

await test('disease query answered by a fallback AI provider builds a real protocol', async () => {
  const protocolJson = JSON.stringify({
    kind: 'disease', nameFa: 'دیابت نوع ۲', nameEn: 'Type 2 Diabetes',
    overviewFa: 'اختلال متابولیک مزمن.', overviewEn: 'Chronic metabolic disorder.',
    firstLine: [{ drugName: 'Metformin', dosage: '500 mg', frequency: 'BID', duration: 'long term', notesFa: 'با غذا', notesEn: 'With food' }],
    herbal: [{ name: 'دارچین', usage: 'روزانه', benefit: 'کمک به کنترل قند' }],
    lifestyleFa: ['ورزش منظم'], lifestyleEn: ['Regular exercise'],
  });
  wireClient((c) => {
    if (c.url.includes('googleapis.com') || c.url.includes('mistral.ai')) return { status: 500, body: {} };
    if (c.url.includes('aimlapi.com')) return { status: 200, body: chatOk('```json\n' + protocolJson + '\n```') };
    return { status: 500, body: {} };
  });
  const r = await searchMedical('دیابت');
  assert.equal(r.found, true);
  assert.equal(r.protocol.diseaseNameFa, 'دیابت نوع ۲');
  assert.equal(r.protocol.firstLineTherapy[0].drugName, 'Metformin');
  assert.equal(r.protocol.adjunctiveHerbalTherapy[0].name, 'دارچین');
  assert.equal(r.provider, 'AI/ML API');
});

console.log(failures === 0
  ? '\n\u001b[32mAll checks passed.\u001b[0m'
  : `\n\u001b[31m${failures} check(s) failed.\u001b[0m`);
process.exit(failures === 0 ? 0 : 1);
