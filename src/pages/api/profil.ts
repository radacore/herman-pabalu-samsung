import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/auth';
import { ValidationError, validateProfilPayload } from '../../lib/validation';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const PUT: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const raw = await context.request.json();
    const profil = validateProfilPayload(raw);

    // Upsert by the fixed seed id from schema.sql
    const { data, error } = await supabase
      .from('profil')
      .upsert({ id: '00000000-0000-0000-0000-000000000001', ...profil }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;

    return jsonResponse({ success: true, data });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof ValidationError) {
      return jsonResponse({ success: false, error: err.message }, 400);
    }
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};

export const GET: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);

    const { data, error } = await supabase
      .from('profil')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return jsonResponse({ success: true, data });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};
