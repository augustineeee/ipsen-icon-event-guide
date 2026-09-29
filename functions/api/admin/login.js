import { createSession, credentialsMatch, sessionCookie } from '../../_lib/auth.js';

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
});

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return json({ error: '管理员登录尚未完成配置' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: '请求格式不正确' }, 400); }
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  if (!credentialsMatch(username, password, env)) return json({ error: '账号或密码不正确' }, 401);
  const token = await createSession(env.ADMIN_SESSION_SECRET);
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(token) });
}
