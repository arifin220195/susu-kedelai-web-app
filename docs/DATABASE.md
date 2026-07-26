# Database Schema - Google Sheets Structure

## Overview

Database terdiri dari 6 tab utama di 1 Google Spreadsheet. Gunakan **Nomor WhatsApp** sebagai unique identifier untuk pelanggan (Primary Key).

---

## 1. TAB: `Produk`

**Fungsi**: Master data semua produk (susu kedelai + komoditas)

| Kolom | Tipe | Keterangan | Contoh |
|-------|------|-----------|--------|
| SKU | Text | Unique identifier produk | `SKU-001` |
| Nama | Text | Nama produk | `Susu Kedelai Original 1L` |
| Kategori | Text | 'Susu' atau 'Komoditas' | `Susu` |
| Deskripsi | Text | Deskripsi singkat produk | `Susu kedelai original tanpa rasa` |
| Ukuran | Text | Ukuran kemasan | `1 Liter`, `500ml` |
| Harga Beli | Number | Harga modal (internal) | `15000` |
| Harga Jual | Number | Harga retail | `25000` |
| Stok Saat Ini | Number | Jumlah stok real-time | `50` |
| Stok Min | Number | Minimal stok sebelum restock | `10` |
| Gambar URL | Text | Link foto produk (Google Drive/imgur) | `https://...` |
| Status | Text | 'Aktif' atau 'Nonaktif' | `Aktif` |
| Tanggal Upload | Date | Kapan produk ditambahkan | `2026-07-26` |
| Diubah Terakhir | Date | Last modified date | `2026-07-26` |

**Notes:**
- Komoditas ad-hoc akan ditambahkan dengan `Status: Aktif` dan `Kategori: Komoditas`
- Website hanya menampilkan produk dengan `Status: Aktif`
- Kalau `Stok Saat Ini <= 0`, tombol "Beli" berubah jadi "Stok Habis"

---

## 2. TAB: `Pelanggan`

**Fungsi**: Database CRM pelanggan. Primary Key = `No. WhatsApp`

| Kolom | Tipe | Keterangan | Contoh |
|-------|------|-----------|--------|
| Customer ID | Text | Unique ID (auto-generated) | `CUST-08123456789-001` |
| No. WhatsApp | Text | **PRIMARY KEY** | `08123456789` |
| Nama | Text | Nama lengkap pelanggan | `Ana Fitrotunnisa` |
| Email | Text | Email (opsional) | `ana@email.com` |
| Alamat Utama | Text | Alamat pengiriman default | `Jl. Mawar No. 12, Malang` |
| Kota | Text | Kota tujuan | `Malang` |
| Provinsi | Text | Provinsi | `Jawa Timur` |
| Kode Pos | Text | Kode pos | `65111` |
| Total Pembelian | Number | Jumlah transaksi | `5` |
| Total Spending | Number | Total uang yg dihabiskan | `200000` |
| Tanggal Daftar | Date | Kapan customer pertama kali order | `2026-01-15` |
| Last Order | Date | Tanggal order terakhir | `2026-07-20` |
| Status | Text | 'Aktif' atau 'Nonaktif' | `Aktif` |
| Catatan | Text | Catatan admin (allergies, preferences, dll) | `Tidak bisa pedes` |

**Notes:**
- `Customer ID` auto-generated dari No. WA saat registrasi
- `Total Pembelian` dan `Total Spending` auto-update dari tab `Pesanan`
- Untuk analisis repeat order, filter `Total Pembelian >= 5`

---

## 3. TAB: `Pesanan`

**Fungsi**: Jurnal transaksi setiap order. Primary Key = `Order ID`

| Kolom | Tipe | Keterangan | Contoh |
|-------|------|-----------|--------|
| Order ID | Text | **PRIMARY KEY** UUID | `INV-20260726-001` |
| Customer ID | Text | FK ke tab Pelanggan | `CUST-08123456789-001` |
| No. WhatsApp | Text | Backup WA number | `08123456789` |
| Tanggal Order | Date | Tanggal pemesanan | `2026-07-26` |
| Jam Order | Time | Jam pemesanan | `14:30:00` |
| Detail Produk | Text | List produk (JSON format) | `[{"SKU":"SKU-001","Nama":"...","Qty":2,"Harga":25000}]` |
| Jumlah Item | Number | Total qty barang | `2` |
| Subtotal | Number | Total harga barang (blm ongkir) | `50000` |
| Ongkir | Number | Biaya pengiriman | `10000` |
| Total | Number | Subtotal + Ongkir | `60000` |
| Alamat Pengiriman | Text | Alamat kirim (bisa beda dari alamat utama) | `Jl. Mawar No. 12, Malang - Belakang Masjid` |
| Status | Text | 'Pending', 'Lunas', 'Dikirim', 'Selesai', 'Batal' | `Pending` |
| Metode Pembayaran | Text | 'Transfer', 'COD', 'E-wallet' | `Transfer` |
| Catatan Pelanggan | Text | Catatan khusus dari customer | `Mohon dikabarkan tiba jam berapa` |
| Catatan Admin | Text | Catatan admin | `Sudah dikonf, waiting payment proof` |
| Tanggal Update Terakhir | DateTime | Timestamp last update | `2026-07-26 15:45:30` |

**Notes:**
- `Order ID` auto-generated dengan format: `INV-YYYYMMDD-XXXXX`
- `Detail Produk` disimpan sebagai JSON agar mudah di-parse
- Untuk pembukuan: `Subtotal` adalah basis perhitungan Laba/Rugi
- `Status` mengikuti workflow: Pending → Lunas → Dikirim → Selesai

---

## 4. TAB: `Pembayaran`

**Fungsi**: Tracking pembayaran & rekonsiliasi. Primary Key = `Order ID`

| Kolom | Tipe | Keterangan | Contoh |
|-------|------|-----------|--------|
| Order ID | Text | **PRIMARY KEY** FK | `INV-20260726-001` |
| Metode | Text | Cara pembayaran | `Transfer BCA` |
| No. Rekening | Text | Rekening tujuan | `1234567890` |
| Atas Nama | Text | Nama rekening | `PT Susu Kedelai` |
| Status Pembayaran | Text | 'Pending', 'Terverifikasi', 'Gagal' | `Pending` |
| Jumlah Dibayar | Number | Nominal uang masuk | `60000` |
| Bukti Pembayaran | Text | Link bukti screenshot (Google Drive) | `https://drive.google.com/...` |
| Tanggal Pembayaran | DateTime | Kapan uang masuk | `2026-07-26 14:35:00` |
| Tanggal Verifikasi | DateTime | Kapan admin verify | `2026-07-26 14:50:00` |
| Admin Verifier | Text | Siapa yang verify | `Admin Tito` |
| Catatan | Text | Catatan transaksi | `Sesuai invoice` |

**Notes:**
- Satu Order bisa punya banyak record Pembayaran (jika customer bayar di hari berbeda)
- Validasi: `Jumlah Dibayar >= Total Order ID di tab Pesanan`

---

## 5. TAB: `Laporan Harian`

**Fungsi**: Auto-summary penjualan per hari untuk dashboard. Primary Key = `Tanggal`

| Kolom | Tipe | Keterangan | Contoh |
|-------|------|-----------|--------|
| Tanggal | Date | **PRIMARY KEY** | `2026-07-26` |
| Total Order | Number | Jumlah pesanan | `5` |
| Total Revenue | Number | Total uang dari pesanan (Lunas saja) | `300000` |
| Total Pending | Number | Total uang pesanan blm bayar | `50000` |
| Jumlah Item Terjual | Number | Total qty barang | `15` |
| Rata-rata Order Value | Number | Total Revenue / Total Order | `60000` |
| Produk Terlaris | Text | Produk dengan qty tertinggi | `Susu Kedelai Original 1L` |
| Catatan | Text | Catatan khusus hari itu | `Promo spesial hari Jumat` |

**Notes:**
- Kolom ini **auto-populate** dari tab Pesanan menggunakan SUMIF/COUNTIF formula
- Gunakan untuk dashboard chart

---

## 6. TAB: `Config Admin`

**Fungsi**: Konfigurasi & setting website

| Kolom | Tipe | Keterangan | Contoh |
|-------|------|-----------|--------|
| Key | Text | **PRIMARY KEY** | `PROMO_TEXT` |
| Value | Text | Nilai setting | `Flash Sale Susu Cokelat -20%` |

**Contoh Config Items:**

| Key | Value | Keterangan |
|-----|-------|----------|
| `WEBSITE_TITLE` | `Susu Kedelai Erna` | Judul website |
| `WEBSITE_TAGLINE` | `Susu Kedelai Segar Setiap Hari` | Tagline di hero |
| `PROMO_BANNER_TEXT` | `Flash Sale Akhir Pekan!` | Text banner promo |
| `PROMO_BANNER_COLOR` | `#FF6B6B` | Warna banner |
| `PROMO_ACTIVE` | `true` | Apakah promo aktif |
| `WHATSAPP_ADMIN` | `08123456789` | Nomor WA admin penerima order |
| `EMAIL_ADMIN` | `admin@sususnft.com` | Email admin untuk laporan |
| `CURRENCY_SYMBOL` | `Rp ` | Simbol mata uang |
| `DELIVERY_CHARGE_MALANG` | `10000` | Ongkir Malang |
| `DELIVERY_CHARGE_SURABAYA` | `15000` | Ongkir Surabaya |

**Notes:**
- Konfigurasi ini bisa di-edit dari Portal Admin
- Dipanggil oleh GAS saat runtime untuk customization dinamis

---

## 🔐 Data Security & Privacy

1. **Nomor WhatsApp**: Jangan pernah tampilkan di public-facing pages
2. **Detail Pesanan**: Hanya bisa diakses oleh admin & customer pemilik order (via login)
3. **LockService**: Gunakan untuk mencegah race condition saat transaksi bersamaan

---

## 📊 Sample Formulas untuk Analisis

### Total Revenue Bulan Ini
```
=SUMIFS(Pesanan!D:D, Pesanan!C:C, "Lunas", Pesanan!B:B, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))
```

### Top 5 Produk Terlaris
```
=QUERY(Pesanan!A:Z, "SELECT A, SUM(B) WHERE C='Lunas' GROUP BY A ORDER BY SUM(B) DESC LIMIT 5")
```

### Customer Repeat Order (>= 5 kali)
```
=QUERY(Pelanggan!A:G, "SELECT B, C, E WHERE E>=5 ORDER BY E DESC")
```

---

## 🔄 Data Flow

```
1. Customer checkout di website
   ↓
2. Data tersimpan ke tab Pesanan + update Pelanggan
   ↓
3. Pelanggan redirect ke WhatsApp
   ↓
4. Admin terima pesan WA + buka Sheet untuk confirm
   ↓
5. Admin update Status Pesanan → "Lunas" setelah dapat bukti transfer
   ↓
6. Laporan Harian auto-update dari data Pesanan
   ↓
7. Dashboard admin menampilkan grafik real-time
```
