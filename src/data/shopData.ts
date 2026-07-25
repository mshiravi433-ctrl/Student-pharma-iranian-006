import { ShopProduct } from '../types';

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'prod-littmann-classic',
    title: 'گوشی پزشکی لیتمن کلاسیک ۳ (Littmann Classic III - واردات مستقیم)',
    category: 'medical-tools',
    brand: '3M Littmann (سفارش آسیا / چین)',
    countryOfOrigin: 'آمریکا (مونتاژ و واردات مستقیم از نمایندگی چین)',
    priceToman: 4200000,
    marketPriceToman: 7800000, // ~46% cheaper than Iran market!
    discountPercent: 46,
    deliveryTimeDays: '۱۰ تا ۲۰ روز کاری',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=500&auto=format&fit=crop&q=80',
    description: 'گوشی معاینه استاندارد طلایی برای دانشجویان پزشکی، پرستاری و رزیدنت‌ها؛ دارای دیافراگم قابل تنظیم دو طرفه برای معاینه بزرگسالان و اطفال با آکوستیک فوق‌العاده شفاف و تیوب مقاوم در برابر چربی پوست و الکل.',
    features: [
      'دیافراگم دو حالته (Tuneable Diaphragm) برای شنیدن فرکانس‌های بالا و پایین',
      'قطعه سینه (Chestpiece) استیل ضد زنگ ماشین‌کاری شده با دقت بالا',
      'تیلور بدون لاتکس (Latex-free) و مناسب برای افراد حساس',
      '۴۶٪ ارزان‌تر از نرخ بازار تجهیزات پزشکی خیابان ولیعصر تهران'
    ]
  },
  {
    id: 'prod-dental-handpiece',
    title: 'توربین و هندپیس دندانپزشکی فایبرگلاس پوش‌باتن (COXO Premium Turbine)',
    category: 'dental-tools',
    brand: 'COXO / NSK Style (گرید A وارداتی چین)',
    countryOfOrigin: 'چین (High-End Medical Grade)',
    priceToman: 2800000,
    marketPriceToman: 5900000, // ~52% cheaper
    discountPercent: 53,
    deliveryTimeDays: '۱۰ تا ۲۰ روز کاری',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&auto=format&fit=crop&q=80',
    description: 'توربین پرسرعت دندانپزشکی با بلبرینگ سرامیکی ژاپنی، سیستم اسپری آب ۳ نقطه (Triple Water Spray) و هد پوش‌باتن (Push Button). بی‌صدا، بدون لرزش و بسیار مقاوم در برابر اتوکلاو مکرر؛ انتخابی بی‌نظیر برای دانشجویان استیج و بخش ترمیمی.',
    features: [
      'بلبرینگ سرامیکی فوق دقیق با سرعت ۳۵۰,۰۰۰ تا ۴۰۰,۰۰۰ دور در دقیقه',
      'سیستم ضد بازگشت عفونت و آب (Anti-retraction system)',
      'قابلیت اتوکلاو در دمای ۱۳۵ درجه سانتی‌گراد بدون افت کیفیت بلبرینگ',
      'بیش از ۵۰ درصد تخفیف ویژه دانشجویان دندانپزشکی سراسر کشور'
    ]
  },
  {
    id: 'prod-student-ipad',
    title: 'تبلت دانشجویی تبلت لنوو و قلم نوری (Lenovo Xiaoxin Pad Pro 2025 + Stylus)',
    category: 'electronics',
    brand: 'Lenovo (نسخه اصلی بازار چین - رام گلوبال)',
    countryOfOrigin: 'چین (واردات مستقیم از کارخانه)',
    priceToman: 13500000,
    marketPriceToman: 22500000, // 40% cheaper
    discountPercent: 40,
    deliveryTimeDays: '۱۰ تا ۲۰ روز کاری',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80',
    description: 'بهترین جایگزین اقتصادی برای آیپد جهت مطالعه کتاب‌های پزشکی ۳۰۰۰ صفحه‌ای (مثل هریسون، گری و سیسیل) و نت‌برداری با قلم در کلاس‌های دانشگاه؛ صفحه نمایش ۱۱.۵ اینچی 120Hz 2.5K و باتری پرقدرت ۸۶۰۰ میلی‌آمپر.',
    features: [
      'صفحه نمایش 2.5K با نرخ تازه‌سازی ۱۲۰ هرتز مجهز به فناوری محافظت چشم (TÜV Rheinland)',
      'همراه با قلم هوشمند ۴۰۹۶ سطح فشار برای نوت‌برداری روان در GoodNotes و Notability',
      'پردازنده قدرتمند ۸ هسته‌ای، حافظه ۲۵۶ گیگابایت و رم ۸ گیگابایت',
      'تضمین اصالت کالا و ۴۰٪ قیمت کمتر نسبت به فروشگاه‌های دیجیتال ایران'
    ]
  },
  {
    id: 'prod-medical-scrub',
    title: 'ست اسکراب و روپوش پزشکی کشسانی ۴ جهته (Cherokee Style Medical Scrub)',
    category: 'apparel',
    brand: 'MedFashion Pro (وارداتی چین با پارچه ضد لک)',
    countryOfOrigin: 'چین / ویتنام',
    priceToman: 890000,
    marketPriceToman: 1950000, // ~54% cheaper
    discountPercent: 54,
    deliveryTimeDays: '۱۰ تا ۲۰ روز کاری',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
    description: 'ست اسکراب (بلوز و شلوار) فوق‌العاده راحت، خنک و ضد چروک مخصوص شیفت‌های طولانی بیمارستان و اتاق عمل؛ دوخته شده از الیاف تنفس‌پذیر اسپاندکس و پلی‌ویسکوز با قابلیت شستشوی مداوم بدون رنگ‌پریدگی.',
    features: [
      'پارچه کشسانی ۴ جهته (4-Way Stretch) بسیار سبک و خنک',
      'مقاوم در برابر لکه خون، بتادین و وایتکس با فناوری نانو ضد تعریق',
      'دارای ۶ جیب جادار و طراحی ارگونومیک متناسب با آناتومی بدن در شیفت شب',
      'ارائه در رنگ‌های سرمه‌ای، آبی کاربنی، سبز اتاق عمل، مشکی و زرشکی'
    ]
  },
  {
    id: 'prod-anatomy-model',
    title: 'مولاژ و مدل آناتومی جمجمه و مغز ۸ قطعه‌ای (3D Human Skull & Brain Model)',
    category: 'medical-tools',
    brand: 'ENOVO Bio-Models',
    countryOfOrigin: 'چین (تولیدکننده مولاژهای آزمایشگاهی دانشگاه‌های آسیا)',
    priceToman: 1850000,
    marketPriceToman: 4200000, // ~56% cheaper
    discountPercent: 56,
    deliveryTimeDays: '۱۰ تا ۲۰ روز کاری',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=80',
    description: 'مولاژ طبیعی ۱:۱ جمجمه و مغز انسان با تفکیک دقیق لوب‌های مغزی (فرونتال، پاریتال، اکسیپیتال، تمپورال، مخچه و ساقه مغز)؛ استخوان‌های جمجمه قابل جدا شدن و دارای شماره‌گذاری دقیق ساختارها و اعصاب مغزی.',
    features: [
      'ساخته شده از پی‌وی‌سی (PVC) غیرسمی و نشکن با جزئیات آناتومیک فوق‌العاده دقیق',
      'قابلیت جداسازی به ۸ قطعه مجزا برای مطالعه سه بعدی کالبدشناسی و نوروآناتومی',
      'همراه با دفترچه راهنمای لاتین و کدگذاری تمام سوراخ‌ها و فورامن‌های کف جمجمه',
      'بیش از ۵۵ درصد زیر قیمت فروشگاه‌های مولاژ و وسایل آزمایشگاهی'
    ]
  },
  {
    id: 'prod-powerbank',
    title: 'پاوربانک ۲۰,۰۰۰ میلی‌آمپر فست شارژ ۶۵ وات (Anker 65W Laptop & Phone Charger)',
    category: 'electronics',
    brand: 'Anker / Baseus (واردات مستقیم از فروشگاه رسمی چین)',
    countryOfOrigin: 'چین (تضمین اورجینال)',
    priceToman: 1950000,
    marketPriceToman: 3800000, // ~48% cheaper
    discountPercent: 48,
    deliveryTimeDays: '۱۰ تا ۲۰ روز کاری',
    image: 'https://images.unsplash.com/photo-1609592424209-27d4726e1a12?w=500&auto=format&fit=crop&q=80',
    description: 'ابزار حیاتی برای روزهای طولانی دانشگاه، کتابخانه و شیفت‌های اورژانس که دسترسی به پریز برق محدود است؛ توان خروجی ۶۵ وات واقعی قابلیت شارژ سریع لپ‌تاپ‌های تایپ C، آیپد و ۳ بار شارژ کامل گوشی موبایل را دارد.',
    features: [
      'ظرفیت واقعی ۲۰,۰۰۰ میلی‌آمپر ساعت با تکنولوژی PowerIQ 3.0 و PD',
      'دارای نمایشگر دیجیتال درصد باتری و توان خروجی لحظه‌ای',
      'قابلیت شارژ همزمان ۳ دستگاه (۲ پورت Type-C و یک پورت USB-A)',
      'تضمین اصالت کالا، بدون واسطه و ۴۸٪ ارزان‌تر از بازار الکترونیک تهران'
    ]
  }
];
