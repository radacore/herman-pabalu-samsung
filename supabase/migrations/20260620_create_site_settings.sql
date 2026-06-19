-- Migration: site_settings (singleton row) for editable homepage content
-- Lets admin manage homepage copy from /admin/pengaturan without code changes

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_eyebrow TEXT DEFAULT 'Sales Executive Samsung',
  hero_headline TEXT,
  hero_subtitle TEXT,
  hero_status_label TEXT DEFAULT 'Tersedia untuk chat',
  hero_proof_1 TEXT DEFAULT '10+ tahun pengalaman',
  hero_proof_2 TEXT DEFAULT 'Garansi resmi Samsung',
  hero_proof_3 TEXT DEFAULT 'Respon < 5 menit',
  hero_floating_title TEXT DEFAULT 'Top Seller',
  hero_floating_caption TEXT DEFAULT 'Resmi Samsung SEIN',
  hero_stat_title TEXT DEFAULT '10+',
  hero_stat_caption TEXT DEFAULT 'Tahun',
  cta_primary_label TEXT DEFAULT 'Chat WhatsApp',
  cta_secondary_label TEXT DEFAULT 'Lihat Produk',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed singleton row (idempotent)
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for site_settings" ON site_settings;
CREATE POLICY "Enable read access for site_settings" ON site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for site_settings" ON site_settings;
CREATE POLICY "Enable write access for site_settings" ON site_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
