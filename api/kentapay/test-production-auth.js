// One-off diagnostic — confirms production Kentapay credentials + base URL actually work
// BEFORE switching the live checkout/withdraw flow over to them. Deliberately reads its own
// KENTAPAY_PROD_* env vars, completely separate from the KENTAPAY_BASE_URL/CLIENT_ID/USERNAME/
// PASSWORD the real payment flow uses (api/kentapay/_lib/kentapay.js) — setting these has zero
// effect on real traffic. Only ever calls the access-token endpoint: no checkout, no B2C, no
// money moves no matter what this returns. Delete this file once production is confirmed
// working and the real env vars have been switched over.
const STATUS_DESCRIPTIONS = {
  '00': 'Success',
  '40': 'Failed to authenticate client — check KENTAPAY_PROD_CLIENT_ID/USERNAME/PASSWORD',
  '41': 'Failed to authenticate client — check KENTAPAY_PROD_CLIENT_ID/USERNAME/PASSWORD',
  '45': 'Client not authorized for this service',
  '48': 'Client not registered in the system',
  '96': 'Cannot connect to database server',
  '99': 'Internal system failure',
};

export default async function handler(req, res) {
  const expectedSecret = process.env.KENTAPAY_CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  const bearerSecret = authHeader.replace(/^Bearer\s+/i, '');
  const providedSecret = req.headers['x-cron-secret'] || req.query?.secret || bearerSecret;
  if (!expectedSecret || providedSecret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Falls back to the real, live KENTAPAY_* vars if the isolated KENTAPAY_PROD_* ones aren't
  // set — added after finding out those live vars had already been overwritten with
  // production values directly, which meant this diagnostic could no longer see what was
  // actually about to affect real traffic. This still only ever calls the safe token endpoint.
  const baseUrl = process.env.KENTAPAY_PROD_BASE_URL || process.env.KENTAPAY_BASE_URL;
  const clientId = process.env.KENTAPAY_PROD_CLIENT_ID || process.env.KENTAPAY_CLIENT_ID;
  const username = process.env.KENTAPAY_PROD_USERNAME || process.env.KENTAPAY_USERNAME;
  const password = process.env.KENTAPAY_PROD_PASSWORD || process.env.KENTAPAY_PASSWORD;
  const usedLiveVars = !process.env.KENTAPAY_PROD_BASE_URL;

  const missing = [];
  if (!baseUrl) missing.push('KENTAPAY_PROD_BASE_URL/KENTAPAY_BASE_URL');
  if (!clientId) missing.push('KENTAPAY_PROD_CLIENT_ID/KENTAPAY_CLIENT_ID');
  if (!username) missing.push('KENTAPAY_PROD_USERNAME/KENTAPAY_USERNAME');
  if (!password) missing.push('KENTAPAY_PROD_PASSWORD/KENTAPAY_PASSWORD');
  if (missing.length > 0) {
    res.status(400).json({ error: `Missing env vars: ${missing.join(', ')}` });
    return;
  }

  const basic = Buffer.from(`${username}:${password}`).toString('base64');
  const url = `${baseUrl.replace(/\/$/, '')}/ServiceLayer/v2/request/access-token?grant_type=client_credentials`;

  const started = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${basic}` },
      body: JSON.stringify({ clientid: clientId }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const elapsedMs = Date.now() - started;
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = null; }

    if (!data) {
      res.status(200).json({ ok: false, elapsedMs, httpStatus: response.status, note: 'Non-JSON response', raw: text.slice(0, 300) });
      return;
    }

    const success = String(data.status) === '00' && !!data.access_token;
    res.status(200).json({
      ok: success,
      usedLiveVars,
      elapsedMs,
      httpStatus: response.status,
      kentapayStatus: data.status,
      description: STATUS_DESCRIPTIONS[String(data.status)] || null,
      accessTokenPresent: !!data.access_token,
      hmacKeyPresent: !!data.key,
    });
  } catch (err) {
    const elapsedMs = Date.now() - started;
    res.status(200).json({
      ok: false,
      usedLiveVars,
      elapsedMs,
      error: err instanceof Error ? err.message : String(err),
      note: err instanceof Error && err.name === 'AbortError'
        ? 'Timed out — likely IP whitelisting blocking Vercel, or the host/port is wrong'
        : 'Connection failed — likely wrong host, or IP whitelisting blocking Vercel',
    });
  }
}
