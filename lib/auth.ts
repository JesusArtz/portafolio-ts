import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const TTL = 60 * 60 * 24; // 1 day

function base64(buf: Buffer | string) {
  return Buffer.from(buf).toString("base64url");
}

function hmac(data: string) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

export function createToken(payload: Record<string, any>) {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const obj = { ...payload, exp };
  const encoded = base64(JSON.stringify(obj));
  const sig = hmac(encoded);
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string | undefined) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = hmac(encoded);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const json = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (!json.exp || Date.now() / 1000 > json.exp) return null;
    return json;
  } catch (e) {
    return null;
  }
}

export function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return {} as Record<string,string>;
  return Object.fromEntries(cookieHeader.split(';').map(p => p.split('=')).map(([k,v]) => [k.trim(), (v||'').trim()]));
}
