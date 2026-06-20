import type { APIContext } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';

export const AUTH_COOKIE = 'sb-access-token';
export const AUTH_MAX_AGE = 60 * 60;

export function setAuthCookie(context: APIContext, accessToken: string) {
  context.cookies.set(AUTH_COOKIE, accessToken, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: AUTH_MAX_AGE,
  });
}

export function clearAuthCookie(context: APIContext) {
  context.cookies.delete(AUTH_COOKIE, { path: '/' });
}

export function requireAuth(context: APIContext): SupabaseClient {
  const user = context.locals.user;
  const supabase = context.locals.supabase;
  if (!user || !supabase) {
    throw new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return supabase;
}
