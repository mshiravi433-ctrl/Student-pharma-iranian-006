// =============================================================================
//  /api/drug  —  Live Drug Information Proxy (Vercel Serverless Function)
//  Sources, tried in order (fail-over):
//    1) apieco  medicine-api  (Persian drug reference)
//    2) OpenFDA drug/label    (brand / generic / substance / indications)
//    3) NLM RxNorm            (name resolution only)
//  Returns { found:false } when nothing real is available — the client then
//  shows a plain "nothing found" message (never invented data).
// =============================================================================

const OPEN_FDA_API_KEY = (process.env.OPEN_FDA_API_KEY || '').trim();
const APIECO_BASE = (process.env.APIECO_BASE_URL || 'https://api.apieco.ir/apitalk/medicine-api').replace(/\/+$/, '');
const APIECO_TOKEN = (process.env.APIECO_TOKEN || '').trim();

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
    req.on('data', (chunk: any) => { body += chunk; });
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

const enc = (s: string) => encodeURIComponent(s);
const clean = (s: string) => (s || '').replace(/[\[\]]/g, '').trim();
const first = (arr: any, max = 900) => (Array.isArray(arr) && arr.length ? clean(String(arr[0])).slice(0, max) : '');

const json = (res: any, code: number, obj: any) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
};

// ---------------------------------------------------------------------------
//  1) apieco Persian medicine API
// ---------------------------------------------------------------------------
async function fromApieco(query: string): Promise<any | null> {
  const headers: any = { 'Content-Type': 'application/json' };
  if (APIECO_TOKEN) headers['apieco-key'] = APIECO_TOKEN;

  const endpoints = [
    { url: `${APIECO_BASE}/get_by_formula`, body: { formula: query } },
    { url: `${APIECO_BASE}/get_by_name`, body: { name: query } },
    { url: `${APIECO_BASE}/search`, body: { query } },
  ];

  for (const ep of endpoints) {
    try {
      const r = await fetch(ep.url, {
        method: 'POST', headers, body: JSON.stringify(ep.body),
        signal: AbortSignal.timeout(6000),
      });
      if (!r.ok) continue;
      const d: any = await r.json();
      const item = Array.isArray(d) ? d[0] : (d?.data?.[0] || d?.result?.[0] || d?.data || d?.result || d);
      if (!item || typeof item !== 'object') continue;

      const nameFa = item.name_fa || item.persian_name || item.nameFa || item.name || '';
      const nameEn = item.name_en || item.english_name || item.nameEn || item.formula || '';
      const indications = item.usage || item.indications || item.moarefi || item.description || '';
      if (!nameFa && !nameEn && !indications) continue;

      return {
        found: true,
        source: 'مرجع دارویی فارسی (apieco medicine API) + دارویاب',
        data: {
          persian: {
            nameFa: nameFa || query,
            nameEn: nameEn || query,
            genericFa: item.generic_fa || item.generic || nameFa,
            genericEn: item.generic_en || item.formula || nameEn,
            category: item.category || item.group || item.drug_group || '',
            indications,
            mechanism: item.mechanism || item.mechanism_of_action || '',
            dosage: item.dosage || item.dose || item.consumption || '',
            pediatrics: item.pediatrics || item.child_dose || '',
            forms: item.forms || item.shapes || item.dosage_forms || [],
            sideEffects: item.side_effects || item.avarez || [],
            interactions: item.interactions || item.tadakhol || [],
            precautions: item.warnings || item.precautions || item.tozihat || '',
            pregnancy: item.pregnancy || item.pregnancy_category || '',
          },
        },
      };
    } catch { /* next endpoint */ }
  }
  return null;
}

// ---------------------------------------------------------------------------
//  2) OpenFDA
// ---------------------------------------------------------------------------
async function fromOpenFda(query: string): Promise<any | null> {
  const exact = `openfda.brand_name:"${enc(query)}"+OR+openfda.generic_name:"${enc(query)}"+OR+openfda.substance_name:"${enc(query)}"`;
  for (const search of [exact, enc(query)]) {
    try {
      const key = OPEN_FDA_API_KEY ? `api_key=${OPEN_FDA_API_KEY}&` : '';
      const url = `https://api.fda.gov/drug/label.json?${key}search=${search}&limit=1`;
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!r.ok) continue;
      const d: any = await r.json();
      const res0 = d?.results?.[0];
      if (!res0) continue;
      const openFda = res0.openfda || {};
      const purpose = first(res0.purpose) || first(res0.indications_and_usage);
      const dosage = first(res0.dosage_and_administration);
      if (!purpose && !dosage) continue;
      return {
        found: true,
        source: 'OpenFDA / DailyMed (برچسب رسمی دارو)',
        data: {
          brandName: first(openFda.brand_name, 120) || query,
          genericName: first(openFda.generic_name, 120) || first(openFda.substance_name, 120) || query,
          purpose,
          dosage,
          mechanism: first(res0.mechanism_of_action) || first(res0.clinical_pharmacology),
          warnings: first(res0.warnings) || first(res0.warnings_and_cautions),
          adverseReactions: first(res0.adverse_reactions),
          drugInteractions: first(res0.drug_interactions),
          pregnancyCategory: first(res0.pregnancy, 200),
          pharmClass: first(openFda.pharm_class_epc, 160),
          forms: Array.isArray(openFda.route) ? openFda.route.slice(0, 4) : [],
        },
      };
    } catch { /* next */ }
  }
  return null;
}

// ---------------------------------------------------------------------------
//  3) RxNorm (name resolution — used only as a spelling hint)
// ---------------------------------------------------------------------------
async function fromRxNorm(query: string): Promise<string | null> {
  try {
    const r = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${enc(query)}`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return null;
    const d: any = await r.json();
    const groups = d?.drugGroup?.conceptGroup;
    if (!Array.isArray(groups)) return null;
    for (const grp of groups) {
      if (grp?.conceptProperties?.length) return grp.conceptProperties[0].name || null;
    }
  } catch { /* ignore */ }
  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { json(res, 405, { error: 'Method Not Allowed' }); return; }

  const body = await readJson(req);
  const query = String(body.query || body.prompt || '').trim();
  if (!query || query.length < 2) { json(res, 400, { error: 'query is required' }); return; }

  const apieco = await fromApieco(query);
  if (apieco) { json(res, 200, apieco); return; }

  const fda = await fromOpenFda(query);
  if (fda) { json(res, 200, fda); return; }

  // Try again through the resolved RxNorm name (fixes typos / brand↔generic).
  const rx = await fromRxNorm(query);
  if (rx && rx.toLowerCase() !== query.toLowerCase()) {
    const alt = await fromOpenFda(rx.split(' ')[0]);
    if (alt) { json(res, 200, alt); return; }
  }

  json(res, 200, { found: false, resolvedName: rx || null });
}
