import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { setAuthCookie } from '../../../lib/auth';

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export const POST: APIRoute = async (context) => {
  const { request } = context;

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Body harus JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return new Response(
      JSON.stringify({ success: false, error: 'Email dan password wajib diisi' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return new Response(
      JSON.stringify({ success: false, error: 'Email atau password salah' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  setAuthCookie(context, data.session.access_token);

  return new Response(
    JSON.stringify({
      success: true,
      user: { id: data.user.id, email: data.user.email },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
