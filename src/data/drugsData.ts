import { DrugMonograph, TreatmentProtocol } from '../types';
import { queryDrugApi, queryAiApi } from '../utils/telegram';
import { DISEASE_KB, DRUG_KB, normalizeQuery } from './clinicalKB';

export interface DrugRefSite {
  name: string;
  url: string;
  icon: string;
  desc: string;
}

export const DRUG_REFERENCE_SITES: DrugRefSite[] = [
  { name: "دارویاب (Darooyab)", url: "https://www.darooyab.ir", icon: "💊", desc: "بانک جامع دارویی ایران" },
  { name: "سامانه تی‌تک (TTAC)", url: "https://www.ttac.ir", icon: "🇮🇷", desc: "سازمان غذا و دارو ایران" },
  { name: "Medscape Drugs", url: "https://www.medscape.com", icon: "📖", desc: "مرجع بالینی و تداخلات دارویی" },
  { name: "Guide to Pharmacology", url: "https://www.guidetopharmacology.org", icon: "🔬", desc: "پایگاه فارماکولوژی بین‌المللی" },
  { name: "Drugs@FDA", url: "https://www.fda.gov/drugsatfda", icon: "🏛️", desc: "تاییدیه و اطلاعات دارویی FDA" },
  { name: "DailyMed NIH", url: "https://www.dailymed.nlm.nih.gov", icon: "📋", desc: "بروشورهای رسمی دارویی آمریکا" },
  { name: "FDA Science Research", url: "https://www.fda.gov/science-research", icon: "🧪", desc: "تحقیقات علوم دارویی FDA" },
  { name: "OpenFDA API", url: "https://open.fda.gov/apis/authentication/", icon: "⚡", desc: "دسترسی آزاد به دیتاست دارویی" }
];

// =============================================================================
//  Search result contract
//  found === false  ->  the UI must show ONLY the "nothing found" message.
//  No placeholder / invented monographs are ever produced any more.
// =============================================================================
export interface MedicalSearchResult {
  found: boolean;
  drug?: DrugMonograph;
  protocol?: TreatmentProtocol;
  provider?: string;   // which engine answered (FDA / Gemini / Mistral / ...)
  reason?: 'no-result' | 'ai-down';
}

const DISEASE_HINT =
  /(بیماری|سندرم|عفونت|التهاب|سرماخوردگی|آنفولانزا|میگرن|سردرد|گاستریت|ورم معده|رفلاکس|کرونا|کووید|سرفه|تب|آلرژی|حساسیت|فشار خون|دیابت|اضطراب|افسردگی|بی‌خوابی|سینوزیت|زخم معده|آسم|کم‌خونی|درمان|پروتکل|syndrome|disease|infection|itis$|cold|flu|influenza|migraine|headache|gastritis|reflux|gerd|covid|cough|fever|allergy|hypertension|diabetes|anxiety|depression|insomnia|asthma|anemia|treatment|protocol)/i;

const isDiseaseQuery = (q: string) => DISEASE_HINT.test(q);

// -----------------------------------------------------------------------------
//  Public API used by the UI
// -----------------------------------------------------------------------------
export const searchMedical = async (query: string): Promise<MedicalSearchResult> => {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return { found: false, reason: 'no-result' };

  const disease = isDiseaseQuery(cleanQuery);

  // 1) Offline clinical knowledge base (instant + always accurate for common cases)
  const key = normalizeQuery(cleanQuery);
  if (key && DISEASE_KB[key]) return { found: true, protocol: protocolFromKb(DISEASE_KB[key]), provider: 'پایگاه دانش بالینی داخلی' };
  if (key && DRUG_KB[key]) return { found: true, drug: drugFromKb(DRUG_KB[key]), provider: 'پایگاه دانش بالینی داخلی' };

  // 2) Live drug databases: apieco (فارسی) + OpenFDA + RxNorm  (drug names only)
  if (!disease) {
    const drugData = await queryDrugApi(cleanQuery);
    if (drugData?.found && drugData.data) {
      const built = drugFromLiveApi(cleanQuery, drugData);
      if (built) return { found: true, drug: built, provider: drugData.source };
    }
  }

  // 3) AI fail-over chain (Gemini → Mistral → AIMLAPI → BazaarLink → AINative → CF → Ollama)
  const ai = await queryAiApi(aiPrompt(cleanQuery, disease), AI_SYSTEM);
  if (ai.ok && ai.text) {
    const parsed = parseAiJson(ai.text);
    if (parsed) {
      if (parsed.kind === 'disease') return { found: true, protocol: protocolFromAi(parsed, ai.provider), provider: ai.provider };
      if (parsed.kind === 'drug') return { found: true, drug: drugFromAi(parsed, ai.provider), provider: ai.provider };
    }
    // Model answered but not as JSON — still real content, show it as-is.
    const plain = ai.text.trim();
    if (plain.length > 40 && !/not\s*found|اطلاعاتی\s*یافت\s*نشد/i.test(plain)) {
      return { found: true, drug: drugFromPlainText(cleanQuery, plain, ai.provider), provider: ai.provider };
    }
  }

  // 4) Nothing real to show.
  return { found: false, reason: ai.ok ? 'no-result' : 'ai-down' };
};

// Backwards-compatible name (older imports).
export const synthesizeAiMedicalData = async (
  query: string
): Promise<{ drug?: DrugMonograph; protocol?: TreatmentProtocol }> => {
  const r = await searchMedical(query);
  return { drug: r.drug, protocol: r.protocol };
};

// -----------------------------------------------------------------------------
//  AI prompt / JSON parsing
// -----------------------------------------------------------------------------
const AI_SYSTEM =
  'You are a clinical pharmacology and internal-medicine reference engine for pharmacy and medical students. ' +
  'Answer ONLY with facts you are confident about, sourced from standard references (FDA labels, DailyMed, Medscape, UpToDate, BNF, Iranian Darooyab). ' +
  'Reply with a single JSON object and nothing else. If you do not know the drug or disease, reply exactly: {"kind":"unknown"}';

function aiPrompt(q: string, disease: boolean): string {
  const drugSchema = `{"kind":"drug","nameFa":"","nameEn":"","genericNameFa":"","genericNameEn":"","category":"","type":"chemical|herbal|supplement","indicationsFa":"","indicationsEn":"","mechanismFa":"","mechanismEn":"","dosageAdultsFa":"","dosageAdultsEn":"","dosagePediatricsFa":"","dosagePediatricsEn":"","forms":[""],"sideEffectsFa":[""],"sideEffectsEn":[""],"interactionsFa":[""],"interactionsEn":[""],"precautionsFa":"","precautionsEn":"","pregnancyCategory":""}`;
  const diseaseSchema = `{"kind":"disease","nameFa":"","nameEn":"","overviewFa":"","overviewEn":"","firstLine":[{"drugName":"","dosage":"","frequency":"","duration":"","notesFa":"","notesEn":""}],"herbal":[{"name":"","usage":"","benefit":""}],"lifestyleFa":[""],"lifestyleEn":[""]}`;
  return (
    `Query: "${q}"\n` +
    `If it is a DISEASE/condition, use this schema:\n${diseaseSchema}\n` +
    `If it is a DRUG/herb/supplement, use this schema:\n${drugSchema}\n` +
    (disease ? 'The query most likely refers to a disease/condition.\n' : 'The query most likely refers to a drug or herbal remedy.\n') +
    'Persian (fa) fields must be written in fluent Persian, English (en) fields in English. ' +
    'Return raw JSON only, no markdown fences, no commentary. If unknown: {"kind":"unknown"}'
  );
}

function parseAiJson(text: string): any | null {
  const raw = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(raw.slice(start, end + 1));
    if (!obj || obj.kind === 'unknown') return null;
    if (obj.kind !== 'drug' && obj.kind !== 'disease') return null;
    return obj;
  } catch { return null; }
}

// -----------------------------------------------------------------------------
//  Builders
// -----------------------------------------------------------------------------
const arr = (v: any, fallback: string[] = []): string[] =>
  Array.isArray(v) ? v.filter(Boolean).map((x: any) => String(x)) : (typeof v === 'string' && v ? [v] : fallback);
const str = (v: any, fallback = ''): string => (typeof v === 'string' && v.trim() ? v.trim() : fallback);

function drugFromKb(k: any): DrugMonograph {
  return {
    id: `kb-drug-${Date.now()}`,
    nameFa: k.nameFa, nameEn: k.nameEn,
    genericNameFa: k.genericNameFa, genericNameEn: k.genericNameEn,
    category: k.category, type: k.type,
    indications: { fa: k.indicationsFa, en: k.indicationsEn },
    mechanism: { fa: k.mechanismFa, en: k.mechanismEn },
    dosageAndAdministration: {
      adults: { fa: k.dosageAdultsFa, en: k.dosageAdultsEn },
      pediatrics: { fa: k.dosagePediatricsFa || 'در کودکان بر اساس سن و وزن و با تجویز پزشک.', en: k.dosagePediatricsEn || 'Pediatric dose by weight/age under physician supervision.' },
    },
    forms: k.forms,
    sideEffects: { fa: k.sideEffectsFa, en: k.sideEffectsEn },
    interactions: { fa: k.interactionsFa, en: k.interactionsEn },
    precautions: { fa: k.precautionsFa, en: k.precautionsEn },
    pregnancyCategory: k.pregnancyCategory,
    source: k.source || 'پایگاه دانش بالینی داخلی همیار دانشجو',
  };
}

function protocolFromKb(k: any): TreatmentProtocol {
  return {
    id: `kb-proto-${Date.now()}`,
    diseaseNameFa: k.nameFa, diseaseNameEn: k.nameEn,
    overview: { fa: k.overviewFa, en: k.overviewEn },
    firstLineTherapy: k.firstLine,
    adjunctiveHerbalTherapy: k.herbal,
    lifestyleAdviceFa: k.lifestyleFa,
    lifestyleAdviceEn: k.lifestyleEn,
  };
}

function drugFromAi(o: any, provider: string): DrugMonograph {
  const nameEn = str(o.nameEn, str(o.nameFa));
  const nameFa = str(o.nameFa, nameEn);
  return {
    id: `ai-drug-${Date.now()}`,
    nameFa, nameEn,
    genericNameFa: str(o.genericNameFa, nameFa),
    genericNameEn: str(o.genericNameEn, nameEn),
    category: str(o.category, 'دارو / فرآورده درمانی'),
    type: (o.type === 'herbal' || o.type === 'supplement') ? o.type : 'chemical',
    indications: { fa: str(o.indicationsFa), en: str(o.indicationsEn) },
    mechanism: { fa: str(o.mechanismFa), en: str(o.mechanismEn) },
    dosageAndAdministration: {
      adults: { fa: str(o.dosageAdultsFa), en: str(o.dosageAdultsEn) },
      pediatrics: { fa: str(o.dosagePediatricsFa, 'در کودکان با تجویز پزشک و بر اساس وزن.'), en: str(o.dosagePediatricsEn, 'Pediatric dosing by weight, physician supervised.') },
    },
    forms: arr(o.forms),
    sideEffects: { fa: arr(o.sideEffectsFa), en: arr(o.sideEffectsEn) },
    interactions: { fa: arr(o.interactionsFa), en: arr(o.interactionsEn) },
    precautions: { fa: str(o.precautionsFa), en: str(o.precautionsEn) },
    pregnancyCategory: str(o.pregnancyCategory, '—'),
    source: `${provider} (بر پایه مراجع FDA / DailyMed / Medscape)`,
  };
}

function protocolFromAi(o: any, _provider: string): TreatmentProtocol {
  return {
    id: `ai-proto-${Date.now()}`,
    diseaseNameFa: str(o.nameFa, str(o.nameEn)),
    diseaseNameEn: str(o.nameEn, str(o.nameFa)),
    overview: { fa: str(o.overviewFa), en: str(o.overviewEn) },
    firstLineTherapy: Array.isArray(o.firstLine) ? o.firstLine.map((x: any) => ({
      drugName: str(x.drugName), dosage: str(x.dosage, '—'), frequency: str(x.frequency, '—'),
      duration: str(x.duration, '—'), notesFa: str(x.notesFa), notesEn: str(x.notesEn),
    })).filter((x: any) => x.drugName) : [],
    adjunctiveHerbalTherapy: Array.isArray(o.herbal) ? o.herbal.map((h: any) => ({
      name: str(h.name), usage: str(h.usage), benefit: str(h.benefit),
    })).filter((h: any) => h.name) : [],
    lifestyleAdviceFa: arr(o.lifestyleFa),
    lifestyleAdviceEn: arr(o.lifestyleEn),
  };
}

/** Model answered in prose instead of JSON — show the real answer verbatim. */
function drugFromPlainText(name: string, text: string, provider: string): DrugMonograph {
  return {
    id: `ai-text-${Date.now()}`,
    nameFa: name, nameEn: name,
    genericNameFa: name, genericNameEn: name,
    category: 'پاسخ تحلیلی هوش مصنوعی بالینی',
    type: 'chemical',
    indications: { fa: text, en: text },
    mechanism: { fa: '', en: '' },
    dosageAndAdministration: { adults: { fa: '', en: '' }, pediatrics: { fa: '', en: '' } },
    forms: [],
    sideEffects: { fa: [], en: [] },
    interactions: { fa: [], en: [] },
    precautions: { fa: '', en: '' },
    pregnancyCategory: '—',
    source: provider,
  };
}

function drugFromLiveApi(query: string, drugData: any): DrugMonograph | null {
  const d = drugData.data || {};

  // apieco (Persian medicine API)
  if (d.persian) {
    const p = d.persian;
    return {
      id: `apieco-${Date.now()}`,
      nameFa: str(p.nameFa, query), nameEn: str(p.nameEn, query),
      genericNameFa: str(p.genericFa, str(p.nameFa, query)),
      genericNameEn: str(p.genericEn, str(p.nameEn, query)),
      category: str(p.category, 'دارو (منبع: مرجع دارویی فارسی)'),
      type: 'chemical',
      indications: { fa: str(p.indications), en: str(p.indicationsEn, str(p.indications)) },
      mechanism: { fa: str(p.mechanism), en: str(p.mechanismEn) },
      dosageAndAdministration: {
        adults: { fa: str(p.dosage), en: str(p.dosageEn, str(p.dosage)) },
        pediatrics: { fa: str(p.pediatrics, 'با تجویز پزشک اطفال.'), en: str(p.pediatricsEn, 'Physician supervised.') },
      },
      forms: arr(p.forms),
      sideEffects: { fa: arr(p.sideEffects), en: arr(p.sideEffectsEn) },
      interactions: { fa: arr(p.interactions), en: arr(p.interactionsEn) },
      precautions: { fa: str(p.precautions), en: str(p.precautionsEn) },
      pregnancyCategory: str(p.pregnancy, '—'),
      source: drugData.source || 'مرجع دارویی فارسی (apieco medicine API)',
    };
  }

  // OpenFDA label
  if (d.brandName) {
    const brandName = d.brandName;
    const genericName = d.genericName || brandName;
    const same = brandName.toLowerCase() === genericName.toLowerCase();
    return {
      id: `fda-${Date.now()}`,
      nameFa: brandName,
      nameEn: same ? brandName : `${brandName} (${genericName})`,
      genericNameFa: genericName, genericNameEn: genericName,
      category: d.pharmClass || 'دارو با برچسب رسمی FDA',
      type: 'chemical',
      indications: { fa: str(d.purpose), en: str(d.purpose) },
      mechanism: { fa: str(d.mechanism), en: str(d.mechanism) },
      dosageAndAdministration: {
        adults: { fa: str(d.dosage), en: str(d.dosage) },
        pediatrics: { fa: str(d.pediatrics, 'در کودکان طبق برچسب رسمی و تجویز پزشک.'), en: str(d.pediatrics, 'Per official label, physician supervised.') },
      },
      forms: arr(d.forms),
      sideEffects: { fa: d.adverseReactions ? [d.adverseReactions] : [], en: d.adverseReactions ? [d.adverseReactions] : [] },
      interactions: { fa: d.drugInteractions ? [d.drugInteractions] : [], en: d.drugInteractions ? [d.drugInteractions] : [] },
      precautions: { fa: str(d.warnings), en: str(d.warnings) },
      pregnancyCategory: str(d.pregnancyCategory, '—'),
      source: drugData.source || 'OpenFDA / DailyMed',
    };
  }

  // RxNorm resolved only a name — not enough real data on its own.
  return null;
}
