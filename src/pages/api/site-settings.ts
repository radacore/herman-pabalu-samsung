import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/auth';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    return jsonResponse({ success: true, data });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const body = await context.request.json();

    const allowed = [
      'hero_eyebrow',
      'hero_headline',
      'hero_subtitle',
      'hero_status_label',
      'hero_proof_1',
      'hero_proof_2',
      'hero_proof_3',
      'hero_floating_title',
      'hero_floating_caption',
      'hero_stat_title',
      'hero_stat_caption',
      'cta_primary_label',
      'cta_secondary_label',
    ];

    const payload: Record<string, unknown> = { id: 1 };
    for (const key of allowed) {
      if (key in body) payload[key] = body[key];
    }
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;

    return jsonResponse({ success: true, data });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};
