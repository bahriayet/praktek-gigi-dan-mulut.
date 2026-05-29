# 📸 Panduan Cepat Git (Mesin Waktu Programmer)

Dokumen ini adalah ringkasan perintah (mantra) Git untuk keperluan sehari-hari saat Anda mengedit proyek Klinik Gigi ini. Buka file ini jika Anda lupa perintahnya.

---

## 1. Rutinitas Sehari-hari (Menyimpan Pekerjaan)
Lakukan dua perintah ini setiap kali Anda **selesai mengedit kode** dan ingin menyimpan hasilnya secara permanen.

**Langkah A: Siapkan kamera**
Ketik perintah ini di terminal (jangan lupa spasi dan tanda titik):
```bash
git add .
```
*(Artinya: Memasukkan semua file yang baru saja diedit ke dalam bingkai kamera).*

**Langkah B: Jepret & Simpan!**
Ketik perintah ini di terminal:
```bash
git commit -m "Catatan atau pesan Anda di sini"
```
*(Artinya: Menyimpan foto tersebut ke dalam mesin waktu. Ubah teks di dalam tanda kutip dengan apa yang baru saja Anda kerjakan, misal: "selesai bikin tombol biru").*

---

## 2. Jika Terjadi Bencana (Mengembalikan Waktu)
Gunakan perintah ini **HANYA JIKA** Anda mengacaukan kodingan, web menjadi *error*, dan Anda ingin membatalkan semua perubahan hari ini untuk kembali ke kondisi foto (`commit`) terakhir kali yang masih sehat.

**Langkah Darurat:**
Ketik perintah ini di terminal:
```bash
git restore .
```
*(Artinya: Batalkan semua ketikan dan editan saya yang belum difoto (belum di-commit), dan kembalikan semua file persis seperti kondisi foto terakhir).*

---

### 💡 Tips Tambahan: Arti Warna File di VS Code
*   🟢 **Hijau (U)**: File baru yang belum pernah difoto oleh Git.
*   🟡 **Kuning/Oranye (M)**: File lama yang baru saja Anda edit tapi belum difoto ulang.
*   ⚪ **Warna Normal/Putih**: File sudah aman terfoto di dalam mesin waktu.
