import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';
import { AUTH_COOKIE } from './lib/auth';

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/admin/login/']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;

  // Only gate /admin/* (except the login page itself)
  if (!url.pathname.startsWith('/admin')) {
    return next();
  }
  if (PUBLIC_ADMIN_PATHS.has(url.pathname)) {
    return next();
  }

  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars for auth middleware');
    return redirect('/admin/login');
  }

  // Read access token from HttpOnly cookie set by /api/auth/login.
  const accessToken = cookies.get(AUTH_COOKIE)?.value;

  if (!accessToken) {
    return redirect('/admin/login');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect('/admin/login');
  }

  locals.user = { id: user.id, email: user.email };
  locals.supabase = supabase;

  return next();
});
