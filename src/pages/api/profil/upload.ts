import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { requireAuth } from '../../../lib/auth';
import { ValidationError, validateImageFile } from '../../../lib/validation';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const PROFIL_ID = '00000000-0000-0000-0000-000000000001';
const STORAGE_PATH = 'profil/photo';

export const POST: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return jsonResponse(
        { success: false, error: 'File wajib diisi' },
        400,
      );
    }

    validateImageFile(file);

    const ext = file.name.split('.').pop() || 'jpg';
    const safeExt = ext.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5) || 'jpg';
    const fileName = `${STORAGE_PATH}-${Date.now()}.${safeExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('produk-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('produk-images').getPublicUrl(fileName);

    const { data: updated, error: dbError } = await supabase
      .from('profil')
      .update({ foto_url: publicUrl })
      .eq('id', PROFIL_ID)
      .select()
      .single();

    if (dbError) {
      await supabaseAdmin.storage.from('produk-images').remove([fileName]);
      throw dbError;
    }

    return jsonResponse({ success: true, data: updated, url: publicUrl }, 200);
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof ValidationError) {
      return jsonResponse({ success: false, error: err.message }, 400);
    }
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};
