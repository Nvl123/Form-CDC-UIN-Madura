# Form Kesediaan Pelaksana Kegiatan (Vercel + Google Apps Script)

Proyek formulir kesediaan pelaksana kegiatan **Career Development Center (CDC) Universitas Islam Negeri Madura** yang dideploy di **Vercel** dengan penyimpanan data tetap di **Google Sheets** dan **Google Drive** menggunakan **Google Apps Script** sebagai REST API.

---

## 📌 Informasi Kegiatan

- **Agenda:** Focus Group Discussion (FGD) dengan tema: *“Strategi Peningkatan Partisipasi Alumni dan Pemanfaatan Data untuk Mutu Akademik UIN Madura”*
- **Waktu:** Senin, 16 Nopember 2026 pukul 08.00 WIB s.d. selesai di Lt. 2 Gedung KH. Mohammad Djufri Marzuqi / Rektorat UIN Madura
- **Pemateri:** Noor Saif Muhammad Mussafi, S.Si., M.Sc., Ph.D. (Director of Center for Entrepreneurship and Career Development (CENDI), UIN Sunan Kalijaga Yogyakarta)

---

## 📁 Struktur File

- [`Code.gs`](file:///C:/Users/ASUS/Documents/GitHub/form%20kehadiran/Code.gs): Backend REST API untuk disalin ke Google Apps Script.
- [`index.html`](file:///C:/Users/ASUS/Documents/GitHub/form%20kehadiran/index.html): Tampilan UI formulir yang bersih, responsif, dan ringan untuk Vercel.

---

## 🚀 Panduan Setup & Deploy

### Langkah 1: Pasang Kode di Google Apps Script

1. Buka spreadsheet Google Sheets Anda (yang berisi sheet `MasterPegawai` dan `Form Responses 1`).
2. Klik menu **Extensions** (Ekstensi) > **Apps Script**.
3. Buka file `Code.gs` di editor Apps Script, lalu salin seluruh isi dari file [`Code.gs`](file:///C:/Users/ASUS/Documents/GitHub/form%20kehadiran/Code.gs).
4. Pastikan `SPREADSHEET_ID` dan `FOLDER_ID` sudah sesuai:
   - `SPREADSHEET_ID = "1dKlA_i9AXZrnAN9Dwkh4xfS5CPkRBuipiRS6Bueiba0";`
   - `FOLDER_ID = "14xFCzJLnA-bPusjHbMuxGCZZ4Lj5GRFs";`
5. Klik ikon **Save** (Simpan).

---

### Langkah 2: Deploy Google Apps Script sebagai Web App

1. Di halaman Google Apps Script, klik tombol biru **Deploy** (Terapkan) di pojok kanan atas, lalu pilih **New deployment** (Penerapan baru).
2. Klik ikon gerigi (⚙️) di samping *Select type*, lalu pilih **Web app**.
3. Atur konfigurasi berikut:
   - **Description**: `API Form CDC UIN Madura`
   - **Execute as**: **Me** (*email Google Anda*)
   - **Who has access**: **Anyone** (*Siapa saja*)
     > ⚠️ **PENTING**: Wajib pilih **Anyone** agar form dari domain Vercel dapat mengirim data tanpa login akun Google.
4. Klik **Deploy**.
5. Izinkan akses jika diminta (*Authorize access* > pilih akun Google > *Advanced* > *Go to ... (unsafe)* > *Allow*).
6. Salin **Web app URL** yang muncul (format: `https://script.google.com/macros/s/AKfycb.../exec`).

---

### Langkah 3: Hubungkan Web App URL ke `index.html`

1. Buka file [`index.html`](file:///C:/Users/ASUS/Documents/GitHub/form%20kehadiran/index.html).
2. Cari baris berikut:
   ```javascript
   const SCRIPT_URL = "ISI_DENGAN_WEB_APP_URL_APPS_SCRIPT_ANDA";
   ```
3. Ganti dengan URL yang Anda salin pada Langkah 2, contoh:
   ```javascript
   const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec";
   ```
4. Simpan file `index.html`.

---

### Langkah 4: Deploy ke Vercel

1. Buat git repository dan commit perubahan ini (atau hubungkan folder ini ke GitHub):
   ```bash
   git init
   git add .
   git commit -m "Form CDC UIN Madura siap Vercel"
   ```
2. Buka dashboard [Vercel](https://vercel.com).
3. Klik **Add New Project** > pilih repository GitHub proyek ini.
4. Biarkan pengaturan build default (karena berupa static web `index.html`) lalu klik **Deploy**.
5. Form kesediaan langsung aktif di Vercel dan data otomatis masuk ke Google Sheets & Google Drive!
