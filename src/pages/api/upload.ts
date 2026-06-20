import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase-admin';
import { requireAuth } from '../../lib/auth';
import { ValidationError, validateImageFile } from '../../lib/validation';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);

    const formData = await context.request.formData();
    const produkId = formData.get('produk_id');
    const file = formData.get('file') as File | null;

    if (!produkId || !file) {
      return jsonResponse(
        { success: false, error: 'Produk ID dan file wajib diisi' },
        400,
      );
    }

    validateImageFile(file);

    const { data: produkRow, error: produkError } = await supabase
      .from('produk')
      .select('id')
      .eq('id', String(produkId))
      .single();

    if (produkError || !produkRow) {
      return jsonResponse(
        { success: false, error: 'Produk tidak ditemukan atau tidak ada akses' },
        404,
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${produkId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('produk-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('produk-images').getPublicUrl(fileName);

    const { data: imageRecord, error: dbError } = await supabase
      .from('produk_images')
      .insert({
        produk_id: produkId,
        url: publicUrl,
        is_primary: false,
      })
      .select()
      .single();

    if (dbError) {
      await supabaseAdmin.storage.from('produk-images').remove([fileName]);
      throw dbError;
    }

    return jsonResponse({ success: true, data: imageRecord }, 201);
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof ValidationError) {
      return jsonResponse({ success: false, error: err.message }, 400);
    }
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};

export const PATCH: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse(
        { success: false, error: 'ID foto tidak ditemukan' },
        400,
      );
    }

    const raw = await context.request.json().catch(() => null);
    if (!raw || typeof raw !== 'object') {
      return jsonResponse({ success: false, error: 'Body harus JSON' }, 400);
    }
    const body = raw as Record<string, unknown>;
    if (typeof body.is_primary !== 'boolean') {
      return jsonResponse(
        { success: false, error: 'is_primary harus boolean' },
        400,
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from('produk_images')
      .select('id, produk_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return jsonResponse(
        { success: false, error: 'Foto tidak ditemukan' },
        404,
      );
    }

    if (body.is_primary) {
      // Unset primary on all other photos in the same product
      const { error: unsetError } = await supabase
        .from('produk_images')
        .update({ is_primary: false })
        .eq('produk_id', existing.produk_id)
        .neq('id', id);

      if (unsetError) throw unsetError;
    }

    const { data: updated, error: updateError } = await supabase
      .from('produk_images')
      .update({ is_primary: body.is_primary })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return jsonResponse({ success: true, data: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const url = new URL(context.request.url);
    const fileUrl = url.searchParams.get('url');

    if (!fileUrl) {
      return jsonResponse(
        { success: false, error: 'URL file tidak ditemukan' },
        400,
      );
    }

    const { error: dbError } = await supabase
      .from('produk_images')
      .delete()
      .eq('url', fileUrl);

    if (dbError) {
      return jsonResponse({ success: false, error: dbError.message }, 500);
    }

    const fileName = fileUrl.split('/produk-images/')[1];
    if (fileName) {
      await supabaseAdmin.storage.from('produk-images').remove([fileName]);
    }

    return jsonResponse({ success: true, message: 'File berhasil dihapus' });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};
