import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { ValidationError } from '../../../lib/validation';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async (context) => {
  try {
    const supabase = requireAuth(context);
    const raw = await context.request.json().catch(() => null);
    if (!raw || typeof raw !== 'object' || !Array.isArray((raw as any).items)) {
      throw new ValidationError('Body harus { items: [{id, sort_order}, ...] }');
    }
    const items = (raw as { items: unknown[] }).items;
    if (items.length === 0) {
      return jsonResponse({ success: true, updated: 0 });
    }

    // Validate every item shape before mutating
    for (const it of items) {
      const item = it as Record<string, unknown>;
      if (typeof item.id !== 'string' || !item.id) {
        throw new ValidationError('Setiap item butuh id (string)');
      }
      const n = Number(item.sort_order);
      if (!Number.isFinite(n)) {
        throw new ValidationError('Setiap item butuh sort_order (number)');
      }
    }

    let updated = 0;
    for (const it of items) {
      const item = it as { id: string; sort_order: number };
      const { error } = await supabase
        .from('produk')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);
      if (error) throw error;
      updated++;
    }

    return jsonResponse({ success: true, updated });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof ValidationError) {
      return jsonResponse({ success: false, error: err.message }, 400);
    }
    return jsonResponse({ success: false, error: (err as Error).message }, 500);
  }
};
