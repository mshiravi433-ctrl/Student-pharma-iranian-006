import React, { useState } from 'react';
import { triggerHaptic } from '../../utils/telegram';
import { 
  Calculator, 
  Activity, 
  Heart, 
  Scale, 
  Stethoscope, 
  Flame,
  Baby
} from 'lucide-react';

export const CalculatorsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'renal' | 'cardio' | 'body' | 'icu' | 'peds-preg'>('body');

  // --- PEDIATRIC & PREGNANCY DOSING STATE ---
  const [pedsWeightKg, setPedsWeightKg] = useState<number>(15);
  const [pedsAgeYrs, setPedsAgeYrs] = useState<number>(4);
  const [pedsDrug, setPedsDrug] = useState<string>('amox'); // amox, acet, ibup, cetir, custom
  const [pedsCustomMgKg, setPedsCustomMgKg] = useState<number>(20);
  const [pregTrimester, setPregTrimester] = useState<'1st' | '2nd' | '3rd' | 'lactation'>('2nd');
  const [pregDrugCategory, setPregDrugCategory] = useState<string>('analgesic');

  // --- RENAL & DOSING STATE (eGFR & Cockcroft-Gault CrCl) ---
  const [age, setAge] = useState<number>(45);
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [creatinineMgDl, setCreatinineMgDl] = useState<number>(1.1);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isBlack, setIsBlack] = useState<boolean>(false);

  // --- CARDIOLOGY STATE (CHA2DS2-VASc & HAS-BLED) ---
  const [chf, setChf] = useState<boolean>(false);
  const [htn, setHtn] = useState<boolean>(false);
  const [dm, setDm] = useState<boolean>(false);
  const [strokeHx, setStrokeHx] = useState<boolean>(false);
  const [vascDisease, setVascDisease] = useState<boolean>(false);
  
  // HAS-BLED specific
  const [abnormalRenal, setAbnormalRenal] = useState<boolean>(false);
  const [abnormalLiver, setAbnormalLiver] = useState<boolean>(false);
  const [bleedingHx, setBleedingHx] = useState<boolean>(false);
  const [labileInr, setLabileInr] = useState<boolean>(false);
  const [elderly65, setElderly65] = useState<boolean>(false);
  const [drugsOrAlcohol, setDrugsOrAlcohol] = useState<number>(0); // 0, 1, 2

  // --- CRITICAL CARE STATE (CURB-65) ---
  const [curbC, setCurbC] = useState<boolean>(false); // Confusion
  const [curbU, setCurbU] = useState<boolean>(false); // Urea > 7
  const [curbR, setCurbR] = useState<boolean>(false); // RR >= 30
  const [curbB, setCurbB] = useState<boolean>(false); // BP < 90/60
  const [curb65, setCurb65] = useState<boolean>(false); // Age >= 65

  // --- CALCULATIONS ---
  // 1. BMI & BSA & IBW
  const heightM = heightCm / 100;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);
  const bsaDuBois = Math.sqrt((weightKg * heightCm) / 3600).toFixed(2);
  const ibw = gender === 'male' 
    ? (50 + 2.3 * ((heightCm / 2.54) - 60)).toFixed(1)
    : (45.5 + 2.3 * ((heightCm / 2.54) - 60)).toFixed(1);
  const abw = (parseFloat(ibw) + 0.4 * (weightKg - parseFloat(ibw))).toFixed(1);

  // 2. Creatinine Clearance (Cockcroft-Gault) & eGFR (CKD-EPI)
  const crClRaw = ((140 - age) * weightKg) / (72 * (creatinineMgDl || 1));
  const crCl = (gender === 'female' ? crClRaw * 0.85 : crClRaw).toFixed(1);
  
  // CKD-EPI simplified approximation
  const kappa = gender === 'female' ? 0.7 : 0.9;
  const alpha = gender === 'female' ? -0.329 : -0.411;
  const minCr = Math.min(creatinineMgDl / kappa, 1);
  const maxCr = Math.max(creatinineMgDl / kappa, 1);
  let egfrVal = 141 * Math.pow(minCr, alpha) * Math.pow(maxCr, -1.209) * Math.pow(0.993, age);
  if (gender === 'female') egfrVal *= 1.018;
  if (isBlack) egfrVal *= 1.159;
  const egfr = egfrVal.toFixed(1);

  // 3. CHA2DS2-VASc Score
  let chaScore = 0;
  if (chf) chaScore += 1;
  if (htn) chaScore += 1;
  if (age >= 75) chaScore += 2;
  else if (age >= 65) chaScore += 1;
  if (dm) chaScore += 1;
  if (strokeHx) chaScore += 2;
  if (vascDisease) chaScore += 1;
  if (gender === 'female') chaScore += 1;

  // 4. HAS-BLED Score
  let hasBledScore = 0;
  if (htn) hasBledScore += 1;
  if (abnormalRenal) hasBledScore += 1;
  if (abnormalLiver) hasBledScore += 1;
  if (strokeHx) hasBledScore += 1;
  if (bleedingHx) hasBledScore += 1;
  if (labileInr) hasBledScore += 1;
  if (elderly65 || age >= 65) hasBledScore += 1;
  hasBledScore += drugsOrAlcohol;

  // 5. CURB-65 Score
  let curbScore = 0;
  if (curbC) curbScore += 1;
  if (curbU) curbScore += 1;
  if (curbR) curbScore += 1;
  if (curbB) curbScore += 1;
  if (curb65 || age >= 65) curbScore += 1;

  const handleTabChange = (cat: 'renal' | 'cardio' | 'body' | 'icu' | 'peds-preg') => {
    triggerHaptic('light');
    setActiveCategory(cat);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              ابزارها و محاسبات بالینی پزشکی (Medical Calculators)
            </h2>
            <p className="text-xs text-slate-300">
              محاسبه آنی دوزبندی اطفال و بارداری، شاخص‌های بدنی، کلیرانس دارو و نمرات اورژانس و ICU
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold self-stretch sm:self-auto">
          <button
            onClick={() => handleTabChange('body')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'body' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>شاخص بدنی</span>
          </button>
          <button
            onClick={() => handleTabChange('peds-preg')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'peds-preg' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Baby className="w-3.5 h-3.5 text-pink-300" />
            <span>اطفال و بارداری</span>
          </button>
          <button
            onClick={() => handleTabChange('renal')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'renal' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>کلیه و کلیرانس</span>
          </button>
          <button
            onClick={() => handleTabChange('cardio')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'cardio' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>قلب و عروق</span>
          </button>
          <button
            onClick={() => handleTabChange('icu')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'icu' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>اورژانس و ICU</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Input Parameters (Left) vs Real-Time Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / INPUT PANEL (6 Columns on LG) */}
        <div className="lg:col-span-6 glass-panel p-5 sm:p-6 rounded-3xl border border-white/15 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>پارامترها و اندازه‌گیری بیمار (Patient Parameters)</span>
            </h3>
            <span className="text-[10px] text-cyan-300 font-mono">LIVE COMPUTATION</span>
          </div>

          {/* COMMON INPUTS (Age, Weight, Height, Gender) */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">سن بیمار (Age - سال):</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm font-bold text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">جنسیت (Gender):</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { triggerHaptic('light'); setGender('male'); }}
                    className={`py-2 rounded-lg transition-all ${gender === 'male' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                  >
                    مرد (Male)
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerHaptic('light'); setGender('female'); }}
                    className={`py-2 rounded-lg transition-all ${gender === 'female' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                  >
                    زن (Female)
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">وزن (Weight - کیلوگرم):</label>
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm font-bold text-center text-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">قد (Height - سانتی‌متر):</label>
                <input
                  type="number"
                  min={50}
                  max={240}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm font-bold text-center text-blue-400"
                />
              </div>
            </div>

            {/* PEDIATRIC & PREGNANCY DOSING SPECIFIC INPUTS */}
            {activeCategory === 'peds-preg' && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/40 to-purple-950/40 border border-pink-500/40 space-y-4 animate-fadeIn">
                <div className="space-y-2">
                  <span className="font-extrabold text-pink-300 block text-xs flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-pink-400" />
                    <span>پارامترهای محاسبه دوز اطفال (Pediatric Dosing):</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">وزن کودک (kg):</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={pedsWeightKg}
                        onChange={(e) => setPedsWeightKg(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl glass-input font-black text-center text-pink-300"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">سن کودک (سال):</label>
                      <input
                        type="number"
                        min={0}
                        max={16}
                        value={pedsAgeYrs}
                        onChange={(e) => setPedsAgeYrs(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl glass-input font-black text-center text-purple-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">انتخاب دارو یا دوز سفارشی:</label>
                    <select
                      value={pedsDrug}
                      onChange={(e) => setPedsDrug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-white bg-slate-900"
                    >
                      <option value="amox" className="bg-slate-900">آموکسی‌سیلین (Amoxicillin 40 mg/kg/day)</option>
                      <option value="acet" className="bg-slate-900">استامینوفن / پاراستامول (Acetaminophen 15 mg/kg/dose)</option>
                      <option value="ibup" className="bg-slate-900">ایبوپروفن (Ibuprofen 10 mg/kg/dose)</option>
                      <option value="cetir" className="bg-slate-900">ستیریزین / زرتیک (Cetirizine 0.25 mg/kg/dose)</option>
                      <option value="custom" className="bg-slate-900">محاسبه سفارشی بر اساس mg/kg وارد شده</option>
                    </select>
                  </div>

                  {pedsDrug === 'custom' && (
                    <div>
                      <label className="text-xs text-amber-300 font-bold block mb-1">دوز مورد نظر (mg/kg):</label>
                      <input
                        type="number"
                        min={0.1}
                        max={200}
                        step="0.5"
                        value={pedsCustomMgKg}
                        onChange={(e) => setPedsCustomMgKg(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl glass-input font-black text-center text-amber-400 text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                  <span className="font-extrabold text-purple-300 block flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-purple-400" />
                    <span>ارزیابی ایمنی دارو در بارداری و شیردهی (Pregnancy & Lactation):</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">سه ماهه بارداری:</label>
                      <select
                        value={pregTrimester}
                        onChange={(e) => setPregTrimester(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-xl glass-input font-bold text-white bg-slate-900 text-[11px]"
                      >
                        <option value="1st" className="bg-slate-900">سه ماهه اول (1st Trimester)</option>
                        <option value="2nd" className="bg-slate-900">سه ماهه دوم (2nd Trimester)</option>
                        <option value="3rd" className="bg-slate-900">سه ماهه سوم (3rd Trimester)</option>
                        <option value="lactation" className="bg-slate-900">دوران شیردهی (Breastfeeding)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">دسته دارویی:</label>
                      <select
                        value={pregDrugCategory}
                        onChange={(e) => setPregDrugCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl glass-input font-bold text-white bg-slate-900 text-[11px]"
                      >
                        <option value="analgesic" className="bg-slate-900">مسکن‌ها (استامینوفن / NSAIDs)</option>
                        <option value="antibiotic" className="bg-slate-900">آنتی‌بیوتیک‌ها (پنی‌سیلین / سفالوسپورین)</option>
                        <option value="antihistamine" className="bg-slate-900">ضدحساسیت (ستیریزین / لوراتادین)</option>
                        <option value="htn" className="bg-slate-900">ضدفشارخون (متیل‌دوپا / ACEi)</option>
                        <option value="ppi" className="bg-slate-900">گوارشی و PPI (امپرازول / پنتوپرازول)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Renal specific input */}
            {activeCategory === 'renal' && (
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-3 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-blue-300 block">سرم کراتینین (Serum Creatinine - mg/dL):</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.2}
                    max={15}
                    value={creatinineMgDl}
                    onChange={(e) => setCreatinineMgDl(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-base font-black text-center text-white"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isBlack}
                    onChange={(e) => setIsBlack(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <span>نژاد آفریقایی-آمریکایی (جهت محاسبه دقیق CKD-EPI eGFR)</span>
                </label>
              </div>
            )}

            {/* Cardiology specific check boxes */}
            {activeCategory === 'cardio' && (
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2.5 animate-fadeIn text-xs">
                <span className="font-extrabold text-rose-300 block mb-1">فاکتورهای بالینی خطر (Risk Factors):</span>
                {[
                  { label: 'نارسایی قلبی / اختلال بطن چپ (CHF / LVD)', state: chf, setter: setChf },
                  { label: 'فشار خون بالا (Hypertension / HTN)', state: htn, setter: setHtn },
                  { label: 'دیابت شیرین (Diabetes Mellitus / DM)', state: dm, setter: setDm },
                  { label: 'سابقه سکته مغزی یا TIA یا ترومبوآمبولی (Stroke / TIA)', state: strokeHx, setter: setStrokeHx },
                  { label: 'بیماری عروقی (MI سابق، PAD، پلاک آئورت)', state: vascDisease, setter: setVascDisease },
                  { label: 'اختلال عملکرد کلیه (Renal disease Cr > 2.2)', state: abnormalRenal, setter: setAbnormalRenal },
                  { label: 'اختلال عملکرد کبد (Liver disease سیروز / بیلی‌روبین بالا)', state: abnormalLiver, setter: setAbnormalLiver },
                  { label: 'سابقه خونریزی شدید یا استعداد خونریزی (Bleeding Hx)', state: bleedingHx, setter: setBleedingHx },
                  { label: 'بی‌ثباتی INR در درمان با وارفارین (Labile INR)', state: labileInr, setter: setLabileInr },
                  { label: 'سن بالای ۶۵ سال یا ضعف جسمانی (Elderly / Frail)', state: elderly65 || age >= 65, setter: (val: boolean) => { setElderly65(val); if (val && age < 65) setAge(65); } },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-start gap-2 text-slate-200 cursor-pointer select-none hover:text-white">
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => { triggerHaptic('light'); item.setter(e.target.checked); }}
                      className="rounded text-rose-500 focus:ring-0 w-4 h-4 mt-0.5 flex-shrink-0"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
                
                <div className="pt-2 border-t border-rose-500/20 space-y-1">
                  <label className="font-bold text-rose-300 block">مصرف الکل یا داروهای افزایش‌دهنده خونریزی (NSAIDs/آسپرین):</label>
                  <select
                    value={drugsOrAlcohol}
                    onChange={(e) => setDrugsOrAlcohol(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-white bg-slate-900"
                  >
                    <option value={0} className="bg-slate-900">هیچکدام (۰ امتیاز)</option>
                    <option value={1} className="bg-slate-900">مصرف داروی NSAID/آسپرین یا مصرف الکل (۱ امتیاز)</option>
                    <option value={2} className="bg-slate-900">مصرف همزمان داروی NSAID و الکل (۲ امتیاز)</option>
                  </select>
                </div>
              </div>
            )}

            {/* ICU & Emergency specific check boxes (CURB-65, SOFA, APACHE II) */}
            {activeCategory === 'icu' && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2.5 animate-fadeIn text-xs">
                <span className="font-extrabold text-amber-300 block mb-1">فاکتورهای ارزیابی پنومونی و اورژانس (CURB-65 / SOFA):</span>
                {[
                  { label: 'C - اختلال سطح هوشیاری جدید (Confusion / GCS < 8)', state: curbC, setter: setCurbC },
                  { label: 'U - اوره خون بالا (BUN > 19 mg/dL یا Urea > 7 mmol/L)', state: curbU, setter: setCurbU },
                  { label: 'R - تندنفسی (Respiratory Rate >= 30 breaths/min)', state: curbR, setter: setCurbR },
                  { label: 'B - افت فشار خون (Systolic < 90 mmHg یا Diastolic <= 60 mmHg)', state: curbB, setter: setCurbB },
                  { label: '65 - سن ۶۵ سال یا بیشتر (Age >= 65)', state: curb65 || age >= 65, setter: (val: boolean) => { setCurb65(val); if (val && age < 65) setAge(65); } },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-start gap-2 text-slate-200 cursor-pointer select-none hover:text-white">
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => { triggerHaptic('light'); item.setter(e.target.checked); }}
                      className="rounded text-amber-500 focus:ring-0 w-4 h-4 mt-0.5 flex-shrink-0"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT / RESULTS PANEL (6 Columns on LG) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* PEDIATRIC & PREGNANCY RESULTS */}
          {activeCategory === 'peds-preg' && (() => {
            let targetMg = 0;
            let freq = '';
            let syrupName = '';
            let syrupVolMl = '';
            let drugNameFa = '';

            if (pedsDrug === 'amox') {
              targetMg = pedsWeightKg * 40;
              freq = 'منقسم در ۲ یا ۳ دوز در روز (هر ۸ یا ۱۲ ساعت)';
              syrupName = 'سوسپانسیون ۲۵۰ میلی‌گرم در ۵ میلی‌لیتر';
              syrupVolMl = (targetMg / 50).toFixed(1) + ' میلی‌لیتر در ۲۴ ساعت (تقسیم بر دفعات)';
              drugNameFa = 'آموکسی‌سیلین (Amoxicillin)';
            } else if (pedsDrug === 'acet') {
              targetMg = pedsWeightKg * 15;
              freq = 'در صورت تب یا درد هر ۴ تا ۶ ساعت (حداکثر ۵ بار در روز)';
              syrupName = 'شربت ۱۲۰ میلی‌گرم در ۵ میلی‌لیتر';
              syrupVolMl = (targetMg / 24).toFixed(1) + ' میلی‌لیتر در هر نوبت مصرف';
              drugNameFa = 'استامینوفن / پاراستامول (Acetaminophen)';
            } else if (pedsDrug === 'ibup') {
              targetMg = pedsWeightKg * 10;
              freq = 'در صورت نیاز هر ۶ تا ۸ ساعت (همراه با غذا یا شیر)';
              syrupName = 'سوسپانسیون ۱۰۰ میلی‌گرم در ۵ میلی‌لیتر';
              syrupVolMl = (targetMg / 20).toFixed(1) + ' میلی‌لیتر در هر نوبت مصرف';
              drugNameFa = 'ایبوپروفن (Ibuprofen / ژلوفن کودکان)';
            } else if (pedsDrug === 'cetir') {
              targetMg = pedsWeightKg * 0.25;
              freq = 'یک بار در روز (ترجیحاً عصرها یا قبل از خواب)';
              syrupName = 'شربت ۵ میلی‌گرم در ۵ میلی‌لیتر';
              syrupVolMl = (targetMg / 1).toFixed(1) + ' میلی‌لیتر یک بار در روز';
              drugNameFa = 'ستیریزین / زرتیک (Cetirizine)';
            } else {
              targetMg = pedsWeightKg * (pedsCustomMgKg || 0);
              freq = 'مطابق با دستور پزشک معالج یا پروتکل کلینیکی دارو';
              syrupName = `محاسبه بر اساس نرخ ${pedsCustomMgKg} mg/kg`;
              syrupVolMl = 'بر اساس غلظت داروی موجود محاسبه و تنظیم شود';
              drugNameFa = 'داروی انتخابی سفارشی (Custom Drug Rate)';
            }

            const clarkRuleMg = ((pedsWeightKg / 70) * 500).toFixed(0); // Assuming 500mg adult dose
            const youngRuleMg = ((pedsAgeYrs / (pedsAgeYrs + 12)) * 500).toFixed(0);

            // Pregnancy guidance
            let pregCat = 'B';
            let pregTitle = 'ایمن در بارداری (Safe with Supervision)';
            let pregDesc = '';
            let pregColor = 'text-emerald-400 border-emerald-500 bg-emerald-950/40';

            if (pregDrugCategory === 'analgesic') {
              if (pregTrimester === '3rd') {
                pregCat = 'D / X';
                pregTitle = '🚨 منع مصرف در سه ماهه سوم (Contraindicated in 3rd Trimester)';
                pregDesc = 'مصرف مسکن‌های NSAID (مانند ایبوپروفن، ناپروکسن، ژلوفن یا دیکلوفناک) در سه ماهه سوم بارداری به دلیل خطر بسته شدن زودرس مجرای شریانی (Ductus Arteriosus) جنین و کاهش مایع آمنیوتیک اکیداً ممنوع است. استامینوفن (باکتگوری B) گزینه ایمن مسکن است.';
                pregColor = 'text-rose-400 border-rose-500 bg-rose-950/40';
              } else {
                pregCat = 'B / C';
                pregTitle = 'احتیاط بالینی (Use Caution - Acetaminophen Preferred)';
                pregDesc = 'استامینوفن در تمام دوران بارداری و شیردهی (دسته B) ایمن‌ترین مسکن است. مصرف NSAIDها در سه ماهه اول و دوم تنها در صورت ضرورت بالینی و با حداقل دوز و مدت ممکن مجاز است.';
                pregColor = 'text-amber-400 border-amber-500 bg-amber-950/40';
              }
            } else if (pregDrugCategory === 'antibiotic') {
              pregCat = 'B';
              pregTitle = 'آنتی‌بیوتیک‌های گروه پنی‌سیلین و سفالوسپورین ایمن هستند';
              pregDesc = 'آموکسی‌سیلین، آمپی‌سیلین، سفالکسین و اریترومایسین (در شیردهی) عموماً در دسته B بارداری قرار دارند و با تجویز پزشک ایمن هستند. توجه: آنتی‌بیوتیک‌های گروه تتراسایکلین (مانند داکسی‌سایکلین) به دلیل آسیب به استخوان و دندان جنین در دسته D بوده و ممنوع می‌باشند.';
              pregColor = 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
            } else if (pregDrugCategory === 'antihistamine') {
              pregCat = 'B';
              pregTitle = 'آنتی‌هیستامین‌های نسل دوم ایمن (Category B)';
              pregDesc = 'ستیریزین، لوراتادین و فکسوفنادین در دوران بارداری در دسته B قرار دارند و برای کنترل رینیت آلرژیک و کهیر با مشورت پزشک متخصص ایمن می‌باشند. در دوران شیردهی نیز ترشح ناچیزی در شیر دارند.';
              pregColor = 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
            } else if (pregDrugCategory === 'htn') {
              pregCat = 'B vs X';
              pregTitle = '⚠️ تفاوت حیاتی دسته‌ها در داروهای فشار خون';
              pregDesc = 'متیل‌دوپا، لابتالول و نیفدیپین گزینه‌های خط اول و ایمن (دسته B/C) برای کنترل فشار خون در بارداری و پره‌اکلامپسی هستند. 🚨 هشدار جدی: داروهای مهارکننده ACE (مانند انالاپریل و کاپتوپریل) و ARBs (مانند لوزارتان و والزارتان) در تمام دوران بارداری در دسته X بوده و تراتوژن (آسیب‌رسان شدید به جنین) هستند!';
              pregColor = 'text-amber-400 border-amber-500 bg-amber-950/40';
            } else if (pregDrugCategory === 'ppi') {
              pregCat = 'B';
              pregTitle = 'داروهای کاهنده اسید معده و PPI (Category B)';
              pregDesc = 'امپرازول، پنتوپرازول، لانسوپرازول و رانیتیدین در دسته B بارداری قرار دارند و برای درمان سوزش سر دل و رفلاکس شدید بارداری که به اصلاح رژیم غذایی پاسخ نداده است، با تجویز پزشک ایمن می‌باشند.';
              pregColor = 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
            }

            return (
              <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-pink-500/40 space-y-5 shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    Pediatric & Pregnancy Dosing
                  </span>
                  <span className="text-xs text-slate-400">محاسبه دوز اطفال و ایمنی بارداری</span>
                </div>

                {/* PEDS DOSING BOX */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-pink-950/60 border border-pink-400 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-pink-200 font-extrabold">{drugNameFa}</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-mono font-bold">
                      وزن کودک: {pedsWeightKg} kg
                    </span>
                  </div>

                  <div className="text-center py-2 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-300 font-bold block mb-1">مقدار دوز دارویی محاسبه‌شده (Calculated Dose):</span>
                    <span className="text-3xl font-black text-white block">{targetMg.toFixed(1)} <small className="text-sm font-normal text-pink-300">میلی‌گرم (mg)</small></span>
                    <span className="text-xs font-extrabold text-emerald-300 mt-1 block">{syrupVolMl}</span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-200">
                    <p>⏰ <strong className="text-slate-400">فواصل و زمان مصرف:</strong> {freq}</p>
                    <p>🧪 <strong className="text-slate-400">مبنای شربت / سوسپانسیون:</strong> {syrupName}</p>
                  </div>
                </div>

                {/* CLARK AND YOUNG RULES */}
                <div className="grid grid-cols-2 gap-3 text-xs text-center">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 block font-bold mb-0.5">فرمول کلارک (Clark's Rule - وزن):</span>
                    <span className="text-sm font-black text-purple-300">~ {clarkRuleMg} mg</span>
                    <span className="text-[9px] text-slate-400 block">تخمین دوز نسبت به بزرگسال ۵۰۰mg</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 block font-bold mb-0.5">فرمول یانگ (Young's Rule - سن):</span>
                    <span className="text-sm font-black text-blue-300">~ {youngRuleMg} mg</span>
                    <span className="text-[9px] text-slate-400 block">تخمین بر اساس سن {pedsAgeYrs} سال</span>
                  </div>
                </div>

                {/* PREGNANCY SAFETY BOX */}
                <div className={`p-4.5 rounded-2xl border space-y-2 text-xs leading-relaxed ${pregColor}`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-black text-sm flex items-center gap-1.5">
                      <span>🤰 وضعیت در بارداری ({pregTrimester}):</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/50 text-white font-mono font-black text-xs">
                      Category {pregCat}
                    </span>
                  </div>
                  <h4 className="font-black text-white text-sm pt-0.5">{pregTitle}</h4>
                  <p className="text-slate-200 font-medium">{pregDesc}</p>
                  <p className="text-[10px] text-slate-300 pt-1 font-mono">
                    📚 رفرنس‌ها: راهنمای ایمنی بارداری FDA، کاتالوگ دارویاب و Medscape Drug Reference
                  </p>
                </div>
              </div>
            );
          })()}

          {/* BODY METRICS RESULTS */}
          {activeCategory === 'body' && (
            <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-cyan-500/40 space-y-5 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  General Body & Dosing Metrics
                </span>
                <span className="text-xs text-slate-400">محاسبات دوز و شاخص‌های بدنی</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 space-y-1 text-center">
                  <span className="text-xs text-slate-400 font-bold block">شاخص توده بدنی (BMI)</span>
                  <span className="text-3xl font-black text-white block">{bmi}</span>
                  <span className={`text-[11px] font-bold block ${
                    Number(bmi) < 18.5 ? 'text-amber-400' : Number(bmi) < 25 ? 'text-emerald-400' : Number(bmi) < 30 ? 'text-blue-300' : 'text-rose-400'
                  }`}>
                    {Number(bmi) < 18.5 && 'کمبود وزن (Underweight)'}
                    {Number(bmi) >= 18.5 && Number(bmi) < 25 && 'وزن نرمال و سالم (Normal)'}
                    {Number(bmi) >= 25 && Number(bmi) < 30 && 'اضافه وزن (Overweight)'}
                    {Number(bmi) >= 30 && 'چاقی بالینی (Obese)'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 space-y-1 text-center">
                  <span className="text-xs text-slate-400 font-bold block">مساحت سطح بدن (BSA Du Bois)</span>
                  <span className="text-3xl font-black text-indigo-300 block">{bsaDuBois} <small className="text-xs font-normal">m²</small></span>
                  <span className="text-[11px] text-slate-300 block font-medium">مناسب دوز داروهای شیمی‌درمانی</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs text-slate-400 font-bold block">وزن ایده‌آل (Ideal Body Weight - IBW):</span>
                  <span className="text-xl font-black text-emerald-400">{ibw} کیلوگرم</span>
                  <p className="text-[11px] text-slate-400">مرجع محاسبه دوز داروهای هیدروفیل و ونکومایسین</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-xs text-slate-400 font-bold block">وزن تنظیم‌شده (Adjusted Body Weight):</span>
                  <span className="text-xl font-black text-blue-400">{abw} کیلوگرم</span>
                  <p className="text-[11px] text-slate-400">مرجع دوز در بیماران چاق (مؤلفه ۰.۴)</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300 leading-relaxed">
                💡 <strong className="text-cyan-300">نکته بالینی:</strong> برای داروهایی با حاشیه درمانی باریک (مانند آمینوگلیکوزیدها)، در بیماران با وزن بیش از ۱۲۰٪ وزن ایده‌آل (IBW)، استفاده از وزن تنظیم‌شده (ABW) از مسمومیت کلیوی جلوگیری می‌کند.
              </div>
            </div>
          )}

          {/* RENAL RESULTS */}
          {activeCategory === 'renal' && (
            <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-blue-500/40 space-y-5 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Renal Function & Drug Clearance
                </span>
                <span className="text-xs text-slate-400">محاسبه کلیرانس و eGFR</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-indigo-950/60 border border-blue-400 space-y-1 text-center shadow-lg">
                  <span className="text-xs text-blue-200 font-bold block">کلیرانس کراتینین (Cockcroft-Gault CrCl)</span>
                  <span className="text-3xl font-black text-white block">{crCl} <small className="text-xs font-normal text-blue-300">mL/min</small></span>
                  <span className="text-[11px] text-emerald-300 font-bold block">استاندارد تنظیم دوز آنتی‌بیوتیک‌ها و داروهای کلیوی</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-indigo-950/60 border border-purple-400 space-y-1 text-center shadow-lg">
                  <span className="text-xs text-purple-200 font-bold block">نرخ فیلتراسیون گلومرولی (CKD-EPI eGFR)</span>
                  <span className="text-3xl font-black text-white block">{egfr} <small className="text-xs font-normal text-purple-300">mL/min/1.73m²</small></span>
                  <span className="text-[11px] text-purple-300 font-bold block">مرجع طبقه‌بندی مراحل بیماری مزمن کلیه (CKD)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <span className="font-extrabold text-blue-300 block">تفسیر بالینی و تنظیم دوز (Dosing Guidance):</span>
                <p className="text-slate-200 leading-relaxed">
                  {Number(crCl) >= 60 && '✅ عملکرد کلیوی مطلوب است. نیازی به کاهش دوز اکثر داروهای دفعی از کلیه (مانند آموکسی‌سیلین، سیپروفلوکساسین یا گاباپنتین) نیست.'}
                  {Number(crCl) >= 30 && Number(crCl) < 60 && '⚠️ نارسایی متوسط کلیوی (CKD Stage 3). کاهش دوز داروهایی نظیر متفورمین، لووکساستین و هپارین‌های با وزن مولکولی پایین (LMWH) توصیه می‌شود.'}
                  {Number(crCl) < 30 && '🚨 نارسایی شدید کلیوی (CKD Stage 4/5). تنظیم دقیق دوز، پرهیز از مسکن‌های NSAIDs (ژلوفن و بروفن) و مانیتورینگ سطح سرمی داروها ضروری است.'}
                </p>
              </div>
            </div>
          )}

          {/* CARDIOLOGY RESULTS */}
          {activeCategory === 'cardio' && (
            <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-rose-500/40 space-y-5 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Cardiology & Anticoagulation Risk
                </span>
                <span className="text-xs text-slate-400">ریسک سکته مغزی و خونریزی</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/60 to-pink-950/60 border border-rose-500 space-y-1 text-center shadow-lg">
                  <span className="text-xs text-rose-200 font-bold block">نمره CHA₂DS₂-VASc (ریسک سکته AF)</span>
                  <span className="text-4xl font-black text-white block">{chaScore} <small className="text-xs font-normal">امتیاز</small></span>
                  <span className={`text-[11px] font-extrabold block ${chaScore >= 2 ? 'text-rose-400' : chaScore === 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {chaScore === 0 && 'ریسک پایین (Low Risk - بدون نیاز به ضدانعقاد)'}
                    {chaScore === 1 && 'ریسک متوسط (Consider OAC / Aspirin)'}
                    {chaScore >= 2 && '🚨 ریسک بالا (High Risk - شروع OAC / NOAC توصیه می‌شود)'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 to-orange-950/60 border border-amber-500 space-y-1 text-center shadow-lg">
                  <span className="text-xs text-amber-200 font-bold block">نمره HAS-BLED (ریسک خونریزی عمده)</span>
                  <span className="text-4xl font-black text-white block">{hasBledScore} <small className="text-xs font-normal">امتیاز</small></span>
                  <span className={`text-[11px] font-extrabold block ${hasBledScore >= 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {hasBledScore < 3 && 'ریسک خونریزی قابل قبول (Low/Moderate Risk)'}
                    {hasBledScore >= 3 && '⚠️ ریسک بالای خونریزی (High Bleeding Risk - احتیاط در وارفارین)'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300 leading-relaxed">
                🫀 <strong className="text-rose-300">ACC/AHA CVD Risk & Anticoagulation:</strong> در بیماران با فیبریلاسیون دهلیزی (AF)، نمره CHA₂DS₂-VASc بالای ۲ در مردان یا ۳ در زنان، شروع درمان با داروهای ضدانعقاد جدید (مانند آپیکسابان یا ریواروکسابان) را جهت پیشگیری از سکته مغزی توجیه می‌کند.
              </div>
            </div>
          )}

          {/* ICU & EMERGENCY RESULTS */}
          {activeCategory === 'icu' && (
            <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-amber-500/40 space-y-5 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Critical Care & Pneumonia Triage
                </span>
                <span className="text-xs text-slate-400">ارزیابی اورژانس و ICU</span>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-rose-950/60 border border-amber-400 space-y-2 text-center shadow-lg">
                <span className="text-xs text-amber-200 font-bold block">نمره CURB-65 (تریاژ پنومونی اکتسابی از جامعه - CAP)</span>
                <span className="text-5xl font-black text-white block">{curbScore} <small className="text-base font-normal text-amber-300">از ۵ امتیاز</small></span>
                <span className={`text-xs font-extrabold block pt-1 ${curbScore >= 3 ? 'text-rose-400' : curbScore === 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {curbScore === 0 || curbScore === 1 ? '🟢 ریسک مرگ‌ومیر پایین (Low Risk < 3%). درمان سرپایی (Outpatient Care) یا بستری کوتاه.' : ''}
                  {curbScore === 2 ? '🟡 ریسک متوسط (Moderate Risk ~ 9%). بستری در بخش داخلی (Inpatient Hospitalization) یا نظارت دقیق.' : ''}
                  {curbScore >= 3 ? '🔴 ریسک شدید و بحرانی (High Mortality Risk 15-40%). بستری فوری در ICU و شروع آنتی‌بیوتیک تزریقی وسیع‌الطیف.' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-extrabold text-white block">📊 SOFA Score (Sequential Organ Failure Assessment):</span>
                  <p className="text-slate-300">ارزیابی ۶ ارگان تنفسی (PaO2/FiO2)، انعقادی (پلاکت)، کبد (بیلی‌روبین)، قلب (فشار خون)، اعصاب (GCS) و کلیه (کراتینین) در بخش مراقبت‌های ویژه.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-extrabold text-white block">📈 APACHE II (Severity of Disease Classification):</span>
                  <p className="text-slate-300">ارزیابی ۱۲ متغیر فیزیولوژیک در ۲۴ ساعت اول ورود به ICU جهت تخمین دقیق احتمال مرگ‌ومیر بیماران بدحال.</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
