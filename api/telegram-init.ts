// =============================================================================
//  /api/telegram-init  —  Helper to discover your numeric Telegram chat id.
//  Open this endpoint once in a browser AFTER you have sent "/start" (or any
//  message) to your bot. It returns the most recent chat ids so you can copy
//  your numeric id into the TELEGRAM_ADMIN_CHAT_ID environment variable for
//  reliable direct-message delivery.
// =============================================================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8783007968:AAEX6jKE96SXKVhs7maFSYKKOUVD8KXyCQs';

export default async function handler(req: any, res: any) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=5&timeout=0`, {
      signal: AbortSignal.timeout(8000),
    });
    const d: any = await r.json();
    const chats = (d?.result || []).map((u: any) => u?.message?.chat).filter(Boolean);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: !!d?.ok, hint: 'Send /start to your bot first, then copy the numeric "id" below into TELEGRAM_ADMIN_CHAT_ID.', chats }));
  } catch (e: any) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: e?.message || 'network error' }));
  }
}
