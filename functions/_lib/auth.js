const enc = new TextEncoder();

const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

async function signature(value, secret) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(value))));
}

const safeEqual = (a, b) => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
};

export async function createSession(secret) {
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${expires}.${await signature(expires, secret)}`;
}

export async function validSession(request, secret) {
  if (!secret) return false;
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)mci_admin_session=([^;]+)/);
  if (!match) return false;
  const [expires, supplied] = decodeURIComponent(match[1]).split('.');
  if (!expires || !supplied || Number(expires) < Date.now()) return false;
  return safeEqual(supplied, await signature(expires, secret));
}

export function sessionCookie(value) {
  return `mci_admin_session=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}

export const clearSessionCookie = () => 'mci_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';

export function credentialsMatch(username, password, env) {
  return Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD && safeEqual(username, env.ADMIN_USERNAME) && safeEqual(password, env.ADMIN_PASSWORD));
}
