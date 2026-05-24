# 🗄️ Panduan Struktur Database (Firebase Firestore)

Dokumen ini berisi panduan untuk memahami nama-nama koleksi (tabel/folder) di dalam database Firebase aplikasi **Praktek Gigi Ranida**. 
Jika Anda lupa fungsi dari sebuah data di Firebase saat sedang mengecek konsol, silakan buka dan baca dokumen ini.

---

## 📂 Daftar Koleksi (Tabel)

### 1. `users` (Akun Login)
Ini adalah tabel yang mengatur akses keamanan dan otentikasi.
- **Fungsi:** Menyimpan daftar akun (email, nama, *role/peran*) dari setiap orang yang mendaftar ke aplikasi.
- **Keterangan:** Tabel ini menentukan apakah seseorang itu adalah seorang `admin`, `doctor`, atau hanya `patient` biasa.

### 2. `patients` (Biodata Master Pasien)
Ini adalah rekam medis identitas dasar pasien.
- **Fungsi:** Menyimpan informasi identitas yang sifatnya permanen (tidak berubah setiap hari).
- **Isi Data:** Nama lengkap, nomor telepon, alamat, tanggal lahir, riwayat penyakit (misal: asma, jantung), dan riwayat alergi (misal: alergi obat bius).
- **Keterangan:** Data di tabel ini **tidak boleh dihapus** sembarangan agar jejak riwayat pasien di klinik tidak hilang.

### 3. `queues` (Antrean Harian)
Ini adalah tabel operasional yang sangat dinamis (sering bertambah dan terhapus setiap hari).
- **Fungsi:** Mencatat daftar pasien yang datang ke klinik **hari ini** dan sedang menunggu giliran.
- **Isi Data:** Nomor antrean (contoh: A-001), jam kedatangan, keluhan awal, dan status panggilan (apakah sedang `WAITING` atau `CALLING`).

### 4. `visits` (Catatan Kunjungan / Rekam Medis)
Ini adalah rekam medis elektronik (*Electronic Medical Record / EMR*).
- **Fungsi:** Menyimpan catatan medis dokter setelah pasien selesai diperiksa.
- **Isi Data:** Umumnya menggunakan format SOAP (*Subjective, Objective, Assessment, Plan*). Berisi diagnosa dokter spesifik pada hari tersebut, tindakan medis yang dilakukan, serta resep obat yang diberikan.

### 5. `inventory` (Stok Barang & Obat)
Ini adalah tabel manajemen perlengkapan klinik.
- **Fungsi:** Mencatat semua stok alat medis dan obat-obatan.
- **Isi Data:** Nama barang (contoh: Kapas, Jarum Suntik, Obat Pereda Nyeri), jumlah stok tersisa, dan keterangan harga.

### 6. `config` (Konfigurasi Sistem)
Ini adalah tabel khusus untuk sistem komputer (mesin).
- **Fungsi:** Mengatur setelan (*settings*) yang digunakan oleh website Anda agar berjalan sinkron.
- **Isi Data:** Mencatat nomor antrean ke berapa yang sedang dipanggil saat ini (`currentNumber`), tautan foto utama halaman depan (`heroImageUrl`), dan pengaturan status libur klinik.

### 7. `photos` (Galeri Klinik)
Ini adalah tabel untuk halaman publik.
- **Fungsi:** Menyimpan daftar tautan (URL) foto-foto yang akan ditampilkan pada halaman Galeri di website agar pasien bisa melihat suasana klinik Anda.

---

> 💡 **Catatan Programmer:** 
> Nama-nama koleksi di atas sengaja dibiarkan dalam **Bahasa Inggris** untuk mematuhi standar pemrograman (*best practice*) dan mencegah *error* pada sistem aplikasi. Anda tidak perlu khawatir, karena **staf klinik dan pasien tidak akan pernah melihat nama-nama bahasa Inggris ini**. Saat mereka menggunakan website, semuanya sudah diterjemahkan ke dalam tampilan Bahasa Indonesia yang rapi.
