-- Migration: create testimoni table
-- Public read (only active), authenticated write

CREATE TABLE IF NOT EXISTS testimoni (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  komentar TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimoni_is_active ON testimoni(is_active);
CREATE INDEX IF NOT EXISTS idx_testimoni_tanggal ON testimoni(tanggal DESC);

-- RLS
ALTER TABLE testimoni ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for testimoni" ON testimoni;
CREATE POLICY "Enable read access for testimoni" ON testimoni
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable write access for testimoni" ON testimoni;
CREATE POLICY "Enable write access for testimoni" ON testimoni
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_testimoni_updated_at ON testimoni;
CREATE TRIGGER trg_testimoni_updated_at
  BEFORE UPDATE ON testimoni
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed sample data (matches the previously hardcoded ones)
INSERT INTO testimoni (nama, rating, komentar, tanggal) VALUES
  ('Budi Santoso', 5, 'Pelayanan sangat baik, produk original, dan harga bersaing. Recommended!', '2024-12-15'),
  ('Siti Nurhaliza', 5, 'Pak Herman sangat membantu memilihkan smartphone yang sesuai kebutuhan saya.', '2024-11-20'),
  ('Ahmad Fauzi', 5, 'Fast response, pengiriman cepat, dan produk sesuai deskripsi. Terima kasih!', '2024-10-08')
ON CONFLICT DO NOTHING;
