import { EducationResource } from '../types';

export interface EducationPlatform {
  name: string;
  url: string;
  icon: string;
  desc: string;
}

export const EDUCATION_PLATFORMS: EducationPlatform[] = [
  { name: "مدیکال لیست (Medicalist)", url: "https://medicalist.ir", icon: "📕", desc: "دانلود رایگان کتاب پزشکی – مدیکال لیست" },
  { name: "پایگاه SID (جهاد دانشگاهی)", url: "https://www.sid.ir/search/journal/paper/%D8%B9%D9%84%D9%88%D9%85%20%D9%BE%D8%B2%D8%B4%DA%A9%DB%8C/fa", icon: "🇮🇷", desc: "جستجوی مقالات علمی پژوهشی علوم پزشکی کشور" },
  { name: "اکسترن (Extern.ir)", url: "https://extern.ir", icon: "📗", desc: "دانلود رایگان کتاب‌های پزشکی، دندان‌پزشکی، داروسازی و پرستاری" },
  { name: "بانک مقالات پزشکی کشور", url: "https://www.magiran.com/category/medical", icon: "📑", desc: "Medical Articles بانک اطلاعات مقالات پزشکی" },
  { name: "لینوم (Linom.ir)", url: "https://linom.ir", icon: "🎬", desc: "دوره‌های آموزشی علوم پزشکی | لینوم" },
  { name: "فرادرس (Faradars)", url: "https://faradars.org/topics/medical-sciences", icon: "🎓", desc: "مجموعه آموزش عمومی پزشکی – جامع و کاربردی" },
  { name: "دانلود PDF کتاب‌های لاتین و افست", url: "https://share.google/KIvz7OJTFQRyByDkt", icon: "🗂️", desc: "دانلود رایگان کتابهای لاتین و افست پزشکی" },
  { name: "Osmosis", url: "https://www.osmosis.org", icon: "🎓", desc: "ویدئوهای آموزشی انیمیشنی پزشکی" },
  { name: "Khan Academy Medicine", url: "https://www.khanacademy.org/science/health-and-medicine", icon: "📚", desc: "آموزش رایگان علوم پزشکی و سلامت" },
  { name: "YouTube Medical", url: "https://www.youtube.com/@ArmandoHasudungan", icon: "▶️", desc: "آموزش تصویری بیماری‌ها با دست‌نویس" },
  { name: "Dr. Najeeb Lectures", url: "https://www.drnajeeblectures.com", icon: "🎬", desc: "جامع‌ترین ویدئوهای علوم پایه و کالبدشکافی" },
  { name: "Medscape", url: "https://www.medscape.com", icon: "📖", desc: "مرجع بالینی، اورژانس و دوز داروها" },
  { name: "Free Medical Books", url: "https://www.freemedicalbooksclub.com", icon: "📕", desc: "کتاب‌های رایگان پزشکی PDF" },
  { name: "LibGen", url: "https://libgen.is", icon: "🗂️", desc: "مرجع بین‌المللی دانلود کتاب‌های علمی رایگان" },
  { name: "Coursera Medicine", url: "https://www.coursera.org/browse/health", icon: "🌐", desc: "دوره‌های آنلاین تخصصی پزشکی دانشگاه‌های جهان" },
];

export const EDUCATION_RESOURCES: EducationResource[] = [
  {
    id: 'osmosis-cardio',
    titleFa: 'دوره جامع فیزیولوژی و پاتولوژی سیستم قلبی عروقی (Osmosis Cardiopulmonary)',
    titleEn: 'Cardiovascular Physiology & Pathology Mastery - Osmosis',
    category: 'medicine',
    type: 'video',
    provider: 'Osmosis',
    durationOrPages: '۴ ساعت و ۳۰ دقیقه (۱۸ ویدیو آموزشی انیمیشنی)',
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop&q=80',
    url: 'https://www.osmosis.org/learn/Cardiovascular_system',
    description: 'آموزش کاملاً مفهومی و بصری آناتومی، الکتروفیزیولوژی قلب، نارسایی قلبی (CHF)، آریتمی‌ها و داروهای ضد فشار خون با انیمیشن‌های بی‌نظیر Osmosis.',
    authorOrSpeaker: 'Dr. Rishi Desai & Osmosis Medical Team',
    rating: 4.9
  },
  {
    id: 'khan-academy-health',
    titleFa: 'دوره کامل علوم فیزیولوژی و پزشکی آکادمی خان (Khan Academy Health & Medicine)',
    titleEn: 'Khan Academy Free Health & Medicine Complete Course',
    category: 'basic-science',
    type: 'course',
    provider: 'Khan Academy',
    durationOrPages: '۴۵ ساعت (دوره ویدیویی و تعاملی رایگان)',
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&auto=format&fit=crop&q=80',
    url: 'https://www.khanacademy.org/science/health-and-medicine',
    description: 'آموزش رایگان و قدم به قدم سیستم‌های بدن انسان، ایمونولوژی، بیماری‌های تنفسی، گوارشی و غدد توسط مدرسین دانشگاه‌های هاروارد و استنفورد.',
    authorOrSpeaker: 'Salman Khan & Harvard Faculty',
    rating: 4.9
  },
  {
    id: 'youtube-armando',
    titleFa: 'آموزش تصویری و دست‌نویس بیماری‌ها و پاتوفیزیولوژی (Armando Hasudungan)',
    titleEn: 'Visual Medical Lectures & Pathophysiology by Armando Hasudungan',
    category: 'medicine',
    type: 'video',
    provider: 'YouTube',
    durationOrPages: 'بیش از ۵۰۰ ویدیو آموزشی رایگان در کانال یوتیوب',
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80',
    url: 'https://www.youtube.com/@ArmandoHasudungan',
    description: 'یکی از محبوب‌ترین کانال‌های پزشکی یوتیوب؛ آموزش تصویری با طراحی دستی روی تخته سفید برای فهم سریع مکانیسم داروها و بیماری‌ها.',
    authorOrSpeaker: 'Dr. Armando Hasudungan',
    rating: 5.0
  },
  {
    id: 'dr-najeeb-masterclass',
    titleFa: 'مسترکلاس جامع کالبدشکافی، نوروآناتومی و فیزیولوژی (Dr. Najeeb Lectures)',
    titleEn: 'World Most Popular Medical Lectures - Dr. Najeeb',
    category: 'anatomy',
    type: 'video',
    provider: 'Dr. Najeeb',
    durationOrPages: '۸۰۰+ ساعت تدریس مفهومی با کیفیت HD',
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=80',
    url: 'https://www.drnajeeblectures.com',
    description: 'جامع‌ترین ویدیوهای آموزشی جهان برای دانشجویان پزشکی و داوطلبان آزمون USMLE با تدریس بی‌نظیر دکتر نجیب برای درک عمیق علوم پایه.',
    authorOrSpeaker: 'Dr. Najeeb',
    rating: 4.9
  },
  {
    id: 'medscape-clinical-guide',
    titleFa: 'هندبوک تشخیص افتراقی و مرجع بالینی اورژانس Medscape',
    titleEn: 'Medscape Clinical Reference & Differential Diagnosis Handbook',
    category: 'basic-science',
    type: 'pdf',
    provider: 'Medscape',
    durationOrPages: '۲۹۰ صفحه (ویرایش جیبی برای استیج و اینترنی)',
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&auto=format&fit=crop&q=80',
    url: 'https://www.medscape.com',
    description: 'مرجع سریع برای تصمیم‌گیری بالینی بر بالین بیمار: دوز داروها، الگوریتم‌های احیای قلبی ریوی (ACLS) و اپروچ به علائم بالینی.',
    authorOrSpeaker: 'Medscape Editorial Board',
    rating: 4.8
  },
  {
    id: 'free-medical-books-club',
    titleFa: 'دانلود رایگان جدیدترین ویرایش کتاب‌های رفرنس پزشکی (Free Medical Books)',
    titleEn: 'Free Medical Books PDF Download - Harrison, Guyton, Robbins & Cecil',
    category: 'medicine',
    type: 'pdf',
    provider: 'Free Medical Books',
    durationOrPages: 'بیش از ۵۰,۰۰۰ کتاب الکترونیکی رایگان',
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80',
    url: 'https://www.freemedicalbooksclub.com',
    description: 'دسترسی مستقیم و رایگان به PDF کتاب‌های مرجع نظیر هریسون، گایتون، رابینز، سیسیل و نلسون در تمامی تخصص‌ها.',
    authorOrSpeaker: 'International Medical Club',
    rating: 4.9
  },
  {
    id: 'libgen-science-library',
    titleFa: 'کتابخانه علمی و مرجع مقالات و کتاب‌های دانشگاهی (LibGen / Library Genesis)',
    titleEn: 'Library Genesis Scientific Books & Articles Repository',
    category: 'basic-science',
    type: 'pdf',
    provider: 'LibGen',
    durationOrPages: 'دسترسی به میلیون‌ها مقاله و کتاب علمی',
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=500&auto=format&fit=crop&q=80',
    url: 'https://libgen.is',
    description: 'بزرگ‌ترین پایگاه داده آزاد برای دانلود رایگان کتاب‌های درسی دانشگاهی، مقالات ISI و مراجع پزشکی بدون محدودیت.',
    authorOrSpeaker: 'Open Science Foundation',
    rating: 5.0
  },
  {
    id: 'coursera-global-health',
    titleFa: 'دوره‌های آنلاین تخصصی پزشکی و سلامت دانشگاه‌های جهان (Coursera Medicine)',
    titleEn: 'Coursera Certified Medical & Healthcare Online Courses',
    category: 'medicine',
    type: 'course',
    provider: 'Coursera',
    durationOrPages: 'دوره‌های ۴ تا ۸ هفته‌ای با مدرک بین‌المللی',
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=80',
    url: 'https://www.coursera.org/browse/health',
    description: 'آموزش‌های تخصصی از دانشگاه‌های جانز هاپکینز، استنفورد، امپریال کالج لندن و پنسیلوانیا در حوزه سلامت عمومی و پزشکی بالینی.',
    authorOrSpeaker: 'Johns Hopkins & Stanford Faculty',
    rating: 4.8
  }
];
