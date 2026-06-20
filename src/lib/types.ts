export interface Profil {
  id: string;
  nama: string;
  jabatan: string;
  tagline: string;
  deskripsi: string;
  foto_url: string;
  whatsapp: string;
  telepon: string;
  email: string;
  alamat: string;
  jam_operasional: string;
  created_at: string;
  updated_at: string;
}

export interface Produk {
  id: string;
  nama: string;
  kategori: 'flagship' | 'mid-range' | 'budget' | 'foldable' | 'aksesoris';
  harga: number;
  harga_coret: number | null;
  diskon_persen: number | null;
  spesifikasi: Spesifikasi;
  warna_tersedia: string[];
  stok: boolean;
  deskripsi: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  produk_foto?: ProdukFoto[];
}

export interface Spesifikasi {
  ram: string;
  storage: string;
  processor: string;
  battery: string;
  screen: string;
  camera: string;
}

export interface ProdukFoto {
  id: string;
  produk_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Testimoni {
  id: string;
  nama: string;
  rating: number;
  komentar: string;
  tanggal: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: number;
  hero_eyebrow: string;
  hero_headline: string | null;
  hero_subtitle: string | null;
  hero_status_label: string;
  hero_proof_1: string;
  hero_proof_2: string;
  hero_proof_3: string;
  hero_floating_title: string;
  hero_floating_caption: string;
  hero_stat_title: string;
  hero_stat_caption: string;
  cta_primary_label: string;
  cta_secondary_label: string;
  updated_at: string;
}

export const KATEGORI_LABELS: Record<Produk['kategori'], string> = {
  flagship: 'Flagship',
  'mid-range': 'Mid-Range',
  budget: 'Budget',
  foldable: 'Foldable',
  aksesoris: 'Aksesoris',
};
