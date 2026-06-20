-- Migration: align profil columns with TypeScript types
-- - Rename `foto` -> `foto_url` (DB was out of sync with Hero.astro + types.ts)
-- - Add missing columns used by the profil form: tagline, deskripsi, jam_operasional

ALTER TABLE profil RENAME COLUMN foto TO foto_url;

ALTER TABLE profil ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE profil ADD COLUMN IF NOT EXISTS deskripsi TEXT;
ALTER TABLE profil ADD COLUMN IF NOT EXISTS jam_operasional TEXT;
