/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user?: {
      id: string;
      email?: string;
      [key: string]: any;
    };
    supabase?: import('@supabase/supabase-js').SupabaseClient;
  }
}
