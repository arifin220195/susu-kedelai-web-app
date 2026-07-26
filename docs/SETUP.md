# Setup Guide - Susu Kedelai Web App

## Prerequisites

- Google Account (untuk Apps Script & Google Sheets)
- WhatsApp Business Account (opsional, untuk integrasi lanjutan)
- Text editor atau IDE (VSCode recommended)

---

## Step 1: Setup Google Sheets (Database)

### 1.1 Buat Google Spreadsheet

1. Buka https://sheets.google.com
2. Click **+ Blank** untuk membuat spreadsheet baru
3. Rename menjadi: `Susu Kedelai Database`
4. Copy Spreadsheet ID dari URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
   Simpan `SPREADSHEET_ID` ini, nanti dipakai di config GAS.

### 1.2 Buat Tab-Tab Sheet

Rename tab default "Sheet1" dan buat 6 tab dengan nama:

1. `Produk`
2. `Pelanggan`
3. `Pesanan`
4. `Pembayaran`
5. `Laporan Harian`
6. `Config Admin`

Gunakan header sesuai `docs/DATABASE.md` untuk setiap tab.

### 1.3 Setup Header Row

**Tab: Produk**
```
SKU | Nama | Kategori | Deskripsi | Ukuran | Harga Beli | Harga Jual | Stok Saat Ini | Stok Min | Gambar URL | Status | Tanggal Upload | Diubah Terakhir
```

**Tab: Pelanggan**
```
Customer ID | No. WhatsApp | Nama | Email | Alamat Utama | Kota | Provinsi | Kode Pos | Total Pembelian | Total Spending | Tanggal Daftar | Last Order | Status | Catatan
```

**Tab: Pesanan**
```
Order ID | Customer ID | No. WhatsApp | Tanggal Order | Jam Order | Detail Produk | Jumlah Item | Subtotal | Ongkir | Total | Alamat Pengiriman | Status | Metode Pembayaran | Catatan Pelanggan | Catatan Admin | Tanggal Update Terakhir
```

**Tab: Pembayaran**
```
Order ID | Metode | No. Rekening | Atas Nama | Status Pembayaran | Jumlah Dibayar | Bukti Pembayaran | Tanggal Pembayaran | Tanggal Verifikasi | Admin Verifier | Catatan
```

**Tab: Laporan Harian**
```
Tanggal | Total Order | Total Revenue | Total Pending | Jumlah Item Terjual | Rata-rata Order Value | Produk Terlaris | Catatan
```

**Tab: Config Admin**
```
Key | Value
```

### 1.4 Tambah Sample Data

**Tab: Produk** - Tambah 3 produk sample:

| SKU | Nama | Kategori | Deskripsi | Ukuran | Harga Beli | Harga Jual | Stok Saat Ini | Stok Min | Gambar URL | Status | Tanggal Upload | Diubah Terakhir |
|-----|------|----------|-----------|--------|-----------|-----------|---|---|---|---|---|---|
| SKU-001 | Susu Kedelai Original | Susu | Susu kedelai original tanpa rasa | 1 Liter | 15000 | 25000 | 50 | 10 | https://via.placeholder.com/300?text=Susu+Original | Aktif | 2026-07-26 | 2026-07-26 |
| SKU-002 | Susu Kedelai Cokelat | Susu | Susu kedelai dengan rasa cokelat | 1 Liter | 16000 | 28000 | 30 | 10 | https://via.placeholder.com/300?text=Susu+Cokelat | Aktif | 2026-07-26 | 2026-07-26 |
| SKU-003 | Susu Kedelai Matcha | Susu | Susu kedelai dengan rasa matcha premium | 500ml | 12000 | 22000 | 25 | 5 | https://via.placeholder.com/300?text=Susu+Matcha | Aktif | 2026-07-26 | 2026-07-26 |

**Tab: Config Admin** - Tambah config:

| Key | Value |
|-----|-------|
| WEBSITE_TITLE | Susu Kedelai Erna |
| WEBSITE_TAGLINE | Susu Kedelai Segar Setiap Hari |
| WHATSAPP_ADMIN | 08123456789 |
| EMAIL_ADMIN | admin@susukedelai.com |
| CURRENCY_SYMBOL | Rp  |
| DELIVERY_CHARGE_MALANG | 10000 |
| DELIVERY_CHARGE_SURABAYA | 15000 |
| PROMO_ACTIVE | true |
| PROMO_BANNER_TEXT | Flash Sale Akhir Pekan! |
| PROMO_BANNER_COLOR | #FF6B6B |

---

## Step 2: Setup Google Apps Script Project

### 2.1 Buat Script Project Baru

1. Buka https://script.google.com
2. Click **Create new project** atau **+ New project**
3. Rename project menjadi: `Susu Kedelai Web App`
4. Copy Script ID dari URL tab Settings:
   ```
   Project ID (atau Script ID): xxx...
   ```

### 2.2 Link ke Google Sheets

Di editor GAS, buka file `main.gs` dan tambahkan:

```javascript
// Spreadsheet ID dari database
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
```

Replace `YOUR_SPREADSHEET_ID_HERE` dengan ID dari Step 1.1.

### 2.3 Tambah Google Sheets Library (Library)

1. Di GAS editor, klik **Libraries** (icon di samping)
2. Paste library ID untuk Sheets API (jika diperlukan)
3. Atau langsung gunakan built-in SpreadsheetApp object

---

## Step 3: Create GAS Files (Backend Code)

Di Google Apps Script editor, buat file-file baru:

### 3.1 Create `Config.gs`

```javascript
// File: Config.gs
// Global configuration

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

// Sheet names
const SHEETS = {
  PRODUK: "Produk",
  PELANGGAN: "Pelanggan",
  PESANAN: "Pesanan",
  PEMBAYARAN: "Pembayaran",
  LAPORAN: "Laporan Harian",
  CONFIG: "Config Admin"
};

// Column indices (0-based)
const COLUMNS = {
  PRODUK: {
    SKU: 0, NAMA: 1, KATEGORI: 2, DESKRIPSI: 3, UKURAN: 4,
    HARGA_BELI: 5, HARGA_JUAL: 6, STOK: 7, STOK_MIN: 8,
    GAMBAR: 9, STATUS: 10, TANGGAL_UPLOAD: 11, DIUBAH_TERAKHIR: 12
  },
  PELANGGAN: {
    CUSTOMER_ID: 0, NO_WA: 1, NAMA: 2, EMAIL: 3, ALAMAT: 4,
    KOTA: 5, PROVINSI: 6, KODE_POS: 7, TOTAL_PEMBELIAN: 8,
    TOTAL_SPENDING: 9, TANGGAL_DAFTAR: 10, LAST_ORDER: 11, STATUS: 12, CATATAN: 13
  },
  PESANAN: {
    ORDER_ID: 0, CUSTOMER_ID: 1, NO_WA: 2, TANGGAL: 3, JAM: 4,
    DETAIL_PRODUK: 5, JUMLAH_ITEM: 6, SUBTOTAL: 7, ONGKIR: 8,
    TOTAL: 9, ALAMAT: 10, STATUS: 11, METODE: 12,
    CATATAN_PELANGGAN: 13, CATATAN_ADMIN: 14, UPDATED_AT: 15
  }
};

// Utility: Get config value
function getConfig(key) {
  const sheet = ss.getSheetByName(SHEETS.CONFIG);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}

// Utility: Generate UUID
function generateUUID() {
  return Utilities.getUuid();
}

// Utility: Generate Order ID
function generateOrderID() {
  const date = new Date();
  const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyyMMdd");
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `INV-${dateStr}-${random}`;
}
```

### 3.2 Lanjutkan file lainnya

I'll create a structured approach. Lanjutkan dengan file-file berikut.

---

## Step 4: Deploy sebagai Web App

### 4.1 Deploy

1. Di GAS editor, klik **Deploy** → **New deployment**
2. Pilih tipe: **Web app**
3. Execute as: **Your Account**
4. Who has access: **Anyone** (untuk public marketplace) atau **Specific people** (untuk admin)
5. Click **Deploy**
6. Copy URL deployment: `https://script.google.com/macros/d/{DEPLOYMENT_ID}/userweb`

### 4.2 Test

Buka URL di browser dan lihat marketplace muncul.

---

## Step 5: Create Frontend (HTML/CSS/JavaScript)

Lihat dokumentasi lengkap di: `docs/FRONTEND.md`

---

## ✅ Checklist Setup

- [ ] Google Sheets dibuat dengan 6 tab
- [ ] Header row sudah di-setup
- [ ] Sample data sudah ditambah (terutama Produk & Config)
- [ ] GAS project dibuat
- [ ] `Config.gs` dengan SPREADSHEET_ID sudah di-link
- [ ] Backend files sudah di-buat
- [ ] Frontend HTML sudah di-setup
- [ ] Deploy sebagai Web App
- [ ] Test di browser

---

## 🆘 Troubleshooting

### Error: "SpreadsheetApp.openById() returned null"
→ Cek `SPREADSHEET_ID` di `Config.gs` sudah benar

### Error: "Cannot read properties of undefined"
→ Cek sheet name di `SHEETS` object sudah match dengan nama tab di Sheets

### WhatsApp link tidak berfungsi
→ Pastikan nomor admin di Config sudah benar dan format internasional (62...)

---

## 📞 Next Steps

Setelah setup berhasil, lanjutkan ke:
1. `docs/FRONTEND.md` - Setup UI marketplace & admin portal
2. `docs/API.md` - Dokumentasi GAS functions
3. Testing & debugging
