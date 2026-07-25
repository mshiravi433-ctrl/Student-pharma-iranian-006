export type ActiveView = 
  | 'home'
  | 'drug-search'
  | 'calculators'
  | 'article-writing'
  | 'education'
  | 'jobs'
  | 'study-abroad'
  | 'shop'
  | 'support';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export interface DrugMonograph {
  id: string;
  nameFa: string;
  nameEn: string;
  genericNameFa: string;
  genericNameEn: string;
  category: string;
  type: 'chemical' | 'herbal' | 'supplement';
  indications: { fa: string; en: string };
  mechanism: { fa: string; en: string };
  dosageAndAdministration: {
    adults: { fa: string; en: string };
    pediatrics: { fa: string; en: string };
    elderly?: { fa: string; en: string };
  };
  forms: string[]; // e.g. ["Tablet 500mg", "Syrup 120mg/5ml", "IV Injection"]
  sideEffects: { fa: string[]; en: string[] };
  interactions: { fa: string[]; en: string[] };
  precautions: { fa: string; en: string };
  pregnancyCategory: string; // A, B, C, D, X
  source: string; // e.g., "Darooyab & FDA Guidelines"
}

export interface TreatmentProtocol {
  id: string;
  diseaseNameFa: string;
  diseaseNameEn: string;
  overview: { fa: string; en: string };
  firstLineTherapy: {
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    notesFa: string;
    notesEn: string;
  }[];
  adjunctiveHerbalTherapy: {
    name: string;
    usage: string;
    benefit: string;
  }[];
  lifestyleAdviceFa: string[];
  lifestyleAdviceEn: string[];
}

export interface EducationResource {
  id: string;
  titleFa: string;
  titleEn: string;
  category: 'medicine' | 'dental' | 'pharmacy' | 'basic-science' | 'nursing' | 'anatomy';
  type: 'video' | 'pdf' | 'course';
  provider: string; // Osmosis, Khan Academy, YouTube, Dr. Najeeb, Medscape, LibGen, Coursera, FreePDF
  durationOrPages: string;
  isFree: boolean;
  thumbnail: string;
  url: string;
  description: string;
  authorOrSpeaker: string;
  rating: number;
}

export interface StudentJob {
  id: string;
  title: string;
  companyOrClient: string;
  source: string; // JobVision, جابینجا, کارنو, ایران استخدام, لینکدین, کار پاره‌وقت پزشکی, etc.
  externalUrl?: string; // Direct link to original job post / source platform
  type: 'remote' | 'on-site' | 'hybrid' | 'project';
  salary: string; // e.g., "ساعتی ۱۵۰,۰۰۰ تومان" or "پروژه‌ای ۳,۰۰۰,۰۰۰ تومان"
  location: string;
  description: string;
  requirements: string[];
  postedAgo: string;
  category: 'research' | 'tutoring' | 'translation' | 'design' | 'content' | 'data-entry' | 'clinical' | 'medical-part-time';
}

export interface StudyAbroadForm {
  fullName: string;
  phone: string;
  primaryField: string; // e.g. Medicine, Dentistry
  secondaryField?: string;
  preferredCountries: string[]; // UK, Netherlands, China, India, Russia, Canada, Germany, Sweden, Italy
  academicBackground: string;
  englishProficiency: string;
  notes?: string;
}

export interface ShopProduct {
  id: string;
  title: string;
  category: 'medical-tools' | 'dental-tools' | 'electronics' | 'apparel' | 'stationery';
  brand: string;
  countryOfOrigin: string; // China, Germany, USA (imported via China)
  priceToman: number;
  marketPriceToman: number; // 40-70% higher in Iran
  discountPercent: number;
  deliveryTimeDays: string; // "۱۰ تا ۲۰ روز کاری"
  image: string;
  description: string;
  features: string[];
}

export interface CustomOrderForm {
  orderType: 'url' | 'description';
  url?: string;
  sourcePlatform?: 'Amazon' | 'Alibaba' | 'AliExpress' | 'Other';
  itemName?: string;
  brand?: string;
  countryOfOrigin?: string;
  additionalNotes?: string;
  contactPhone: string;
}
