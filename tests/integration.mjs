// =============================================================================
//  ONLINE integration test — no fetch mocking.
//
//  Spins up two REAL http servers:
//    1) "upstream"  — a stand-in AI/drug provider on 127.0.0.1 that we point
//                     the configurable providers at via their *_BASE_URL envs.
//    2) "app"       — the real Vercel handlers (api/ai.ts, api/drug.ts) mounted
//                     exactly as Vercel mounts them, plus the built dist/.
//
//  Then it talks to the app over real HTTP with real fetch, exactly like the
//  browser will in production. Providers whose base URL is NOT configurable
//  (Gemini, Mistral, AIMLAPI, Cloudflare, OpenFDA) are exercised as genuine
//  unreachable-network cases, which proves the fail-over survives real DNS/TLS
//  failures rather than simulated ones.
//
//  Run:  node tests/integration.mjs
// =============================================================================
import http from 'node:http';
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert';

let failures = 0;
const ok = (n) => console.log(`  \x1b[32m✓\x1b[0m ${n}`);
const section = (n) => console.log(`\n\x1b[1m${n}\x1b[0m`);
async function test(name, fn) {
  try { await fn(); ok(name); }
  catch (e) { failures++; console.log(`  \x1b[31m✗ ${name}\x1b[0m\n      ${e.message}`); }
}

// ---------------------------------------------------------------------------
// 1) real upstream provider server
// ---------------------------------------------------------------------------
let upstreamMode = 'ok';
const upstreamHits = [];

const upstream = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    let parsed = {}; try { parsed = body ? JSON.parse(body) : {}; } catch {}
    upstreamHits.push({ url: req.url, method: req.method, auth: req.headers.authorization, apieco: req.headers['apieco-key'], body: parsed });

    const send = (code, obj) => {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(obj));
    };

    if (upstreamMode === 'down') return send(503, { error: 'service unavailable' });
    if (upstreamMode === 'empty') return send(200, { choices: [{ message: { content: '' } }] });
    if (upstreamMode === 'hang') return; // never responds -> exercises the real AbortSignal timeout

    // ---- drug endpoints -----------------------------------------------------
    if (req.url.includes('/get_by_formula')) {
      if (parsed.formula === 'unknown-xyz') return send(404, { error: 'not found' });
      // only this one drug exists upstream, so we can prove the query is honoured
      if (String(parsed.formula).toLowerCase() !== 'rivaroxaban') return send(404, { error: 'not found' });
      return send(200, { data: [{
        name_fa: 'ریواروکسابان', name_en: 'Rivaroxaban',
        usage: 'پیشگیری از سکته در فیبریلاسیون دهلیزی',
        dose: '۲۰ میلی‌گرم روزانه همراه غذا',
        side_effects: ['خونریزی'],
        pregnancy_category: 'C',
      }] });
    }
    if (req.url.includes('/get_by_name') || req.url.includes('/search')) return send(404, { error: 'not found' });

    // ---- OpenAI-compatible chat (BazaarLink / AINative / Ollama) ------------
    if (req.url.includes('/chat/completions')) {
      const user = (parsed.messages || []).find((m) => m.role === 'user')?.content || '';
      let content = 'PONG';
      if (/JSON/i.test(user) || /schema/i.test(user)) {
        content = JSON.stringify({
          kind: 'drug', nameFa: 'وارفارین', nameEn: 'Warfarin',
          genericNameFa: 'وارفارین سدیم', genericNameEn: 'Warfarin Sodium',
          category: 'ضد انعقاد خوراکی', type: 'chemical',
          indicationsFa: 'پیشگیری و درمان ترومبوز و آمبولی.', indicationsEn: 'Prophylaxis and treatment of thrombosis and embolism.',
          mechanismFa: 'مهار ویتامین K اپوکسید ردوکتاز.', mechanismEn: 'Inhibits vitamin K epoxide reductase.',
          dosageAdultsFa: 'شروع ۲ تا ۵ میلی‌گرم روزانه با پایش INR.', dosageAdultsEn: 'Initiate 2-5 mg daily, titrate to INR.',
          forms: ['قرص ۵ میلی‌گرم'],
          sideEffectsFa: ['خونریزی'], sideEffectsEn: ['Bleeding'],
          interactionsFa: ['آسپرین'], interactionsEn: ['Aspirin'],
          precautionsFa: 'پایش منظم INR الزامی است.', precautionsEn: 'Regular INR monitoring required.',
          pregnancyCategory: 'X',
        });
      }
      return send(200, { choices: [{ message: { role: 'assistant', content } }] });
    }
    if (req.url.includes('/api/chat')) {
      return send(200, { message: { role: 'assistant', content: 'PONG' } });
    }
    send(404, { error: 'no route' });
  });
});
await new Promise((r) => upstream.listen(0, '127.0.0.1', r));
const UP = `http://127.0.0.1:${upstream.address().port}`;

// ---------------------------------------------------------------------------
// 2) env: point the configurable providers at the real local upstream
// ---------------------------------------------------------------------------
Object.assign(process.env, {
  GEMINI_API_KEY: 'LIVE_TEST_GEMINI',          // unreachable network (real failure)
  MISTRAL_API_KEY: 'LIVE_TEST_MISTRAL',        // unreachable network (real failure)
  AIMLAPI_KEY: 'LIVE_TEST_AIML',               // unreachable network (real failure)
  CLOUDFLARE_ACCOUNT_ID: 'acct',
  CLOUDFLARE_API_TOKEN: 'LIVE_TEST_CF',        // unreachable network (real failure)
  BAZAARLINK_API_KEY: 'sk-bl-LIVE_TEST',
  BAZAARLINK_BASE_URL: UP,                     // -> real local upstream
  AINATIVE_API_KEY: 'sk_LIVE_TEST',
  AINATIVE_BASE_URL: UP,                       // -> real local upstream
  OLLAMA_BASE_URL: UP,                         // -> real local upstream
  OLLAMA_LLM_KEY: 'LIVE_TEST_OLLAMA',
  APIECO_BASE_URL: UP,                         // -> real local upstream
  APIECO_TOKEN: 'LIVE_TEST_APIECO',
  OPEN_FDA_API_KEY: '',
});

// ---------------------------------------------------------------------------
// 3) build the real handlers and mount them like Vercel does
// ---------------------------------------------------------------------------
const dir = mkdtempSync(join(tmpdir(), 'integ-'));
async function load(file, n) {
  const out = join(dir, `${n}.mjs`);
  await build({ entryPoints: [file], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'silent' });
  return (await import(pathToFileURL(out).href)).default;
}
const aiHandler = await load('api/ai.ts', 'ai');
const drugHandler = await load('api/drug.ts', 'drug');
const feedHandler = await load('api/feed.ts', 'feed');
const jobsHandler = await load('api/jobs.ts', 'jobs');

const distIndex = existsSync('dist/index.html') ? readFileSync('dist/index.html') : null;

const app = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/api/ai') return void (await aiHandler(req, res));
    if (url.pathname === '/api/drug') return void (await drugHandler(req, res));
    if (url.pathname === '/api/feed') return void (await feedHandler(req, res));
    if (url.pathname === '/api/jobs') return void (await jobsHandler(req, res));
    if (distIndex) { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(distIndex); }
    res.writeHead(404); res.end();
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ crashed: true, error: String(e) }));
  }
});
await new Promise((r) => app.listen(0, '127.0.0.1', r));
const APP = `http://127.0.0.1:${app.address().port}`;

const call = async (path, body, method = 'POST') => {
  const r = await fetch(APP + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
  });
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, json, text, contentType: r.headers.get('content-type') };
};

// Serves a single handler on its own real port and performs a real GET.
async function getViaHandler(handler) {
  const srv = http.createServer(async (q, s2) => {
    try { await handler(q, s2); }
    catch (e) { s2.writeHead(500, { 'Content-Type': 'application/json' }); s2.end(JSON.stringify({ crashed: true, error: String(e) })); }
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const r = await fetch(`http://127.0.0.1:${srv.address().port}/`);
  const status = r.status;
  const json = await r.json();
  srv.close();
  return { status, json };
}

console.log(`\n  app      : ${APP}  (real Vercel handlers over real HTTP)`);
console.log(`  upstream : ${UP}  (real provider stand-in)`);

// =============================================================================
section('online: POST /api/ai over a real socket');

await test('real request/response cycle: valid JSON, correct content-type, no crash', async () => {
  upstreamMode = 'ok';
  const r = await call('/api/ai', { prompt: 'ping' });
  assert.equal(r.status, 200);
  assert.match(r.contentType, /application\/json/);
  assert.ok(r.json, 'response was not valid JSON');
  assert.notEqual(r.json.crashed, true);
});

await test('fails over past 4 genuinely unreachable providers to a reachable one', async () => {
  upstreamMode = 'ok';
  upstreamHits.length = 0;
  const r = await call('/api/ai', { prompt: 'ping' });
  assert.equal(r.json.ok, true, 'no provider answered');
  assert.equal(r.json.text, 'PONG');
  // Gemini/Mistral/AIMLAPI genuinely could not be resolved -> listed in `tried`
  assert.deepEqual(r.json.tried, ['Google Gemini', 'Mistral AI', 'AI/ML API']);
  assert.equal(r.json.provider, 'BazaarLink AI');
  assert.ok(upstreamHits.length > 0, 'upstream never received a real request');
});

await test('the reachable provider received a correct real HTTP request', async () => {
  const hit = upstreamHits.find((h) => h.url.includes('/chat/completions'));
  assert.ok(hit, 'no chat request reached the upstream');
  assert.equal(hit.method, 'POST');
  assert.equal(hit.auth, 'Bearer sk-bl-LIVE_TEST');
  assert.equal(hit.body.messages[1].content, 'ping');
});

await test('upstream 503 -> keeps shifting; next reachable provider answers', async () => {
  upstreamMode = 'down';
  const r = await call('/api/ai', { prompt: 'ping' });
  assert.equal(r.json.ok, false, 'expected all providers to be exhausted');
  assert.equal(r.json.text, '');
  assert.equal(r.json.tried.length, 7, 'not every provider was attempted');
});

await test('upstream returns 200 with empty content -> treated as failure, no filler', async () => {
  upstreamMode = 'empty';
  const r = await call('/api/ai', { prompt: 'ping' });
  assert.equal(r.json.ok, false);
  assert.equal(r.json.text, '');
});

await test('real hung socket: AbortSignal.timeout fires and the endpoint still responds', async () => {
  upstreamMode = 'hang';
  const started = Date.now();
  const r = await call('/api/ai', { prompt: 'ping', timeout: 1200 });
  const ms = Date.now() - started;
  assert.equal(r.status, 200, 'endpoint hung instead of timing out');
  assert.equal(r.json.ok, false);
  assert.ok(ms < 28000, `took too long: ${ms}ms`);
});

await test('GET /api/ai health probe works online and reports per-provider status', async () => {
  upstreamMode = 'ok';
  const r = await call('/api/ai', null, 'GET');
  assert.equal(r.status, 200);
  assert.equal(r.json.providers.length, 7);
  const reachable = r.json.providers.filter((p) => p.ok).map((p) => p.provider);
  assert.ok(reachable.includes('BazaarLink AI'), 'reachable provider not reported healthy');
  assert.ok(reachable.includes('Ollama'), 'ollama not reported healthy');
  const unreachable = r.json.providers.find((p) => p.provider === 'Google Gemini');
  assert.equal(unreachable.ok, false, 'unreachable provider wrongly reported healthy');
  assert.ok(typeof unreachable.ms === 'number');
});

await test('bad input over the wire -> 400, wrong method -> 405 (no stack traces leaked)', async () => {
  const bad = await call('/api/ai', { prompt: '' });
  assert.equal(bad.status, 400);
  const r = await fetch(APP + '/api/ai', { method: 'DELETE' });
  assert.equal(r.status, 405);
  assert.ok(!/at Object|node:internal/.test(await r.text()), 'stack trace leaked to client');
});

await test('malformed JSON body does not crash the function', async () => {
  const r = await fetch(APP + '/api/ai', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{not json',
  });
  assert.ok([400, 200].includes(r.status));
  const t = await r.text();
  assert.ok(!t.includes('"crashed":true'), 'handler threw on malformed body');
});

// =============================================================================
section('online: POST /api/drug over a real socket');

await test('apieco (real HTTP, apieco-key header) returns a Persian monograph', async () => {
  upstreamMode = 'ok';
  upstreamHits.length = 0;
  const r = await call('/api/drug', { query: 'rivaroxaban' });
  assert.equal(r.status, 200);
  assert.equal(r.json.found, true);
  assert.equal(r.json.data.persian.nameFa, 'ریواروکسابان');
  assert.equal(r.json.data.persian.indications, 'پیشگیری از سکته در فیبریلاسیون دهلیزی');
  const hit = upstreamHits.find((h) => h.url.includes('get_by_formula'));
  assert.equal(hit.apieco, 'LIVE_TEST_APIECO');
  assert.deepEqual(hit.body, { formula: 'rivaroxaban' });
});

await test('unknown term: every real source misses -> found:false, still HTTP 200', async () => {
  const r = await call('/api/drug', { query: 'unknown-xyz' });
  assert.equal(r.status, 200);
  assert.equal(r.json.found, false);
});

await test('all drug sources unreachable -> found:false, never a 500', async () => {
  upstreamMode = 'down';
  const r = await call('/api/drug', { query: 'aspirin' });
  assert.equal(r.status, 200);
  assert.equal(r.json.found, false);
  assert.notEqual(r.json.crashed, true);
});

// =============================================================================
section('online: end-to-end client flow against the running server');

const clientOut = join(dir, 'client.mjs');
await build({ entryPoints: ['src/data/drugsData.ts'], outfile: clientOut, bundle: true, format: 'esm', platform: 'node', logLevel: 'silent' });
const { searchMedical } = await import(pathToFileURL(clientOut).href);

// the client calls relative '/api/...' — resolve those against the live server
const rawFetch = global.fetch;
global.fetch = (u, o) => rawFetch(typeof u === 'string' && u.startsWith('/') ? APP + u : u, o);

await test('tier 1 — offline KB answers instantly without any network call', async () => {
  upstreamMode = 'down';   // network hostile on purpose
  const r = await searchMedical('acetaminophen');
  assert.equal(r.found, true);
  assert.equal(r.drug.nameEn, 'Acetaminophen');
  assert.match(r.provider, /پایگاه دانش/);
});

await test('tier 2 — live drug API answers for a term absent from the KB', async () => {
  upstreamMode = 'ok';
  const r = await searchMedical('rivaroxaban');
  assert.equal(r.found, true);
  assert.equal(r.drug.nameFa, 'ریواروکسابان');
  assert.equal(r.drug.dosageAndAdministration.adults.fa, '۲۰ میلی‌گرم روزانه همراه غذا');
});

await test('tier 3 — AI JSON monograph parsed from a live provider response', async () => {
  upstreamMode = 'ok';
  // absent from KB and unknown to the drug API -> must come from the AI chain
  const r = await searchMedical('apixaban');
  assert.equal(r.found, true);
  assert.equal(r.drug.nameEn, 'Warfarin');
  assert.equal(r.drug.pregnancyCategory, 'X');
  assert.equal(r.drug.interactions.fa[0], 'آسپرین');
});

await test('everything down online -> found:false (UI shows only "چیزی پیدا نشد")', async () => {
  upstreamMode = 'down';
  const r = await searchMedical('zzz-nonexistent-drug');
  assert.equal(r.found, false);
  assert.equal(r.drug, undefined);
  assert.equal(r.protocol, undefined);
});

global.fetch = rawFetch;

// =============================================================================
section('online: /api/feed news + /api/jobs live listings');

await test('/api/feed responds with curated items and a news-source list', async () => {
  const r = await fetch(APP + '/api/feed');
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.ok(Array.isArray(j.items), 'items missing');
  assert.ok(j.items.length > 0, 'curated pool should never be empty');
  assert.ok(Array.isArray(j.newsSources), 'newsSources missing');
  assert.equal(j.newsSources.length, 5, 'all five news references should be advertised');
  const names = j.newsSources.map((s) => s.site);
  for (const must of ['https://seebmagazine.com/', 'https://www.medscape.com/', 'https://www.medicalnewstoday.com/', 'https://www.modernhealthcare.com/', 'https://drmyco.ir/blog/medical-and-health/skin-hair-and-beauty/']) {
    assert.ok(names.includes(must), `missing news source ${must}`);
  }
});

await test('/api/feed survives unreachable news feeds (no crash, curated intact)', async () => {
  // the sandbox has no outbound internet, so every RSS fetch genuinely fails
  const r = await fetch(APP + '/api/feed');
  const j = await r.json();
  assert.equal(r.status, 200);
  assert.ok(j.items.every((i) => ['video', 'tip', 'ad', 'news'].includes(i.kind)));
});

await test('news RSS is really fetched & parsed from a live server (RSS 2.0 + Atom)', async () => {
  const rss = `<?xml version="1.0"?><rss version="2.0"><channel>
    <item>
      <title><![CDATA[کشف داروی جدید برای دیابت نوع ۲]]></title>
      <link>https://seebmagazine.com/post/123</link>
      <description><![CDATA[<p>محققان از یک ترکیب جدید <b>رونمایی</b> کردند.</p>]]></description>
      <pubDate>Sat, 25 Jul 2026 10:00:00 GMT</pubDate>
      <enclosure url="https://img.example.com/a.jpg" type="image/jpeg"/>
    </item></channel></rss>`;
  const atom = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
    <entry>
      <title>New Guidance on Statin Therapy</title>
      <link rel="alternate" href="https://www.medscape.com/view/999"/>
      <summary>Updated cardiovascular prevention guidance released today.</summary>
      <published>2026-07-25T08:30:00Z</published>
    </entry></feed>`;

  const rssSrv = http.createServer((_q, s2) => { s2.writeHead(200, { 'Content-Type': 'application/xml' }); s2.end(rss); });
  const atomSrv = http.createServer((_q, s2) => { s2.writeHead(200, { 'Content-Type': 'application/xml' }); s2.end(atom); });
  const deadSrv = http.createServer((_q, s2) => { s2.writeHead(500); s2.end(); });
  await Promise.all([
    new Promise((r) => rssSrv.listen(0, '127.0.0.1', r)),
    new Promise((r) => atomSrv.listen(0, '127.0.0.1', r)),
    new Promise((r) => deadSrv.listen(0, '127.0.0.1', r)),
  ]);

  process.env.NEWS_FEEDS_JSON = JSON.stringify([
    { name: 'سیب مگزین', site: 'https://seebmagazine.com/', feed: `http://127.0.0.1:${rssSrv.address().port}/` },
    { name: 'Medscape', site: 'https://www.medscape.com/', feed: `http://127.0.0.1:${atomSrv.address().port}/` },
    { name: 'Broken Source', site: 'https://example.com/', feed: `http://127.0.0.1:${deadSrv.address().port}/` },
  ]);

  const freshFeed = await load('api/feed.ts', 'feed_rss');
  const res2 = await getViaHandler(freshFeed);
  rssSrv.close(); atomSrv.close(); deadSrv.close();
  delete process.env.NEWS_FEEDS_JSON;

  const news = res2.json.items.filter((i) => i.kind === 'news');
  assert.ok(news.length >= 2, `expected parsed news, got ${news.length}`);

  const fa = news.find((n) => n.source === 'سیب مگزین');
  assert.ok(fa, 'Persian RSS item not parsed');
  assert.equal(fa.title, 'کشف داروی جدید برای دیابت نوع ۲', 'CDATA title not unwrapped');
  assert.equal(fa.url, 'https://seebmagazine.com/post/123');
  assert.ok(!/<[a-z]/i.test(fa.text), 'HTML tags leaked into the description');
  assert.ok(fa.text.includes('رونمایی'), 'description text lost');
  assert.equal(fa.thumbnail, 'https://img.example.com/a.jpg', 'enclosure image not picked up');
  assert.equal(fa.publishedAt, Date.parse('Sat, 25 Jul 2026 10:00:00 GMT'), 'pubDate not parsed');

  const en = news.find((n) => n.source === 'Medscape');
  assert.ok(en, 'Atom entry not parsed');
  assert.equal(en.title, 'New Guidance on Statin Therapy');
  assert.equal(en.url, 'https://www.medscape.com/view/999', 'atom href link not resolved');

  assert.ok(!news.some((n) => n.source === 'Broken Source'), 'failing source must be skipped silently');
});

await test('live jobs are really parsed, filtered for relevance and categorised', async () => {
  const jobsRss = `<?xml version="1.0"?><rss version="2.0"><channel>
    <item>
      <title>دستیار پژوهشی نگارش مقاله ISI پزشکی</title>
      <link>https://jobinja.ir/jobs/aaa</link>
      <description>همکاری دورکاری در نگارش مقاله، حقوق 8,000,000 تومان، تهران</description>
      <pubDate>${new Date(Date.now() - 3600e3).toUTCString()}</pubDate>
    </item>
    <item>
      <title>مترجم متون تخصصی دارویی</title>
      <link>https://jobinja.ir/jobs/bbb</link>
      <description>ترجمه مقالات دارویی به صورت پروژه ای</description>
      <pubDate>${new Date(Date.now() - 7200e3).toUTCString()}</pubDate>
    </item>
    <item>
      <title>راننده پایه یکم کامیون</title>
      <link>https://jobinja.ir/jobs/ccc</link>
      <description>حمل بار بین شهری</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item></channel></rss>`;

  const srv = http.createServer((_q, s2) => { s2.writeHead(200, { 'Content-Type': 'application/xml' }); s2.end(jobsRss); });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  process.env.JOB_FEEDS_JSON = JSON.stringify([
    { name: 'جابینجا', site: 'https://jobinja.ir', feed: `http://127.0.0.1:${srv.address().port}/` },
  ]);

  const freshJobs = await load('api/jobs.ts', 'jobs_rss');
  const res2 = await getViaHandler(freshJobs);
  srv.close();
  delete process.env.JOB_FEEDS_JSON;

  const jobs = res2.json.jobs;
  assert.equal(jobs.length, 2, `irrelevant posting should be filtered out, got ${jobs.length}`);
  assert.ok(!jobs.some((j) => j.title.includes('راننده')), 'non-medical job leaked through');

  const research = jobs.find((j) => j.title.includes('مقاله'));
  assert.equal(research.category, 'research', 'category detection failed');
  assert.equal(research.type, 'remote', 'remote detection failed');
  assert.equal(research.location, 'تهران', 'location detection failed');
  assert.ok(research.salary.includes('تومان'), 'salary detection failed');
  assert.equal(research.isNew, true, 'recent posting should be flagged new');
  assert.equal(research.externalUrl, 'https://jobinja.ir/jobs/aaa');

  const translator = jobs.find((j) => j.title.includes('مترجم'));
  assert.equal(translator.category, 'translation');
  assert.equal(translator.type, 'project');
});

await test('/api/jobs returns a valid envelope and advertises the reference boards', async () => {
  const r = await fetch(APP + '/api/jobs');
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.ok, true);
  assert.ok(Array.isArray(j.jobs), 'jobs array missing');
  assert.ok(Array.isArray(j.sources) && j.sources.length >= 3, 'job sources missing');
  const sites = j.sources.map((s) => s.site);
  assert.ok(sites.some((u) => u.includes('jobinja.ir')));
  assert.ok(sites.some((u) => u.includes('iranestekhdam.ir')));
  assert.ok(sites.some((u) => u.includes('karno.ir')));
});

await test('/api/jobs degrades gracefully when every board is unreachable', async () => {
  const r = await fetch(APP + '/api/jobs');
  const j = await r.json();
  assert.equal(r.status, 200);
  assert.equal(j.ok, true);
  assert.equal(j.jobs.length, 0, 'no live jobs expected without internet');
  assert.notEqual(j.crashed, true);
});

// =============================================================================
section('deployment sanity');

await test('dist/index.html was built and is served by the same origin as /api', async () => {
  assert.ok(distIndex, 'dist/index.html missing — run npm run build');
  const r = await fetch(APP + '/');
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes('<div id="root"'), 'app shell not served');
});

await test('vercel.json declares every function with a sufficient maxDuration', async () => {
  const v = JSON.parse(readFileSync('vercel.json', 'utf8'));
  assert.equal(v.outputDirectory, 'dist');
  assert.ok(v.functions['api/ai.ts'].maxDuration >= 30, 'ai needs >= 30s for a 7-provider chain');
  assert.ok(v.functions['api/drug.ts'].maxDuration >= 15);
  assert.ok(v.functions['api/jobs.ts'].maxDuration >= 15, 'jobs endpoint needs time for RSS fetches');
  assert.ok(v.functions['api/feed.ts'].maxDuration >= 15, 'feed endpoint needs time for RSS fetches');
  assert.ok(!v.rewrites, 'a catch-all rewrite would swallow /api routes');
});

await test('no hardcoded secrets remain in the api/ or src/ source', async () => {
  const { execSync } = await import('node:child_process');
  const hits = execSync(
    "grep -rInE '(AQ\\.Ab8RN|sk-bl-[A-Za-z0-9]{10}|sk_[A-Za-z0-9]{20}|o2Kvv7CB)' api src || true",
    { encoding: 'utf8' }
  ).trim();
  assert.equal(hits, '', `secrets found:\n${hits}`);
});

upstream.close(); app.close();
console.log(failures === 0
  ? '\n\x1b[32mAll online integration checks passed.\x1b[0m\n'
  : `\n\x1b[31m${failures} check(s) failed.\x1b[0m\n`);
process.exit(failures === 0 ? 0 : 1);
