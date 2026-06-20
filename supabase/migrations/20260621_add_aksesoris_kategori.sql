-- Migration: allow `aksesoris` as a valid produk kategori
-- The CHECK constraint from schema.sql only allowed 4 values but the form
-- (ProdukForm.astro) and validator (validation.ts) accepted 5, so any
-- produk save with kategori=aksesoris failed at the DB level with 500.

ALTER TABLE produk DROP CONSTRAINT IF EXISTS produk_kategori_check;
ALTER TABLE produk ADD CONSTRAINT produk_kategori_check
  CHECK (kategori IN ('flagship', 'mid-range', 'budget', 'foldable', 'aksesoris'));
