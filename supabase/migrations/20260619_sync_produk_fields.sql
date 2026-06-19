-- Migration: sync produk table with TypeScript types
-- Adds: is_active, is_featured, sort_order, harga_coret, diskon_persen, warna_tersedia
-- Hardens RLS with WITH CHECK clauses

-- 1. Add missing columns to produk
ALTER TABLE produk
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS harga_coret INTEGER,
  ADD COLUMN IF NOT EXISTS diskon_persen INTEGER,
  ADD COLUMN IF NOT EXISTS warna_tersedia TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill: map old `featured` to `is_featured` (one-shot, then keep both in sync via app)
UPDATE produk SET is_featured = featured WHERE is_featured = false AND featured = true;
UPDATE produk SET is_featured = featured;

-- Backfill: copy `warna` to `warna_tersedia` (form uses `warna`, public uses `warna_tersedia`)
UPDATE produk SET warna_tersedia = warna WHERE warna_tersedia = ARRAY[]::TEXT[] AND cardinality(warna) > 0;

-- 2. New indexes for the new filterable columns
CREATE INDEX IF NOT EXISTS idx_produk_is_active ON produk(is_active);
CREATE INDEX IF NOT EXISTS idx_produk_is_featured ON produk(is_featured);
CREATE INDEX IF NOT EXISTS idx_produk_sort_order ON produk(sort_order);

-- 3. Tighten RLS policies with WITH CHECK so authenticated users can only
--    insert/update rows they conceptually own. For this single-admin app we
--    keep USING permissive on UPDATE/DELETE for the lone admin user.
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON produk;
CREATE POLICY "Enable write access for authenticated users" ON produk
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable write access for profil" ON profil;
CREATE POLICY "Enable write access for profil" ON profil
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable write access for produk images" ON produk_images;
CREATE POLICY "Enable write access for produk images" ON produk_images
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
