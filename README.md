# PT SAWAH JAYA TRANS — Platform Rental & Taksi Mobil Listrik

Platform resmi pemesanan rental mobil listrik (VinFast VF 5 & VF e34) dan layanan taksi mobil listrik terintegrasi di kawasan Surabaya, Sidoarjo, dan Malang. Didukung oleh sistem operasional **Smart Journey** dengan integrasi pembayaran digital **ArtoPay**, sistem ketersediaan armada dinamis (aturan H-1), dashboard pengelola armada, serta optimasi SEO perkotaan.

---

## 🚀 Teknologi yang Digunakan

### Frontend
- **React 19** & **TypeScript**
- **Vite 8** (Build tool & bundler)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Lucide React** (Modern vector icons)
- **Leaflet & OpenStreetMap** (Pemetaan rute & titik penjemputan taksi)
- **Motion** (Animasi interaktif halus)

### Backend & API
- **Node.js** & **Express**
- **Vercel Serverless Functions** (`/api/index.ts`)
- **Better-SQLite3** (Database lokal dengan dukungan serverless fallback)
- **HMAC-SHA256 & Webhook Idempotency** (ArtoPay Payment Gateway)

---

## 📂 Struktur Project

```text
├── api/                   # Vercel Serverless Function entry point
│   └── index.ts           # Handler Express serverless untuk rute /api/*
├── data/                  # Direktori database SQLite lokal (diabaikan oleh git)
├── public/                # Asset publik statis, logo resmi, robots.txt, sitemap.xml
│   ├── assets/            # Logo dan materi visual resmi PT Sawah Jaya Trans
│   ├── robots.txt         # Konfigurasi indexing mesin pencari (SEO)
│   └── sitemap.xml        # Sitemap XML resmi halaman layanan & kota
├── server/                # Backend API & Database Layer
│   ├── db.ts              # Inisialisasi schema database & data awal armada
│   └── routes.ts          # Endpoint Express (Rental, Taksi, ArtoPay, Admin)
├── src/                   # Frontend React SPA
│   ├── components/        # Komponen UI (Hero, Fleet, Booking Modal, Payment, dll)
│   ├── lib/               # API client abstraction (src/lib/api.ts)
│   ├── pages/             # Halaman Admin Dashboard
│   ├── types/             # Definisi interface TypeScript
│   ├── App.tsx            # Root component & client-side routing
│   └── main.tsx           # Entry point React
├── .env.example           # Template environment variables (tanpa rahasia)
├── .gitignore             # Daftar file & folder yang diabaikan Git
├── index.html             # HTML template utama
├── package.json           # Dependencies dan scripts
├── tsconfig.json          # Konfigurasi TypeScript
├── vercel.json            # Konfigurasi deployment Vercel Free Plan (Vite SPA + API)
└── vite.config.ts         # Konfigurasi Vite & Tailwind CSS v4
```

---

## ⚙️ Persyaratan Sistem

- **Node.js**: Versi `>= 20.x` (Direkomendasikan Node.js 22 LTS)
- **npm**: Versi `>= 10.x`

---

## 📥 Panduan Instalasi Lokal

1. **Clone Repository:**
   ```bash
   git clone https://github.com/username/sbyevrent.git
   cd sbyevrent
   ```

2. **Pasang Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Sesuaikan nilai variabel di dalam `.env` sesuai kebutuhan pengujian lokal Anda.

---

## 🔑 Daftar Environment Variables

Konfigurasikan variabel berikut di file `.env` (lokal) atau pada menu **Settings > Environment Variables** di dashboard Vercel:

| Nama Variabel | Wajib/Opsional | Deskripsi |
|---|---|---|
| `ADMIN_DEFAULT_PASSWORD` | Opsional | Password/PIN awal admin dashboard (default: `admin2026`) |
| `ADMIN_PIN` | Opsional | Alias PIN admin cadangan |
| `VITE_API_URL` | Opsional | URL backend eksternal (kosongkan jika menggunakan serverless di domain yang sama) |
| `PORT` | Opsional | Port server development (default: `3000`) |
| `NODE_ENV` | Otomatis | Lingkungan runtime (`development` atau `production`) |

> **Catatan Keamanan:** Jangan pernah menyimpan API Key, password, atau credential asli di dalam repository GitHub publik. Selalu masukkan nilai rahasia melalui panel Vercel Project Settings.

---

## 💻 Menjalankan Aplikasi

### Mode Development
Menjalankan server full-stack terintegrasi (Express backend + Vite HMR frontend):
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

### Type Checking & Linting
Memeriksa integritas tipe data TypeScript:
```bash
npm run lint
```

### Build Production
Mengompilasi asset frontend ke direktori `dist/`:
```bash
npm run build
```

### Preview Hasil Build
Menjalankan preview lokal dari direktori `dist/`:
```bash
npm run preview
```

---

## ☁️ Panduan Deployment ke Vercel (Hobby / Free Plan)

Project ini telah dikonfigurasi dengan `vercel.json` siap pakai untuk Vercel Free Plan.

### Langkah 1: Push ke GitHub
1. Inisialisasi Git (jika belum dilakukan):
   ```bash
   git init
   git add .
   git commit -m "feat: prepare PT Sawah Jaya Trans for Vercel deployment"
   ```
2. Buat repository baru di akun GitHub Anda (misal: `sawah-jaya-trans`).
3. Hubungkan remote dan push ke branch `main`:
   ```bash
   git remote add origin https://github.com/<username>/sawah-jaya-trans.git
   git branch -M main
   git push -u origin main
   ```

### Langkah 2: Hubungkan Repository ke Vercel
1. Masuk ke akun [Vercel](https://vercel.com).
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Hubungkan akun GitHub Anda dan pilih repository `sawah-jaya-trans`.

### Langkah 3: Konfigurasi Project Settings di Vercel
Vercel akan mendeteksi framework Vite secara otomatis:
- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Langkah 4: Masukkan Environment Variables
Pada accordion **Environment Variables** sebelum menekan tombol Deploy, tambahkan:
- `ADMIN_DEFAULT_PASSWORD`
- `ARTOPAY_MERCHANT_ID`
- `ARTOPAY_API_KEY`
- `ARTOPAY_SECRET_KEY`
- `ARTOPAY_SANDBOX_MODE` (isi `true` jika masih tahap sandbox)

### Langkah 5: Deploy
Klik tombol **"Deploy"**. Vercel akan mengompilasi frontend dan menyiapkan serverless functions. Dalam hitungan detik website akan aktif pada domain bawaan Vercel (contoh: `https://sawah-jaya-trans.vercel.app`).

---

## 🗄️ Catatan Arsitektur Database di Vercel Serverless

1. **Lingkungan Serverless (Vercel Free Plan)**:
   - Serverless Functions Vercel bersifat *stateless* (tidak memiliki disk penyimpanan persisten selain folder sementara `/tmp`).
   - Project ini secara otomatis mendeteksi lingkungan Vercel dan mengarahkan SQLite ke `/tmp/sjtrans.db` dengan data inisialisasi awal armada otomatis dimuat.
2. **Kebutuhan Produksi Persisten**:
   - Jika Anda membutuhkan data pemesanan, ketersediaan, dan transaksi tersimpan permanen tanpa tereset saat terjadi cold start serverless, disarankan menggunakan database eksternal cloud yang kompatibel (seperti **Turso libSQL / SQLite Cloud**, **Neon PostgreSQL**, atau **Supabase**) atau menempatkan backend Express pada layanan web service persisten (seperti **Render**, **Railway**, atau VPS) dan menghubungkannya dengan mengisi `VITE_API_URL` pada frontend Vercel.

---

## 🛡️ Hak Cipta & Lisensi
Hak Cipta &copy; 2026 PT SAWAH JAYA TRANS. Powered by Smart Journey. Seluruh hak cipta dilindungi undang-undang.
