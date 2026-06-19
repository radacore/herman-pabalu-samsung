// Lightweight input validation helpers (no Zod dependency).
// All validators throw on failure and return a typed value on success.

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const KATEGORI = new Set(['flagship', 'mid-range', 'budget', 'foldable', 'aksesoris']);

export function validateProdukPayload(raw: unknown) {
  if (!raw || typeof raw !== 'object') {
    throw new ValidationError('Payload harus berupa object');
  }
  const data = raw as Record<string, unknown>;

  const nama = String(data.nama ?? '').trim();
  if (!nama) throw new ValidationError('nama wajib diisi');
  if (nama.length > 200) throw new ValidationError('nama terlalu panjang (max 200)');

  const kategori = String(data.kategori ?? '');
  if (!KATEGORI.has(kategori)) {
    throw new ValidationError(`kategori tidak valid: ${kategori}`);
  }

  const harga = Number(data.harga);
  if (!Number.isFinite(harga) || harga < 0) {
    throw new ValidationError('harga harus angka >= 0');
  }

  const stok = Boolean(data.stok);

  const warna = Array.isArray(data.warna)
    ? (data.warna as unknown[]).map((w) => String(w).trim()).filter(Boolean)
    : [];

  const deskripsi = data.deskripsi ? String(data.deskripsi) : null;
  const is_featured = Boolean(data.is_featured ?? data.featured);
  const is_active = data.is_active === undefined ? true : Boolean(data.is_active);

  const harga_coret =
    data.harga_coret === null || data.harga_coret === undefined || data.harga_coret === ''
      ? null
      : Number(data.harga_coret);
  if (harga_coret !== null && (!Number.isFinite(harga_coret) || harga_coret < 0)) {
    throw new ValidationError('harga_coret harus angka >= 0 atau null');
  }

  const diskon_persen =
    data.diskon_persen === null || data.diskon_persen === undefined || data.diskon_persen === ''
      ? null
      : Number(data.diskon_persen);
  if (
    diskon_persen !== null &&
    (!Number.isFinite(diskon_persen) || diskon_persen < 0 || diskon_persen > 100)
  ) {
    throw new ValidationError('diskon_persen harus 0-100 atau null');
  }

  const sort_order = data.sort_order === undefined ? 0 : Number(data.sort_order);
  if (!Number.isFinite(sort_order)) {
    throw new ValidationError('sort_order harus angka');
  }

  const spesifikasi =
    data.spesifikasi && typeof data.spesifikasi === 'object'
      ? (data.spesifikasi as Record<string, unknown>)
      : {};

  return {
    nama,
    kategori: kategori as 'flagship' | 'mid-range' | 'budget' | 'foldable' | 'aksesoris',
    harga,
    harga_coret,
    diskon_persen,
    stok,
    warna,
    warna_tersedia: warna,
    deskripsi,
    is_featured,
    is_active,
    sort_order,
    spesifikasi,
  };
}

export function validateProfilPayload(raw: unknown) {
  if (!raw || typeof raw !== 'object') {
    throw new ValidationError('Payload harus berupa object');
  }
  const data = raw as Record<string, unknown>;

  const nama = String(data.nama ?? '').trim();
  if (!nama) throw new ValidationError('nama wajib diisi');

  const jabatan = String(data.jabatan ?? '').trim();
  if (!jabatan) throw new ValidationError('jabatan wajib diisi');

  return {
    nama,
    jabatan,
    tagline: data.tagline ? String(data.tagline) : null,
    deskripsi: data.deskripsi ? String(data.deskripsi) : null,
    foto_url: data.foto_url ? String(data.foto_url) : null,
    whatsapp: data.whatsapp ? String(data.whatsapp) : null,
    telepon: data.telepon ? String(data.telepon) : null,
    email: data.email ? String(data.email) : null,
    alamat: data.alamat ? String(data.alamat) : null,
    jam_operasional: data.jam_operasional ? String(data.jam_operasional) : null,
    tentang: data.tentang ? String(data.tentang) : null,
  };
}

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file: File) {
  if (!file || file.size === 0) {
    throw new ValidationError('File kosong');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(`File terlalu besar (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new ValidationError(`Tipe file tidak didukung: ${file.type}`);
  }
}

export function validateTestimoniPayload(raw: unknown) {
  if (!raw || typeof raw !== 'object') {
    throw new ValidationError('Payload harus berupa object');
  }
  const data = raw as Record<string, unknown>;

  const nama = String(data.nama ?? '').trim();
  if (!nama) throw new ValidationError('nama wajib diisi');
  if (nama.length > 100) throw new ValidationError('nama terlalu panjang (max 100)');

  const komentar = String(data.komentar ?? '').trim();
  if (!komentar) throw new ValidationError('komentar wajib diisi');
  if (komentar.length > 1000) throw new ValidationError('komentar terlalu panjang (max 1000)');

  const rating = Number(data.rating ?? 5);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ValidationError('rating harus integer 1-5');
  }

  const tanggal = data.tanggal ? String(data.tanggal) : new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    throw new ValidationError('tanggal harus format YYYY-MM-DD');
  }

  const is_active = data.is_active === undefined ? true : Boolean(data.is_active);

  return { nama, komentar, rating, tanggal, is_active };
}
