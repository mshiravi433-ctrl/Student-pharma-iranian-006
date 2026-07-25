// =============================================================================
//  /api/notify  —  Telegram Delivery (Vercel Serverless Function)
//  Actually SENDS order / support / service messages to the owner's Telegram
//  via the Bot API. The browser cannot call api.telegram.org (no CORS), so this
//  MUST run server-side.
//
//  Delivery target:
//    - If TELEGRAM_ADMIN_CHAT_ID (numeric) is set, it is tried first.
//    - Otherwise / always, the message is also sent to @shiravi433 (works when
//      that is a channel or group where the bot is an admin).
// =============================================================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8783007968:AAEX6jKE96SXKVhs7maFSYKKOUVD8KXyCQs';
const ADMIN_CHAT_ID = (process.env.TELEGRAM_ADMIN_CHAT_ID || 'shiravi433').toString().trim();
const DEVELOPER_USERNAME = 'shiravi433';

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

const json = (res: any, code: number, obj: any) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
};

async function sendTo(chatId: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: false }),
    signal: AbortSignal.timeout(9000),
  });
  const d: any = await r.json().catch(() => ({}));
  return { ok: !!d?.ok, error: d?.description };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { json(res, 405, { error: 'Method Not Allowed' }); return; }

  const body = await readJson(req);
  const subject = String(body.subject || 'درخواست جدید').trim();
  const message = String(body.message || '').trim();
  const type = String(body.type || 'درخواست').trim();
  const user = body.user ? body.user : null;

  if (!message) { json(res, 400, { error: 'message is required' }); return; }

  const userLine = user
    ? `\n\n👤 کاربر: ${user.first_name || ''} ${user.last_name || ''} (@${user.username || '-'}, id: ${user.id || '-'})`
    : '';

  const text =
    `🌟 【 همیار دانشجو | ${type} 】 🌟\n\n` +
    `📌 موضوع: ${subject}\n\n` +
    `${message}` +
    `${userLine}\n\n` +
    `🤖 ارسال شده از مینی‌اپ هوشمند همیار دانشجو\n` +
    `👤 تهیه‌کنندگان: تکتم عباسپور و محمد شیروی`;

  // Build the ordered target list: numeric id first, then the @username.
  const targets: string[] = [];
  if (/^\d+$/.test(ADMIN_CHAT_ID)) targets.push(ADMIN_CHAT_ID);
  if (!targets.includes(DEVELOPER_USERNAME)) targets.push(DEVELOPER_USERNAME);

  let lastError = '';
  for (const chatId of targets) {
    try {
      const result = await sendTo(chatId, text);
      if (result.ok) { json(res, 200, { ok: true, chatId }); return; }
      lastError = result.error || 'unknown';
    } catch (e: any) {
      lastError = e?.message || 'network error';
    }
  }

  json(res, 200, { ok: false, error: lastError });
}
