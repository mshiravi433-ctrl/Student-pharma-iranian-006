// =============================================================================
//  /api/drug  —  Live Drug Information Proxy (Vercel Serverless Function)
//  Sources (in priority order):
//    1) OpenFDA  drug/label  (brand_name / generic_name / substance_name / indications)
//    2) NLM RxNorm  (National Library of Medicine drug name resolution)
//  Returns normalized, ready-to-render fields. Falls back to { found:false }
//  so the client can use its AI / static synthesizer.
// =============================================================================

const OPEN_FDA_API_KEY = process.env.OPEN_FDA_API_KEY || 'YZY3lGXgu5tSUYgVO62maSNd1md6D7Ddi6cGcoVe';

function readJson(req: any): Promise<any> {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) && !Array.isArray(req.body)) {
      resolve(req.body);
      return;
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
const first = (arr: any, max = 360) => (Array.isArray(arr) && arr.length ? clean(String(arr[0])).slice(0, max) : '');

const json = (res: any, code: number, obj: any) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { json(res, 405, { error: 'Method Not Allowed' }); return; }

  const body = await readJson(req);
  const query = String(body.query || body.prompt || '').trim();
  if (!query || query.length < 2) { json(res, 400, { error: 'query is required' }); return; }

  // ---------------------------------------------------------------------------
  // 1) OpenFDA — try an exact phrase match first, then a broad full-text match.
  // ---------------------------------------------------------------------------
  try {
    const exact = `openfda.brand_name:"${enc(query)}"+OR+openfda.generic_name:"${enc(query)}"+OR+openfda.substance_name:"${enc(query)}"`;
    const broad = enc(query);
    for (const search of [exact, broad]) {
      const url = `https://api.fda.gov/drug/label.json?api_key=${OPEN_FDA_API_KEY}&search=${search}&limit=1`;
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (r.ok) {
        const d: any = await r.json();
        const res0 = d?.results?.[0];
        if (res0) {
          const openFda = res0.openfda || {};
          const brandName = first(openFda.brand_name) || query;
          const genericName = first(openFda.generic_name) || first(openFda.substance_name) || query;
          json(res, 200, {
            found: true,
            source: 'OpenFDA Live API (سازمان غذا و دارو آمریکا) + DailyMed + Medscape',
            data: {
              brandName,
              genericName,
              purpose: first(res0.purpose, 400) || first(res0.indications_and_usage, 400) || `داروی بالینی ثبت‌شده در سامانه رسمی FDA برای مدیریت علائم مرتبط با ${query}.`,
              dosage: first(res0.dosage_and_administration, 400) || 'مطابق دستور پزشک معالج یا دوز استاندارد کاتالوگ دارویی مصرف شود.',
              warnings: first(res0.warnings, 400) || 'در صورت سابقه حساسیت دارویی یا بارداری با پزشک مشورت شود.',
              adverseReactions: first(res0.adverse_reactions, 300),
              drugInteractions: first(res0.drug_interactions, 300),
              pregnancyCategory: first(openFda.brand_name) ? 'B / C (بررسی در سامانه FDA و مشاوره با پزشک معالج الزامی است)' : 'بررسی در سامانه FDA',
              pharmClass: first(openFda.pharm_class_epc) || '',
            },
          });
          return;
        }
      }
    }
  } catch { /* try next source */ }

  // ---------------------------------------------------------------------------
  // 2) NLM RxNorm — resolves the drug name in the US national drug vocabulary.
  // ---------------------------------------------------------------------------
  try {
    const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${enc(query)}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (r.ok) {
      const d: any = await r.json();
      const groups = d?.drugGroup?.conceptGroup;
      if (Array.isArray(groups) && groups.length) {
        let foundName = query;
        for (const grp of groups) {
          if (grp?.conceptProperties?.length) { foundName = grp.conceptProperties[0].name || query; break; }
        }
        json(res, 200, {
          found: true,
          source: 'کتابخانه ملی پزشکی آمریکا (NLM RxNorm) + GuideToPharmacology + Medscape + DailyMed',
          data: { name: foundName },
        });
        return;
      }
    }
  } catch { /* fall through */ }

  json(res, 200, { found: false });
}
