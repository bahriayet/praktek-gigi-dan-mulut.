# Product Requirement Document (PRD)
## Sistem Manajemen Terpadu Klinik Gigi (Praktek Gigi Ranida)

---

## 1. Latar Belakang & Deskripsi Produk

### 1.1. Latar Belakang
Pengelolaan klinik gigi modern menuntut efisiensi tinggi dalam manajemen antrean pasien, akurasi tinggi dalam pencatatan Rekam Medis Elektronik (EMR), dan integrasi data klinis yang responsif. Di sisi lain, isu **privasi data pasien** menjadi fokus utama dalam implementasi teknologi kecerdasan buatan (AI) di bidang medis. Penggunaan API AI berbasis cloud (seperti OpenAI atau Gemini) berisiko membocorkan data medis rahasia pasien ke pihak ketiga.

### 1.2. Solusi
**Sistem Manajemen Terpadu Klinik Gigi Ranida** hadir sebagai sistem manajemen antrean, EMR odontogram digital, dan analitik klinis modern. Keunggulan utama sistem ini adalah integrasi **Ranida Local AI Engine**, asisten cerdas berbasis Machine Learning (Python/Flask/scikit-learn) yang berjalan **100% secara lokal (offline)** pada server klinik. Sistem ini juga terintegrasi dengan WhatsApp Gateway (Fonnte) untuk otomatisasi notifikasi kepada pasien secara real-time.

---

## 2. Aktor / Pengguna Sistem (User Personas)

Sistem ini dirancang untuk melayani 3 aktor utama:

| Aktor | Peran Utama | Kebutuhan Utama |
| :--- | :--- | :--- |
| **Pasien** | Pendaftar Antrean | Pendaftaran antrean mudah secara mandiri, monitor nomor antrean real-time, menerima tiket antrean dan riwayat rekam medis via WhatsApp. |
| **Resepsionis / Admin** | Manajer Operasional | Pengelolaan registrasi antrean, konfirmasi & pemanggilan antrean, manajemen inventaris klinik, dan rekam laporan keuangan harian. |
| **Dokter Gigi** | Penyedia Layanan Klinis | Pemeriksaan EMR berbasis SOAP (Subjective, Objective, Assessment, Plan), pemetaan gigi interaktif (Odontogram), dan konsultasi penunjang diagnosa dengan Asisten AI Lokal. |

---

## 3. Ruang Lingkup Fitur & Kebutuhan Fungsional (Functional Requirements)

### 3.1. FR-01: Sistem Pendaftaran & Antrean Pasien Real-Time
*   **Pendaftaran Mandiri Pasien**: Pasien dapat mendaftar antrean hari ini lewat portal pasien dengan mengisi nama, nomor telepon, alamat, dan keluhan utama.
*   **Penomoran Antrean Otomatis**: Sistem melakukan increment nomor antrean otomatis secara transaksional untuk mencegah nomor ganda.
*   **Monitor Antrean Publik**: Layar TV/monitor antrean di ruang tunggu yang menampilkan antrean aktif, panggilan suara otomatis (*text-to-speech* bahasa Indonesia), dan status antrean (*WAITING*, *CALLING*, *TREATING*, *FINISHED*, *SKIPPED*).
*   **Notifikasi WhatsApp**: Notifikasi otomatis dikirim ke nomor WhatsApp pasien menggunakan Fonnte untuk:
    *   Konfirmasi pendaftaran antrean (berisi Nomor Antrean, Tanggal, Jam Praktik).
    *   Panggilan giliran masuk ruang periksa.
    *   Ringkasan Rekam Medis & Total Biaya (Billing) setelah selesai perawatan.

### 3.2. FR-02: Electronic Medical Record (EMR) berbasis SOAP
*   **Dokumentasi Klinis Terstandar**: Dokter gigi dapat mencatat rekam medis dengan format standar SOAP:
    *   **Subjective (S)**: Keluhan pasien, riwayat alergi, riwayat penyakit sistemik (jantung, diabetes, dll).
    *   **Objective (O)**: Hasil pemeriksaan fisik, Tanda-Tanda Vital (Tekanan Darah, Suhu, Denyut Nadi, Skala Nyeri), dan pemeriksaan Intra-Oral (mukosa, gingiva, lidah, tonsil, dll).
    *   **Assessment (A)**: Penegakan diagnosis kerja klinis beserta kodefikasi standar ICD-10.
    *   **Plan (P)**: Rencana perawatan, tindakan medis yang dilakukan, dan instruksi pasca-perawatan.
*   **Riwayat Kunjungan Kronologis**: EMR menyimpan riwayat kunjungan pasien secara historis dari waktu ke waktu untuk memantau kemajuan perawatan.

### 3.3. FR-03: Odontogram Digital Interaktif
*   **Pemetaan 32 Gigi**: Visualisasi interaktif struktur 32 gigi manusia dewasa yang dibagi menjadi 4 kuadran.
*   **Pemetaan Permukaan Gigi**: Setiap gigi memiliki 5 permukaan spesifik yang dapat diwarnai secara individual (Oklusal/Center, Mesial/Left, Distal/Right, Bukal/Top, Lingual/Bottom).
*   **11 Kode Standar Kondisi Gigi**: Mendukung pelabelan kondisi gigi klinis standar:
    *   `SOU` (Sound / Gigi Sehat)
    *   `CAR` (Caries / Gigi Berlubang)
    *   `MIS` (Missing / Gigi Hilang)
    *   `FIL` (Filling / Tambalan Gigi)
    *   `EXT` (Extracted / Dicabut)
    *   `IMP` (Impacted / Impaksi)
    *   `RCT` (Root Canal Treatment / Perawatan Saluran Akar)
    *   `PRT` (Partial Denture / Gigi Tiruan Sebagian)
    *   `NVT` (Non-Vital Tooth / Gigi Non-Vital)
    *   `CRN` (Crown / Mahkota Gigi)
    *   `BRJ` (Bridge / Jembatan Gigi)

### 3.4. FR-04: Ranida Local AI Engine (Asisten Dokter AI)
*   **Prediksi Diagnosa Lokal**: Menghasilkan rekomendasi diagnosa gigi (misal: *Pulpitis Reversibel*, *Karies Dentin*, *Persistensi Gigi*) berdasarkan kombinasi data umur, jenis kelamin, tekanan darah, keluhan subyektif, dan temuan obyektif dokter.
*   **Rekomendasi Rencana Tindakan (Plan)**: Menghasilkan rekomendasi rencana perawatan (misal: *Restorasi Komposit*, *Ekstraksi*, *Pulpektomi*) yang selaras dengan diagnosis.
*   **Confidence Score Medis**: Menampilkan nilai kepastian prediksi dalam persentase (%) yang dihitung langsung oleh algoritma Random Forest untuk transparansi medis.
*   **Umpan Balik Dokter (Loop Belajar)**: Dokter dapat mengoreksi prediksi AI yang salah. Koreksi ini disimpan secara aman ke dalam database lokal (`koreksi_dokter.csv`) untuk digunakan sebagai dataset latih baru (*continuous learning*).

### 3.5. FR-05: Dashboard Operasional & Administrasi
*   **Manajemen Inventaris**: Pengelolaan stok alat dan bahan gigi dengan sistem status dinamis (*Safe*, *Low*, *Out of Stock*) berdasarkan batas aman.
*   **Laporan Keuangan**: Pencatatan otomatis billing harian pasien dari EMR ke riwayat transaksi untuk analisis omzet klinik.
*   **Manajemen Staf & Hak Akses**: Pengaturan peran pengguna (*admin*, *doctor*, *patient*) untuk membatasi akses EMR medis yang sensitif hanya kepada dokter.

### 3.6. FR-06: Galeri Foto Perawatan
*   **Penyimpanan Visual Sebelum/Sesudah (Before/After)**: Kemampuan mengunggah foto perkembangan gigi pasien untuk analisis kosmetik (misal: perawatan ortodonti atau bleaching).

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

### 4.1. Keamanan & Kerahasiaan Data (Security & Privacy)
*   **HIPAA & Regulasi EMR Indonesia**: Data pasien tidak boleh ditransmisikan ke server AI publik pihak ketiga. Seluruh analisis AI wajib dijalankan lokal di intranet klinik.
*   **Hak Akses Terenkripsi**: Hanya user dengan role `doctor` atau `admin` yang dapat mengakses dokumen EMR dan odontogram pasien.

### 4.2. Ketersediaan & Keandalan (Availability & Reliability)
*   **Offline-First Cache**: Aplikasi frontend Next.js harus tetap dapat diakses di lingkungan klinik meskipun terjadi pemadaman koneksi internet eksternal menggunakan sistem penyimpanan cache lokal Firebase/Firestore.
*   **Real-time Synchronization**: Begitu koneksi internet pulih, data antrean dan EMR yang tersimpan lokal otomatis sinkron ke server cloud utama.

### 4.3. Performa (Performance)
*   **AI Inference Time**: Waktu inferensi lokal model AI di bawah 150 milidetik per request agar tidak menghambat waktu konsultasi dokter dengan pasien.
*   **Responsivitas Antarmuka**: Transisi antar halaman monitor antrean dan visual odontogram harus mulus memanfaatkan animasi hardware-accelerated (Framer Motion).
