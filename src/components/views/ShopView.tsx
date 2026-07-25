import React, { useState } from 'react';
import { SHOP_PRODUCTS } from '../../data/shopData';
import { ShopProduct } from '../../types';
import { sendToTelegramAdmin, triggerHaptic, getTelegramUser, formatPrice, DEVELOPER_TELEGRAM_ID } from '../../utils/telegram';
import { 
  ShoppingBag, 
  TrendingDown, 
  Clock, 
  ExternalLink, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Link as LinkIcon, 
  FileText, 
  Truck, 
  AlertCircle
} from 'lucide-react';

export const ShopView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom-order'>('catalog');
  
  // Custom Order Form state
  const [orderType, setOrderType] = useState<'url' | 'description'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [platform, setPlatform] = useState<'Amazon' | 'Alibaba' | 'AliExpress' | 'Other'>('AliExpress');
  const [itemName, setItemName] = useState('');
  const [brand, setBrand] = useState('');
  const [country, setCountry] = useState('چین (China / Import)');
  const [notes, setNotes] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  React.useEffect(() => {
    const user = getTelegramUser();
    if (user?.username) {
      setContactPhone(`@${user.username}`);
    }
  }, []);

  const handleOrderCuratedItem = async (prod: ShopProduct) => {
    triggerHaptic('heavy');
    const user = getTelegramUser();
    const phone = contactPhone || (user?.username ? `@${user.username}` : 'تلگرام فعال');
    
    const subject = `سفارش خرید مستقیم: ${prod.title}`;
    const message = `🛍️ سفارش کالای دانشجویی (واردات مستقیم از چین)\n\n📦 نام کالا: ${prod.title}\n🏷️ برند و مبدا: ${prod.brand} - ${prod.countryOfOrigin}\n💰 قیمت ویژه دانشجویی: ${formatPrice(prod.priceToman)} (تخفیف ${prod.discountPercent}٪)\n⏱️ مدت ارسال: ${prod.deliveryTimeDays}\n\n👤 خریدار: ${user?.first_name || 'دانشجو'} ${user?.last_name || ''}\n📱 راه ارتباطی: ${phone}`;

    await sendToTelegramAdmin(subject, message);
    alert(`سفارش خرید «${prod.title}» جهت تایید نهایی و هماهنگی ارسال به اکانت تلگرام @${DEVELOPER_TELEGRAM_ID} ارسال شد.`);
  };

  const handleCustomOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim()) {
      alert('لطفاً شماره تماس یا آی‌دی تلگرام خود را وارد کنید.');
      return;
    }

    triggerHaptic('heavy');
    setSubmitting(true);

    const user = getTelegramUser();
    const subject = `سفارش سفارشی وسایل دانشجویی - ${orderType === 'url' ? 'از طریق لینک' : 'با مشخصات'}`;
    
    let details = '';
    if (orderType === 'url') {
      details = `🔗 لینک کالا از پلتفرم (${platform}):\n${urlInput}\n\n📝 توضیحات تکمیلی: ${notes || 'ندارد'}`;
    } else {
      details = `📋 مشخصات کالای درخواستی:\n📌 نام کالا: ${itemName}\n🏷️ برند کالا: ${brand}\n🌐 ساخت کشور: ${country}\n📝 توضیحات اضافه و ویژگی‌ها:\n${notes || 'ندارد'}`;
    }

    const message = `🛒 سفارش واردات مستقیم سفارشی دانشجویی\n\n${details}\n\n👤 سفارش دهنده: ${user?.first_name || 'دانشجو'}\n📱 شماره / تلگرام: ${contactPhone}\n⏱️ شرایط ارسال: ۴۰ تا ۷۰٪ زیر نرخ بازار با تحویل ۱۰ تا ۲۰ روز کاری`;

    await sendToTelegramAdmin(subject, message);
    setSubmitting(false);
    setOrderSuccess(true);
    triggerHaptic('success');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      
      {/* Top Notice Banner (EXACT REQUIREMENT) */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-fuchsia-950/80 via-purple-950/80 to-indigo-950/80 border-2 border-fuchsia-500/60 shadow-2xl space-y-3">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/40 flex-shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>خرید وسایل دانشجویی (واردات مستقیم بدون واسطه)</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase">
                  VIP DISCOUNT
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-fuchsia-200 font-bold mt-1">
                کالاهای ما وارداتی از چین هستند و <span className="text-white bg-pink-600 px-1.5 py-0.5 rounded-md underline decoration-wavy">۴۰ تا ۷۰ درصد زیر نرخ بازار ایران</span> عرضه می‌شوند و مدت ارسال کالا <span className="text-amber-300 font-black">۱۰ تا ۲۰ روز کاری</span> است.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold bg-black/40 px-3.5 py-2 rounded-xl border border-white/10 self-stretch sm:self-auto justify-center text-slate-200">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>ارسال ایمن و تضمین اصالت</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold max-w-md mx-auto">
        <button
          onClick={() => { triggerHaptic('light'); setActiveTab('catalog'); }}
          className={`flex-1 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'catalog' ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>کالاهای پرکاربرد دانشجویی ({SHOP_PRODUCTS.length})</span>
        </button>
        <button
          onClick={() => { triggerHaptic('light'); setActiveTab('custom-order'); }}
          className={`flex-1 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'custom-order' ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>سفارش با لینک یا مشخصات</span>
        </button>
      </div>

      {/* TAB 1: CURATED CATALOG */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
          {SHOP_PRODUCTS.map(prod => (
            <div
              key={prod.id}
              className="group rounded-3xl glass-card overflow-hidden border border-white/15 hover:border-fuchsia-500/60 shadow-xl transition-all flex flex-col justify-between"
            >
              {/* Product Image Banner */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                <img
                  src={prod.image}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Discount Tag */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-pink-600 text-white font-black text-xs shadow-lg flex items-center gap-1">
                  <span>{prod.discountPercent}٪ تخفیف</span>
                  <span className="text-[10px] font-normal opacity-90">زیر بازار</span>
                </div>

                {/* Delivery Tag */}
                <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-300 font-bold flex items-center gap-1 border border-white/10">
                    <Clock className="w-3.5 h-3.5" />
                    <span>ارسال {prod.deliveryTimeDays}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-mono backdrop-blur-sm">
                    CHINA DIRECT
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block">
                    برند: <strong className="text-slate-200">{prod.brand}</strong>
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-fuchsia-300 transition-colors line-clamp-2">
                    {prod.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                {/* Price & Buy Action */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through block font-medium">
                        قیمت بازار ایران: {formatPrice(prod.marketPriceToman)}
                      </span>
                      <span className="text-base sm:text-lg font-black text-emerald-400">
                        {formatPrice(prod.priceToman)}
                      </span>
                    </div>
                    <span className="text-[10px] text-pink-300 font-bold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                      صرفه جویی میلیونی
                    </span>
                  </div>

                  <button
                    onClick={() => handleOrderCuratedItem(prod)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-900/40 transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>ثبت سفارش و دریافت تخفیف (ارسال به تلگرام)</span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CUSTOM ORDER FORM (AMAZON, ALIBABA, ALIEXPRESS OR DESCRIPTION) */}
      {activeTab === 'custom-order' && (
        <div className="max-w-3xl mx-auto glass-panel p-5 sm:p-8 rounded-3xl border border-fuchsia-500/40 shadow-2xl space-y-6 animate-fadeIn">
          
          <div className="text-center space-y-2 border-b border-white/10 pb-5">
            <h3 className="text-xl font-black text-white">
              ثبت سفارش کالا از سایت‌های خارجی یا با توضیحات
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              هر وسیله‌ای که نیاز دارید از پزشکی، دندانپزشکی، کتاب یا دیجیتال؛ لینک آن را از سایت‌های زیر کپی کنید یا مشخصات آن را بنویسید تا با ۴۰ تا ۷۰٪ ارزان‌تر برایتان وارد کنیم.
            </p>

            {/* Platform Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              {[
                { name: 'Amazon US/CN', url: 'https://www.amazon.com', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                { name: 'Alibaba China', url: 'https://www.alibaba.com', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
                { name: 'AliExpress Global', url: 'https://www.aliexpress.com', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
              ].map((site, i) => (
                <a
                  key={i}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('light')}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-transform hover:scale-105 ${site.color}`}
                >
                  <span>جستجو در {site.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {orderSuccess ? (
            <div className="p-8 rounded-3xl bg-emerald-950/40 border border-emerald-500 text-center space-y-4 animate-fadeIn">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
              <h4 className="text-xl font-black text-white">سفارش سفارشی شما با موفقیت به تلگرام ارسال شد! 🎉</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                درخواست شما جهت محاسبه دقیق قیمت (با ۴۰ تا ۷۰٪ تخفیف واردات) به اکانت تلگرام <strong className="text-fuchsia-300">@{DEVELOPER_TELEGRAM_ID}</strong> فرستاده شد. کارشناسان ما به زودی پیام می‌دهند.
              </p>
              <button
                onClick={() => { triggerHaptic('light'); setOrderSuccess(false); setUrlInput(''); setItemName(''); setNotes(''); }}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                ثبت سفارش جدید
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomOrderSubmit} className="space-y-6">
              
              {/* Toggle Order Type (URL vs Description) */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setOrderType('url'); }}
                  className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    orderType === 'url' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>روش اول: ثبت با لینک کالا</span>
                </button>
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setOrderType('description'); }}
                  className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    orderType === 'description' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>روش دوم: نوشتن توضیحات کالا</span>
                </button>
              </div>

              {/* METHOD 1: URL INPUT */}
              {orderType === 'url' ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-200 block">
                      پلتفرم مرجع کالا:
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm font-bold text-white bg-slate-900 cursor-pointer"
                    >
                      <option value="AliExpress" className="bg-slate-900">علی اکسپرس (AliExpress Global)</option>
                      <option value="Alibaba" className="bg-slate-900">علی بابا چین (Alibaba China Wholesale)</option>
                      <option value="Amazon" className="bg-slate-900">آمازون (Amazon USA / China)</option>
                      <option value="Other" className="bg-slate-900">سایر سایت‌های خارجی یا پزشکی</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-200 block">
                      لینک دقیق صفحه کالا در سایت مورد نظر: *
                    </label>
                    <input
                      type="url"
                      required
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://www.aliexpress.com/item/1000... یا https://www.amazon.com/dp/..."
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm font-mono placeholder:text-slate-500"
                    />
                  </div>
                </div>
              ) : (
                /* METHOD 2: DESCRIPTION INPUT (نام کالا، برند کالا، ساخت کشور، توضیحات اضافه) */
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-200 block">
                        نام دقیق کالا یا وسیله: *
                      </label>
                      <input
                        type="text"
                        required
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="مثال: توربین دندانپزشکی کوکسو یا گوشی پزشکی لیتمن..."
                        className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-200 block">
                        برند کالا (Brand):
                      </label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="مثال: 3M Littmann, COXO, Lenovo, Anker..."
                        className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-200 block">
                      ساخت کشور:
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="مثال: چین، آلمان، ژاپن یا آمریکا (واردات از طریق چین)"
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
                    />
                  </div>
                </div>
              )}

              {/* ADDITIONAL NOTES FOR BOTH METHODS */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-200 block">
                  توضیحات اضافه (رنگ، سایز، مدل دقیق یا ویژگی خاص):
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: رنگ زرشکی، سایز لارج، ترجیحاً مدل ۲۰۲۵ با جعبه اورجینال..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium resize-none"
                />
              </div>

              {/* CONTACT PHONE */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-pink-300 block">
                  شماره موبایل یا آی‌دی تلگرام جهت استعلام و ارسال پیش‌فاکتور: *
                </label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="مثال: 09123456789 یا @StudentUsername"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>

              {/* Notice Reminder */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 text-xs text-slate-300">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>
                  با ثبت این فرم، کارشناسان ما کالا را از تامین‌کننده چین استعلام گرفته و با ۴۰ تا ۷۰٪ زیر قیمت بازار ایران، پیش‌فاکتور را به تلگرام شما ارسال خواهند کرد. مدت ارسال کالا ۱۰ تا ۲۰ روز کاری است.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-fuchsia-900/50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>در حال ارسال سفارش به تلگرام...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5 -rotate-45" />
                    <span>ارسال سفارش استعلام قیمت به تلگرام (@{DEVELOPER_TELEGRAM_ID})</span>
                  </span>
                )}
              </button>

            </form>
          )}

        </div>
      )}

    </div>
  );
};
