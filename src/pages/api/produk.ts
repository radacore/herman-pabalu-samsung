import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase-admin';
import { ValidationError, validateProdukPayload } from '../../lib/validation';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const raw = await request.json();
    const produk = validateProdukPayload(raw);

    const { data, error } = await supabaseAdmin
      .from('produk')
      .insert(produk)
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

export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('produk')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return jsonResponse({ success: true, data });
  } catch (err) {
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ success: false, error: 'ID produk tidak ditemukan' }, 400);
    }

    const raw = await request.json();
    const produk = validateProdukPayload(raw);

    const { data, error } = await supabaseAdmin
      .from('produk')
      .update(produk)
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
      return jsonResponse({ success: false, error: 'ID produk tidak ditemukan' }, 400);
    }

    const { error } = await supabaseAdmin
      .from('produk')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return jsonResponse({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};
