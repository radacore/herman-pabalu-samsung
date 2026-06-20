import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/auth';
import { ValidationError, validateTestimoniPayload } from '../../lib/validation';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const url = new URL(context.request.url);

    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || 20)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('testimoni')
      .select('*', { count: 'exact' })
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const total = count || 0;
    return jsonResponse({
      success: true,
      data: data || [],
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};

export const POST: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const raw = await context.request.json();
    const testimoni = validateTestimoniPayload(raw);

    const { data, error } = await supabase
      .from('testimoni')
      .insert(testimoni)
      .select()
      .single();

    if (error) throw error;

    return jsonResponse({ success: true, data }, 201);
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof ValidationError) {
      return jsonResponse({ success: false, error: err.message }, 400);
    }
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ success: false, error: 'ID testimoni tidak ditemukan' }, 400);
    }

    const raw = await context.request.json();
    const testimoni = validateTestimoniPayload(raw);

    const { data, error } = await supabase
      .from('testimoni')
      .update(testimoni)
      .eq('id', id)
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

export const DELETE: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ success: false, error: 'ID testimoni tidak ditemukan' }, 400);
    }

    const { error } = await supabase
      .from('testimoni')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return jsonResponse({ success: true, message: 'Testimoni berhasil dihapus' });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};
