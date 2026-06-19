import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase-admin';
import { ValidationError, validateTestimoniPayload } from '../../lib/validation';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('testimoni')
      .select('*')
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return jsonResponse({ success: true, data });
  } catch (err) {
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const raw = await request.json();
    const testimoni = validateTestimoniPayload(raw);

    const { data, error } = await supabaseAdmin
      .from('testimoni')
      .insert(testimoni)
      .select()
      .single();

    if (error) throw error;

    return jsonResponse({ success: true, data }, 201);
  } catch (err) {
    if (err instanceof ValidationError) {
      return jsonResponse({ success: false, error: err.message }, 400);
    }
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ success: false, error: 'ID testimoni tidak ditemukan' }, 400);
    }

    const raw = await request.json();
    const testimoni = validateTestimoniPayload(raw);

    const { data, error } = await supabaseAdmin
      .from('testimoni')
      .update(testimoni)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return jsonResponse({ success: true, data });
  } catch (err) {
    if (err instanceof ValidationError) {
      return jsonResponse({ success: false, error: err.message }, 400);
    }
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ success: false, error: 'ID testimoni tidak ditemukan' }, 400);
    }

    const { error } = await supabaseAdmin
      .from('testimoni')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return jsonResponse({ success: true, message: 'Testimoni berhasil dihapus' });
  } catch (err) {
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};
