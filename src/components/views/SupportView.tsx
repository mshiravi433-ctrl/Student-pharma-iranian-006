import React, { useState } from 'react';
import { sendToTelegramAdmin, triggerHaptic, getTelegramUser, DEVELOPER_TELEGRAM_ID, PRODUCER_NAME, queryMultiModelAi } from '../../utils/telegram';
import { 
  HeadphonesIcon, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  MessageSquare
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'admin';
  text: string;
  time: string;
}

export const SupportView: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(1);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `سلام دانشجو عزیز! من دستیار هوشمند «همیار دانشجو» هستم. هر سوالی در مورد اطلاعات دارویی، شرایط کار دانشجویی، ثبت‌نام تحصیل در خارج یا سفارش وسایل وارداتی دارید بپرسید یا دکمه «ارسال به پشتیبانی تلگرام» را بزنید تا مستقیماً به تیم پشتیبانی (تکتم عباسپور و محمد شیروی - @${DEVELOPER_TELEGRAM_ID}) ارسال شود.`,
      time: 'هم‌اکنون'
    }
  ]);
  const [sendingToAdmin, setSendingToAdmin] = useState(false);
  const [adminSentSuccess, setAdminSentSuccess] = useState(false);

  const toggleFaq = (index: number) => {
    triggerHaptic('light');
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    triggerHaptic('medium');
    const userText = chatInput;
    setChatInput('');

    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: 'هم‌اکنون'
    };

    setMessages(prev => [...prev, newMsg]);

    // Try live AI response from Gemini / Cloudflare / Ollama
    const aiRes = await queryMultiModelAi(userText, `You are the friendly Persian AI assistant of Hamyar Daneshjoo mini app created by Mohammad Shiravi (@Shiravi4333). Keep your answers concise, practical, and in fluent Persian.`);
    
    let reply = aiRes.text ? `[پاسخ زنده از ${aiRes.provider.split(' ')[0]}]:\n\n${aiRes.text}` : 'دریافت شد! سوال شما برای بررسی دقیق در سیستم ثبت گردید. برای پاسخ فوری انسانی می‌توانید روی دکمه «ارسال به تلگرام @Shiravi4333» کلیک کنید.';
    
    if (!aiRes.text) {
      if (/دارو|سرماخوردگی|میگرن|دوز|عوارض|تداخل/i.test(userText)) {
        reply = 'در بخش «جستجو دارو و درمان»، هوش مصنوعی ما به صورت دو زبانه تمام اطلاعات ژنریک، دوز، تداخلات، اشکال دارویی و پروتکل‌های درمانی بیماری‌ها را در اختیار شما قرار می‌دهد.';
      } else if (/محاسبه|اندازه‌گیری|bmi|egfr|crcl|cha2ds2|sofa|curb|apache|وزن/i.test(userText)) {
        reply = 'در منوی «ابزارها و اندازه‌گیری»، می‌توانید با وارد کردن قد، وزن، سن، کراتینین و علائم بالینی، شاخص‌های بدنی (BMI/BSA)، کلیرانس کراتینین، eGFR و نمرات اورژانس (CURB-65 و CHA₂DS₂-VASc) را به صورت آنی محاسبه کنید.';
      } else if (/مقاله|isi|scopus|pubmed|پاب‌مد|اسکوپوس|پژوهش|پایان‌نامه/i.test(userText)) {
        reply = 'در منوی «نوشتن و چاپ مقاله»، می‌توانید درخواست مشاوره، نگارش و چاپ مقالات خود در پایگاه‌های Scopus، PubMed و Web of Science *ISI را با انتخاب چندگزینه‌ای ثبت کرده و به تلگرام پشتیبانی ارسال نمایید.';
      } else if (/خارج|انگلیس|هلند|چین|هند|روسیه|کانادا|آلمان|ایتالیا|سوئد|پذیرش|بورسیه/i.test(userText)) {
        reply = 'در بخش «ثبت‌نام تحصیل در خارج»، می‌توانید فرم انتخاب دو رشته (پزشکی، دندانپزشکی و...) و کشور مورد علاقه خود را پر کنید تا پرونده شما جهت مشاوره مستقیم به اکانت @Shiravi4333 ارسال شود.';
      } else if (/خرید|چین|قیمت|تخفیف|ارسال|لیتمن|توربین|تبلت|اسکراب/i.test(userText)) {
        reply = 'کالاهای ما مستقیماً از نمایندگی‌های چین وارد می‌شوند و ۴۰ تا ۷۰ درصد زیر قیمت بازار ایران هستند. مدت ارسال کالا بین ۱۰ تا ۲۰ روز کاری است.';
      } else if (/کار|استخدام|جاب ویژن|پروژه|حقوق/i.test(userText)) {
        reply = 'آگهی‌های بخش «کار دانشجویی» شامل فرصت‌های دورکاری و حضوری متصل به جابینجا، کارنو و ایران استخدام با حقوق پاره‌وقت هستند.';
      }
    }

    setMessages(prev => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        time: 'هم‌اکنون'
      }
    ]);
    triggerHaptic('light');
  };

  const handleSendDirectToAdmin = async () => {
    triggerHaptic('heavy');
    setSendingToAdmin(true);

    const user = getTelegramUser();
    const lastUserMsgs = messages
      .filter(m => m.sender === 'user')
      .map(m => `💬 ${m.text}`)
      .join('\n');

    const subject = `پیام پشتیبانی و مشاوره از مینی‌اپ`;
    const message = `💬 درخواست پشتیبانی آنلاین از مینی‌اپ همیار دانشجو\n\n👤 فرستنده: ${user?.first_name || 'دانشجوی'} ${user?.last_name || ''}\n📱 آی‌دی تلگرام: ${user?.username ? '@' + user.username : 'مشخص نشده'}\n\n📝 خلاصه پیام‌ها / سوالات کاربر:\n${lastUserMsgs || 'کاربر درخواست ارتباط مستقیم با پشتیبانی را دارد.'}`;

    await sendToTelegramAdmin(subject, message);
    setSendingToAdmin(false);
    setAdminSentSuccess(true);
    triggerHaptic('success');

    setTimeout(() => {
      setAdminSentSuccess(false);
    }, 5000);
  };

  const faqs = [
    {
      q: 'مینی‌اپ همیار دانشجو توسط چه کسی ساخته شده و چه هدفی دارد؟',
      a: `این مینی‌اپلیکیشن توسط «تکتم عباسپور و محمد شیروی» (Toktam Abbaspour & Mohammad Shiravi) به عنوان یک دستیار هوشمند و مرجع کامل برای دانشجویان پزشکی، دندانپزشکی، داروسازی و کادر درمان طراحی شده است. از جستجوی دارویی تا کاریابی و خرید وسایل را در یک محیط شیشه‌ای تلگرامی در اختیار شما می‌گذارد.`
    },
    {
      q: 'چرا وسایل دانشجویی فروشگاه ۴۰ تا ۷۰ درصد ارزان‌تر از بازار هستند؟',
      a: `به دلیل حذف کامل واسطه‌ها و دلالان بازار تجهیزات پزشکی و دیجیتال؛ کالاهای ما به صورت مستقیم از تامین‌کنندگان و نمایندگی‌های معتبر چین (یا سفارشات آمازون و علی‌اکسپرس) خریداری و وارد می‌شوند. مدت ارسال کالا ۱۰ تا ۲۰ روز کاری است.`
    },
    {
      q: 'چگونه می‌توانم برای تحصیل در کشورهای اروپایی یا آسیایی ثبت‌نام کنم؟',
      a: `در بخش «ثبت‌نام تحصیل در خارج»، فرم مربوطه را تکمیل کرده و از بین کشورهای انگلیس، هلند، چین، هند، روسیه، کانادا، آلمان، سوئد و ایتالیا انتخاب کنید. با سیستم دو گزینه‌ای، رشته اصلی و جایگزین را مشخص نمایید تا اطلاعات به اکانت تلگرام @Shiravi4333 ارسال شود.`
    },
    {
      q: 'آیا جستجوی دارویی هوش مصنوعی (AI) شامل داروهای گیاهی هم می‌شود؟',
      a: `بله! موتور جستجوی ما به صورت دو زبانه (فارسی و انگلیسی) هم داروهای شیمیایی بالینی و هم داروهای گیاهی و دمنوش‌ها (مانند آویشن، سنبل‌الطیب و...) را پوشش داده و برای بیماری‌ها پروتکل درمانی گام به گام ارائه می‌دهد.`
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-pink-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 flex-shrink-0">
            <HeadphonesIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              پشتیبانی آنلاین و مشاور هوشمند دانشجویی
            </h2>
            <p className="text-xs text-slate-300">
              ارتباط مستقیم با توسعه‌دهندگان و تهیه کنندگان مینی‌اپ ({PRODUCER_NAME} - @{DEVELOPER_TELEGRAM_ID})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-purple-300 font-bold self-stretch sm:self-auto justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>پشتیبانی فعال تلگرام</span>
        </div>
      </div>

      {/* Grid: AI Chat Assistant & Producer Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / CHAT ASSISTANT (7 Columns on LG) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/15 p-4 sm:p-5 flex flex-col justify-between h-[520px] shadow-2xl">
          
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">چت‌بات هوشمند و مشاور همیار</h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  آماده پاسخگویی به سوالات شما
                </span>
              </div>
            </div>

            <button
              onClick={handleSendDirectToAdmin}
              disabled={sendingToAdmin}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {sendingToAdmin ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>ارسال...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 -rotate-45" />
                  <span>ارسال پیام‌ها به @{DEVELOPER_TELEGRAM_ID}</span>
                </span>
              )}
            </button>
          </div>

          {/* Messages Box */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 no-scrollbar text-xs">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px] ${
                  msg.sender === 'user' 
                    ? 'bg-purple-600' 
                    : 'bg-gradient-to-tr from-pink-500 to-purple-500'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-purple-600/30 border border-purple-500/40 text-white rounded-tl-none'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tr-none'
                }`}>
                  <p>{msg.text}</p>
                  <span className="text-[9px] text-slate-400 block mt-1.5 text-left">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Success Toast */}
          {adminSentSuccess && (
            <div className="p-2.5 mb-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-center text-xs font-bold animate-fadeIn flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>پیام شما مستقیماً به تلگرام پشتیبانی (تکتم عباسپور و محمد شیروی) ارسال شد!</span>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="pt-2 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="سوال خود را بنویسید (مثلاً: شرایط خرید اقساطی یا پذیرش آلمان)..."
              className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs font-medium placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md transition-all active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4 -rotate-45" />
            </button>
          </form>

        </div>

        {/* RIGHT / PRODUCER & ABOUT INFO (5 Columns on LG) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Producer Attribution Card */}
          <div className="glass-panel p-5 rounded-3xl border-2 border-purple-500/40 space-y-4 text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 p-0.5 mx-auto shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-black text-xl">
                مش
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 block">تهیه کنندگان و ایده‌پردازان پروژه:</span>
              <h3 className="text-lg font-black bg-gradient-to-r from-purple-300 via-pink-300 to-white bg-clip-text text-transparent">
                {PRODUCER_NAME}
              </h3>
              <p className="text-xs text-purple-300 font-mono font-bold">
                @{DEVELOPER_TELEGRAM_ID}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              طراحی و توسعه اختصاصی مینی‌اپلیکیشن تلگرامی «همیار دانشجو» به منظور ارتقای کیفیت تحصیل، کاریابی، واردات بدون واسطه تجهیزات و اعزام دانشجویان کادر درمان.
            </p>

            <div className="pt-2 space-y-2">
              <a
                href={`https://t.me/${DEVELOPER_TELEGRAM_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic('medium')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>ارتباط مستقیم در تلگرام (@{DEVELOPER_TELEGRAM_ID})</span>
              </a>

              <a
                href="https://reymit.ir/shiravi"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic('medium')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <span>با اسم حمایت کنید (حمایت مالی از پروژه) ❤️</span>
              </a>
            </div>
          </div>

          {/* Quick FAQ Box */}
          <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-2">
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5 pb-2 border-b border-white/10">
              <HelpCircle className="w-4 h-4 text-pink-400" />
              <span>سوالات متداول (FAQ)</span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-3 text-left rtl:text-right flex items-center justify-between gap-2 text-xs font-bold text-slate-200 hover:text-white"
                    >
                      <span className="line-clamp-1">{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-pink-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5 bg-black/20 font-medium">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
