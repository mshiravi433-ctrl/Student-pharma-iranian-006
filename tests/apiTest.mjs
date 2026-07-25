// =============================================================================
//  Offline test harness for the serverless endpoints (api/ai.ts, api/drug.ts).
//  The sandbox has no outbound internet, so global.fetch is replaced with a
//  scriptable mock that:
//    * asserts each provider is called with the correct URL / auth header / body
//    * simulates failures so the fail-over chain can be verified end-to-end
//  Run:  node tests/run.mjs
// =============================================================================
import assert from 'node:assert';
import { Readable } from 'node:stream';

export const calls = [];
let router = () => ({ status: 500, body: {} });

export function setRouter(fn) { calls.length = 0; router = fn; }

export function installFetch() {
  global.fetch = async (url, opts = {}) => {
    const u = String(url);
    let body = {};
    try { body = opts.body ? JSON.parse(opts.body) : {}; } catch { body = {}; }
    const rec = { url: u, method: opts.method || 'GET', headers: opts.headers || {}, body };
    calls.push(rec);
    const out = await router(rec);
    if (out === 'throw') throw new Error('network error');
    if (out === 'timeout') { const e = new Error('timeout'); e.name = 'TimeoutError'; throw e; }
    return {
      ok: (out.status ?? 200) >= 200 && (out.status ?? 200) < 300,
      status: out.status ?? 200,
      json: async () => out.body ?? {},
    };
  };
}

export function mockReq(method, body) {
  const r = new Readable({ read() {} });
  r.push(body === undefined ? null : JSON.stringify(body));
  r.push(null);
  r.method = method;
  return r;
}

export function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    end(payload) { this.payload = payload; this._done(); },
  };
  res.done = new Promise((resolve) => { res._done = resolve; });
  return res;
}

export async function invoke(handler, method, body) {
  const res = mockRes();
  await handler(mockReq(method, body), res);
  await res.done;
  return { status: res.statusCode, json: JSON.parse(res.payload) };
}

export const ok = (name) => console.log(`  \u001b[32m✓\u001b[0m ${name}`);
export const section = (name) => console.log(`\n\u001b[1m${name}\u001b[0m`);
export { assert };
