import { validSession } from '../../_lib/auth.js';

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (url.pathname === '/info/admin/login.html') return next();
  if (await validSession(request, env.ADMIN_SESSION_SECRET)) return next();
  const login = new URL('/info/admin/login.html', url.origin);
  login.searchParams.set('next', url.pathname + url.search);
  return Response.redirect(login, 302);
}
