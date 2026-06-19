-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel Produk
CREATE TABLE IF NOT EXISTS produk (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL CHECK (kategori IN ('flagship', 'mid-range', 'budget', 'foldable')),
  harga INTEGER NOT NULL DEFAULT 0,
  stok BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  spesifikasi JSONB DEFAULT '{}',
  warna TEXT[] DEFAULT ARRAY[]::TEXT[],
  gambar TEXT,
  deskripsi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Profil
CREATE TABLE IF NOT EXISTS profil (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  whatsapp TEXT,
  telepon TEXT,
  email TEXT,
  alamat TEXT,
  tentang TEXT,
  foto TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Produk Images (untuk multiple images per produk)
CREATE TABLE IF NOT EXISTS produk_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produk_id UUID REFERENCES produk(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_produk_kategori ON produk(kategori);
CREATE INDEX IF NOT EXISTS idx_produk_featured ON produk(featured);
CREATE INDEX IF NOT EXISTS idx_produk_images_produk_id ON produk_images(produk_id);

-- Insert data profil awal
INSERT INTO profil (id, nama, jabatan, whatsapp, telepon, email, alamat, tentang)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Herman Baharuddin',
  'Sales Executive Samsung',
  '08123456789',
  '08123456789',
  'herman.baharuddin@example.com',
  'Jl. Sudirman No. 123, Jakarta Selatan',
  'Sales Executive Samsung dengan pengalaman lebih dari 10 tahun. Membantu pelanggan menemukan smartphone Samsung terbaik sesuai kebutuhan dan budget.'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample produk
INSERT INTO produk (nama, kategori, harga, stok, featured, spesifikasi, warna, gambar, deskripsi) VALUES
(
  'Samsung Galaxy S25 Ultra',
  'flagship',
  19990000,
  true,
  true,
  '{"ram": "12GB", "storage": "256GB", "processor": "Snapdragon 8 Elite", "layar": "6.8 inch Dynamic AMOLED", "kamera": "200MP + 50MP + 12MP + 10MP", "battery": "5000mAh"}',
  ARRAY['Black Titanium', 'Gray Titanium', 'Blue Titanium', 'White Titanium'],
  '/products/s25-ultra.jpg',
  'Flagship premium dengan Galaxy AI dan performa terbaik di kelasnya.'
),
(
  'Samsung Galaxy Z Fold 6',
  'foldable',
  27990000,
  true,
  true,
  '{"ram": "12GB", "storage": "256GB", "processor": "Snapdragon 8 Gen 3", "layar": "7.6 inch Foldable + 6.3 inch Cover", "kamera": "50MP + 12MP + 10MP", "battery": "4400mAh"}',
  ARRAY['Silver Shadow', 'Pink', 'Navy', 'Crafted Black'],
  '/products/z-fold-6.jpg',
  'Smartphone lipat dengan layar besar dan multitasking superior.'
),
(
  'Samsung Galaxy A56',
  'mid-range',
  5490000,
  true,
  true,
  '{"ram": "8GB", "storage": "128GB", "processor": "Exynos 1580", "layar": "6.7 inch Super AMOLED", "kamera": "50MP + 12MP + 5MP", "battery": "5000mAh"}',
  ARRAY['Awesome Iceblue', 'Awesome Lilac', 'Awesome Navy', 'Awesome Graphite'],
  '/products/a56.jpg',
  'Mid-range dengan fitur premium dan harga terjangkau.'
),
(
  'Samsung Galaxy A16',
  'budget',
  2490000,
  true,
  false,
  '{"ram": "4GB", "storage": "64GB", "processor": "Helio G99", "layar": "6.7 inch Super AMOLED", "kamera": "50MP + 5MP + 2MP", "battery": "5000mAh"}',
  ARRAY['Blue Black', 'Gold', 'Light Green', 'Light Violet'],
  '/products/a16.jpg',
  'Budget-friendly dengan kualitas Samsung yang terpercaya.'
);

-- Row Level Security (RLS) - untuk proteksi data
ALTER TABLE produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE profil ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk_images ENABLE ROW LEVEL SECURITY;

-- Policy: Semua user bisa baca produk
CREATE POLICY "Enable read access for all users" ON produk
  FOR SELECT USING (true);

-- Policy: Hanya authenticated users yang bisa write produk
CREATE POLICY "Enable write access for authenticated users" ON produk
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Semua user bisa baca profil
CREATE POLICY "Enable read access for profil" ON profil
  FOR SELECT USING (true);

-- Policy: Hanya authenticated users yang bisa update profil
CREATE POLICY "Enable write access for profil" ON profil
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Semua user bisa baca produk images
CREATE POLICY "Enable read access for produk images" ON produk_images
  FOR SELECT USING (true);

-- Policy: Hanya authenticated users yang bisa write produk images
CREATE POLICY "Enable write access for produk images" ON produk_images
  FOR ALL USING (auth.role() = 'authenticated');
