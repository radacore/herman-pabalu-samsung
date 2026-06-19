# Herman Baharuddin - Sales Executive Samsung

Website profil dan katalog produk untuk Sales Executive Samsung Indonesia. Dibangun dengan Astro 5 (SSR), Tailwind CSS, dan Supabase sebagai backend.

## 🚀 Fitur Utama

- **Halaman Publik (Cream + Violet design system)** — Hero asimetris dengan photo card goyang, katalog produk dengan filter kategori, testimoni, dan kontak WhatsApp
- **Admin Panel** — Dashboard, CRUD produk, upload foto produk, edit profil, dan **Pengaturan Website** (konten hero bisa diubah dari admin tanpa coding)
- **Hero Photo Animation** — Photo card berayun (goyang) otomatis, lebih intens saat hover
- **Toast Notifications** — Feedback untuk setiap aksi (delete, edit, tambah) dengan modal konfirmasi
- **Authentication** — Login admin dengan Supabase Auth + server-side auth middleware
- **SEO Optimized** — Meta tags, structured data (LocalBusiness), sitemap
- **Database** — Supabase PostgreSQL dengan Row Level Security (RLS) policies
- **Responsive** — Mobile-first, breakpoint SM/MD/LG/XL, hero stack otomatis di mobile

## 📋 Tech Stack

- **Framework:** Astro 5.18 dengan Server-Side Rendering (SSR)
- **Styling:** Tailwind CSS 3.4 + Plus Jakarta Sans (admin) + Inter Variable (public)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Adapter:** `@astrojs/node` standalone (Vercel-ready)
- **Type Safety:** TypeScript strict mode

## 🛠️ Setup Development

### 1. Clone Repository

```bash
git clone https://github.com/radacore/herman-pabalu-samsung.git
cd herman-pabalu-samsung
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Salin `.env.example` ke `.env` lalu isi dengan kredensial Supabase:

```bash
cp .env.example .env
```

Isi file `.env` dengan kredensial project Supabase kamu:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
PUBLIC_SITE_URL=http://localhost:4321
```

### 4. Setup Database Supabase

Jalankan file SQL secara berurutan di Supabase SQL Editor:

1. `supabase/schema.sql` — tabel utama (produk, profil, testimoni, produk_images)
2. `supabase/migrations/20260619_sync_produk_fields.sql` — kolom tambahan (is_active, is_featured, sort_order, dll)
3. `supabase/migrations/20260620_create_site_settings.sql` — tabel pengaturan website (hero editable)

### 5. Buat Admin User

Di Supabase Dashboard:

1. Buka **Authentication** → **Users**
2. Klik **Add User** → **Create New User**
3. Isi email dan password
4. Centang **Auto Confirm User**
5. Klik **Create User**

### 6. Setup Storage Bucket

Di Supabase Dashboard:

1. Buka **Storage** → **New Bucket**
2. Nama: `produk-images`
3. Centang **Public bucket**
4. Klik **Create Bucket**

### 7. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:4321](http://localhost:4321)

## 📦 Build untuk Production

```bash
npm run build
```

Output ada di folder `dist/` (SSR Node standalone).

## 🚢 Deployment

Project ini bisa di-deploy ke platform manapun yang support Node.js SSR. Contoh untuk Vercel:

1. Ganti adapter di `astro.config.mjs` ke `@astrojs/vercel`
2. Push ke GitHub
3. Connect repository di Vercel
4. Set environment variables di Vercel Dashboard
5. Deploy

Untuk platform lain (Railway, Fly.io, DigitalOcean App Platform, VPS):

```bash
# Build
npm run build

# Run
node ./dist/server/entry.mjs
```

Default port 8080, set `PORT` env untuk override.

## 📁 Struktur Folder

```
herman-pabalu-samsung/
├── .env.example                    # Template environment variables
├── astro.config.mjs                # Astro configuration (Node adapter)
├── tailwind.config.mjs             # Tailwind config + design tokens
├── tsconfig.json                   # TypeScript strict
├── package.json                    # Dependencies
├── public/                         # Static assets
│   ├── favicon.svg
│   └── robots.txt
├── supabase/
│   ├── schema.sql                  # Initial schema
│   └── migrations/                 # Iterative migrations
│       ├── 20260619_sync_produk_fields.sql
│       └── 20260620_create_site_settings.sql
└── src/
    ├── components/                 # Astro components
    │   ├── Hero.astro               # Asymmetric split hero + photo shake
    │   ├── Navbar.astro             # Top navigation
    │   ├── Footer.astro
    │   ├── ProdukGrid.astro
    │   ├── ProdukCard.astro
    │   ├── TentangSaya.astro
    │   ├── Testimoni.astro
    │   ├── Kontak.astro
    │   ├── WhatsAppButton.astro
    │   ├── EditorialBreak.astro     # Section header with illustration
    │   └── admin/                   # Admin components
    │       ├── Sidebar.astro
    │       ├── StatCard.astro
    │       ├── ProdukForm.astro
    │       └── UploadWidget.astro
    ├── layouts/
    │   ├── BaseLayout.astro         # Public site layout
    │   └── AdminLayout.astro        # Admin panel layout
    ├── lib/
    │   ├── supabase.ts             # Public Supabase client
    │   ├── supabase-admin.ts        # Service role client
    │   ├── supabase-browser.ts      # Browser Supabase client
    │   ├── validation.ts            # Input validation
    │   ├── toast.ts                 # Toast notifications
    │   ├── confirm.ts               # Confirm dialog
    │   └── types.ts                 # TypeScript interfaces
    ├── pages/
    │   ├── index.astro              # Homepage
    │   ├── admin/                   # Admin routes
    │   │   ├── login.astro
    │   │   ├── index.astro          # Dashboard
    │   │   ├── produk.astro         # List + delete
    │   │   ├── produk/
    │   │   │   ├── tambah.astro
    │   │   │   └── edit.astro
    │   │   ├── testimoni.astro
    │   │   ├── profil.astro
    │   │   ├── upload.astro
    │   │   └── pengaturan.astro     # Site settings (hero editor)
    │   └── api/                     # API endpoints
    │       ├── produk.ts
    │       ├── testimoni.ts
    │       ├── profil.ts
    │       ├── upload.ts
    │       └── site-settings.ts
    ├── scripts/
    │   └── reveal.ts                # Scroll-reveal IntersectionObserver
    ├── middleware.ts                # Admin auth gate
    └── styles/
        └── global.css               # Tailwind base + component utilities
```

## 🔐 Security

- **Row Level Security (RLS)** aktif di semua tabel: public read-only, admin write
- **Server-side auth middleware** di `src/middleware.ts`: admin routes terproteksi
- **Environment variables**: secrets disimpan server-side, tidak pernah di-bundle ke client
- **Service role key**: hanya digunakan di API routes (server-only), tidak pernah di-import di client components
- **HTTPOnly cookie auth**: `sb-access-token` cookie diset saat login, divalidasi di middleware

## 🎨 Design System

Project ini mengikuti design system kustom terinspirasi dari cream + violet aesthetic:

**Colors:**
- Cream `#f0f0ec` — page canvas
- Ink `#1a1a1a` — primary text
- Violet `#1009f6` — interactive accent (CTAs, checkmarks, active states)
- Yellow `#ffba09` — warm CTA, featured badge, highlights
- Stone `#d4d4d0` — dividers
- WhatsApp `#25D366` — brand green untuk WA buttons

**Shape system:**
- Cards: 24px radius (rounded-3xl)
- Pills (CTAs, badges): 999px (rounded-pill)
- Buttons: 24px (rounded-3xl)
- Input: 4px radius (rounded-md)

**Typography:**
- Display: Inter Tight Variable
- Body: Inter Variable
- Admin: Plus Jakarta Sans Variable

**Prinsip:**
- No drop shadows — cream/white contrast adalah elevation system
- Asymmetric split hero dengan photo card goyang (gentle sway)
- Yellow + outlined dark CTA pair (per design system spec)

## 🛠️ Halaman Admin

Akses admin panel: `https://yourdomain.com/admin/login`

Fitur lengkap:
- **Dashboard** — statistik produk (total, tersedia, habis, kategori) + produk terbaru
- **Produk** — CRUD dengan konfirmasi delete (modal), edit, upload foto
- **Testimoni** — CRUD dengan rating bintang
- **Profil** — update data sales (nama, jabatan, kontak, alamat, foto)
- **Upload Foto** — multi-file upload dengan progress bar
- **Pengaturan Website** — edit hero text (headline, subtitle, proof chips, CTA labels, floating cards) tanpa coding

## 🔄 Update Database Schema

Setiap perubahan schema disimpan sebagai file migration di `supabase/migrations/`. Cara apply:

1. Buat file baru: `supabase/migrations/YYYYMMDD_nama_perubahan.sql`
2. Isi dengan SQL statements
3. Apply via Supabase Dashboard SQL Editor atau via Supabase CLI

## 🐛 Troubleshooting

### Error: Build gagal karena CSS class tidak ditemukan

Jalankan ulang dev server dengan cache bersih:

```bash
rm -rf node_modules/.vite .astro
npm run dev
```

### Error: Supabase connection failed

- Pastikan environment variables benar
- Check project status di Supabase Dashboard
- Verify URL dan API keys tidak terbalik (anon vs service role)

### Error: Admin tidak bisa login

- Pastikan user sudah dibuat di Supabase Auth
- Check RLS policies untuk tabel `profil` allow read untuk authenticated users
- Clear cookies browser dan coba lagi

### Toast atau modal tidak muncul

- Pastikan script di-load dengan benar (cek console untuk error)
- Verify `toast.ts` dan `confirm.ts` di-import di halaman admin

## 📄 License

MIT License - Bebas digunakan untuk keperluan pribadi maupun komersial.

## 👤 Author

**Herman Baharuddin** - Sales Executive Samsung Indonesia

---

Made dengan ❤️ menggunakan Astro 5 + Supabase + Tailwind CSS
