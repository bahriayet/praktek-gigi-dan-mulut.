# Klinik Gigi Sehat & Praktek Gigi Ranida - Sistem Manajemen Terpadu

Sistem manajemen antrean, rekam medis elektronik (EMR), dan analitik klinis modern untuk Klinik Gigi. Dibangun dengan Next.js dan didukung oleh kecerdasan buatan (AI) yang 100% berjalan secara lokal untuk menjaga privasi data pasien.

## 🚀 Fitur Utama
- **Sistem Antrean Real-time**: Pendaftaran antrean pasien (terintegrasi dengan notifikasi WhatsApp melalui Fonnte).
- **EMR & Odontogram Digital**: Pencatatan rekam medis gigi pasien yang detail dan interaktif.
- **Ranida Local AI Engine**: Fitur asisten cerdas berbasis Machine Learning (Python/Flask) yang mampu memberikan prediksi diagnosa secara *offline* (tanpa membagikan data pasien ke AI Cloud pihak ketiga seperti Gemini/OpenAI).
- **Dashboard Admin & Dokter**: Panel kontrol penuh untuk manajemen jadwal, antrean, dan rekam medis.
- **Manajemen Inventaris**: Pelacakan stok alat dan bahan.

## 💻 Teknologi yang Digunakan
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion.
- **Backend / Database**: Firebase (Hosting, Firestore, Auth) & Supabase.
- **Local AI Engine**: Python, Flask, scikit-learn (Random Forest).
- **Package Manager**: Bun.

## 🛠️ Cara Menjalankan (Frontend)

**Prasyarat:** Bun (versi terbaru)

1. Install dependensi:
   ```bash
   bun install
   ```
2. Jalankan aplikasi frontend:
   ```bash
   bun run dev
   ```
3. Build & Deploy:
   ```bash
   bun run build
   bunx firebase deploy --only hosting
   ```

Aplikasi akan berjalan secara lokal di `http://localhost:3000`.

## 🧠 Cara Menjalankan (Local AI Backend)
Agar fitur *Asisten Dokter (AI)* berfungsi, server Python lokal harus berjalan:

1. Masuk ke folder backend:
   ```bash
   cd python_ai_backend
   ```
2. Install pustaka Python:
   ```bash
   pip install -r requirements.txt
   ```
3. Latih model AI (Jika belum ada `model_ai_gigi_pro.pkl`):
   ```bash
   python train_pro_model.py
   ```
4. Jalankan server Flask:
   ```bash
   python flask_app.py
   ```
Server AI akan berjalan di `http://127.0.0.1:5000`.

## 📁 Struktur Proyek

- `app/`: Frontend Next.js (Pages, Components, UI).
- `python_ai_backend/`: Backend Kecerdasan Buatan (Machine Learning Lokal).
  - `flask_app.py`: Server API untuk melayani prediksi diagnosis ke Frontend.
  - `train_pro_model.py`: Skrip untuk melatih model AI baru.
  - `generate_dental_dataset_expanded.py`: Generator data latih (mockup dataset).
  - `model_ai_gigi_pro.pkl`: File model Random Forest (AI Otak).
- `lib/`: Kumpulan utilitas konfigurasi Firebase & Supabase.
- `public/`: Aset gambar dan file statis publik.
- `out/`: Hasil *static export* saat `bun run build` (digunakan untuk Firebase Hosting).

## 🔒 Variabel Lingkungan (Environment Variables)

Aplikasi ini membutuhkan Firebase & Supabase. Buat file `.env.local` di root folder dan isi kunci rahasia berikut (jangan pernah melakukan commit file ini ke GitHub):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
