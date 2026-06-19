import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase-admin';
import { ValidationError, validateImageFile } from '../../lib/validation';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const produkId = formData.get('produk_id');
    const file = formData.get('file') as File | null;

    if (!produkId || !file) {
      return jsonResponse(
        { success: false, error: 'Produk ID dan file wajib diisi' },
        400,
      );
    }

    validateImageFile(file);

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

    const { data: imageRecord, error: dbError } = await supabaseAdmin
      .from('produk_images')
      .insert({
        produk_id: produkId,
        url: publicUrl,
        is_primary: false,
      })
      .select()
      .single();

    if (dbError) {
      // Roll back the uploaded file if the DB insert fails
      await supabaseAdmin.storage.from('produk-images').remove([fileName]);
      throw dbError;
    }

    return jsonResponse({ success: true, data: imageRecord }, 201);
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
    const fileUrl = url.searchParams.get('url');

    if (!fileUrl) {
      return jsonResponse(
        { success: false, error: 'URL file tidak ditemukan' },
        400,
      );
    }

    await supabaseAdmin
      .from('produk_images')
      .delete()
      .eq('url', fileUrl);

    const fileName = fileUrl.split('/produk-images/')[1];
    if (fileName) {
      await supabaseAdmin.storage.from('produk-images').remove([fileName]);
    }

    return jsonResponse({ success: true, message: 'File berhasil dihapus' });
  } catch (err) {
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};
