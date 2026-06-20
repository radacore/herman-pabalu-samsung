import type { APIRoute } from 'astro';
import { clearAuthCookie } from '../../../lib/auth';

export const POST: APIRoute = async (context) => {
  clearAuthCookie(context);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
