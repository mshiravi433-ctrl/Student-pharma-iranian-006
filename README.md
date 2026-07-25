# Student-pharma-iranian-006 — همیار دانشجو (مینی‌اپ تلگرام)

دستیار هوشمند دارویی، آموزشی و مهاجرت پزشکی برای دانشجویان ایرانی.

## ساختار جدید: بک‌اند سرورلس (Vercel Functions)

برای رفع مشکلات جستجو، هوش مصنوعی و ارسال پیام به تلگرام، تمام فراخوانی‌های خارجی
( Gemini / Cloudflare / Ollama / OpenFDA / Telegram Bot API ) از سمت سرور انجام می‌شوند
(پوشه `api/`). این کار باعث می‌شود:
- محدودیت CORS مرورگر دیگر باعث شکست درخواست‌ها نشود.
- کلیدهای API در سمت سرور بمانند و لو نروند.
- پیام‌های سفارش/پشتیبانی واقعاً به تلگرام مالک ارسال شوند.

### اندپوینت‌ها
- `POST /api/ai` — ارتباط سه هوش مصنوعی: **Gemini (AI Studio + Vertex AI) → Cloudflare Workers AI → Ollama**
- `POST /api/drug` — دریافت اطلاعات دارو از **OpenFDA + NLM RxNorm**
- `POST /api/notify` — ارسال واقعی پیام به تلگرام مالک (Bot API)
- `GET  /api/feed` — فید روزانه ویدیو/نکته/تبلیغ (هر ۲۴ ساعت تازه‌سازی و حذف موارد قدیمی)
- `GET  /api/telegram-init` — کشف آیدی عددی تلگرام شما (برای ارسال مستقیم)

## متغیرهای محیطی (Environment Variables) در Vercel

کلیدها به‌صورت پیش‌فرض (fallback) در کد هستند، اما برای امنیت بیشتر توصیه می‌شود در
بخش **Settings → Environment Variables** پروژه Vercel ست کنید:

| نام متغیر | مقدار | کاربرد |
|-----------|-------|--------|
| `GEMINI_API_KEY` | کلید Gemini (AI Studio یا Vertex AI) | هوش مصنوعی |
| `GEMINI_PROJECT_ID` | شماره پروژه (مثل ۱۳۵۷۵۷۲۲۵۰۲۹) | Vertex AI |
| `GEMINI_LOCATION` | مثلاً `us-central1` | Vertex AI |
| `CLOUDFLARE_ACCOUNT_ID` | شناسه اکانت Cloudflare | Cloudflare Workers AI |
| `CLOUDFLARE_API_TOKEN` | توکن Cloudflare | Cloudflare Workers AI |
| `OLLAMA_BASE_URL` | آدرس Ollama (پیش‌فرض https://ollama.com) | Ollama |
| `OLLAMA_LLM_KEY` | توکن Ollama | Ollama |
| `OPEN_FDA_API_KEY` | کلید OpenFDA | جستجوی دارو |
| `TELEGRAM_BOT_TOKEN` | توکن ربات تلگرام | ارسال پیام |
| `TELEGRAM_ADMIN_CHAT_ID` | **آیدی عددی** تلگرام شما (مثل ۵۱۲۳۴۵۶۷۸۹) | ارسال مستقیم به چت شخصی |

## نحوه دریافت آیدی عددی تلگرام (برای ارسال قطعی سفارش‌ها)

۱. ربات را استارت کنید: در تلگرام پیام `/start` به ربات بدهید.
۲. آدرس `/api/telegram-init` را در مرورگر باز کنید (مثلاً `https://domain.vercel.app/api/telegram-init`).
۳. عدد `id` نمایش‌داده‌شده را در متغیر محیطی `TELEGRAM_ADMIN_CHAT_ID` قرار دهید.
اگر این مقدار ست نشود، سیستم تلاش می‌کند به `@shiravi433` ارسال کند (فقط زمانی کار می‌کند
که آن یک کانال/گروه باشد که ربات در آن ادمین است).

## اجرای محلی (بدون بک‌اند)
در حالت `npm run dev` اندپوینت‌های `/api` در دسترس نیستند؛ برنامه با حالت fallback (سنتز
داخلی) کار می‌کند و نمی‌شکند. برای تست کامل بک‌اند، پروژه را روی Vercel مستقر کنید.

## ساخت
```
npm install
npm run build   # خروجی در dist/
```
