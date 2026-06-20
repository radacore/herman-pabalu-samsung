import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/auth';
import { ValidationError, validateProdukPayload } from '../../lib/validation';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const raw = await context.request.json();
    const produk = validateProdukPayload(raw);

    const { data, error } = await supabase
      .from('produk')
      .insert(produk)
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

export const GET: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const url = new URL(context.request.url);

    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || 20)));
    const q = (url.searchParams.get('q') || '').trim();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('produk')
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (q) {
      query = query.ilike('nama', `%${q}%`);
    }

    const { data, error, count } = await query.range(from, to);

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

export const PUT: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ success: false, error: 'ID produk tidak ditemukan' }, 400);
    }

    const raw = await context.request.json();
    const produk = validateProdukPayload(raw);

    const { data, error } = await supabase
      .from('produk')
      .update(produk)
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
      return jsonResponse({ success: false, error: 'ID produk tidak ditemukan' }, 400);
    }

    const { error } = await supabase
      .from('produk')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return jsonResponse({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};
