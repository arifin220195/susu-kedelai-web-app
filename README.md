# Susu Kedelai Web App

Web application untuk toko online susu kedelai dengan berbagai varian rasa dan kemasan, plus penjualan komoditas add-on.

Dibangun dengan **Google Apps Script** + **Google Sheets** untuk solusi low-cost dan integrated.

## 🎯 Fitur Utama

### Customer Side (Marketplace)
- ✅ Browsing produk susu kedelai dengan berbagai varian
- ✅ Lihat komoditas terbatas (seasonal/limited stock)
- ✅ Registrasi/Login passwordless via WhatsApp
- ✅ Auto-save profil & alamat pengiriman
- ✅ Checkout ke WhatsApp dengan data otomatis terisi
- ✅ Real-time stock status

### Admin Side (Portal Manajemen)
- ✅ Dashboard dengan penjualan harian/mingguan
- ✅ Manajemen produk (CRUD, upload foto)
- ✅ Quick add komoditas ad-hoc
- ✅ Manajemen pesanan & status pengiriman
- ✅ Database pelanggan (CRM)
- ✅ Generate laporan PDF bulanan
- ✅ Analisis repeat order & customer lifetime value

## 🏗️ Architecture

```
Customer Website
       ↓
   Google Apps Script (Backend)
       ↓
   Google Sheets (Database)
       ↓
   WhatsApp API (Checkout)
```

## 📊 Database Schema

Lihat dokumentasi lengkap di: `docs/DATABASE.md`

### Google Sheets Tabs:
1. **Produk** - Master data produk
2. **Pelanggan** - CRM database
3. **Pesanan** - Order transactions
4. **Pembayaran** - Payment tracking
5. **Laporan Harian** - Daily summary
6. **Config Admin** - Website settings

## 🚀 Setup Guide

1. Buka Google Apps Script: https://script.google.com
2. Create new project: `susu-kedelai-web-app`
3. Follow setup guide: `docs/SETUP.md`
4. Deploy sebagai web app

## 📁 Project Structure

```
├── docs/
│   ├── README.md              # Dokumentasi ini
│   ├── SETUP.md               # Setup guide step-by-step
│   ├── DATABASE.md            # Schema & struktur sheets
│   ├── API.md                 # GAS functions documentation
│   └── DEPLOYMENT.md          # Deployment guide
├── config/
│   └── config.gs              # Configuration & Constants
├── backend/
│   ├── Config.gs              # Global config
│   ├── Database.gs            # Sheet operations
│   ├── Auth.gs                # Login/Registrasi
│   ├── Products.gs            # Produk management
│   ├── Orders.gs              # Order processing
│   ├── Customers.gs           # CRM functions
│   ├── Reports.gs             # Report generation
│   └── Utils.gs               # Helper functions
├── frontend/
│   ├── Html.gs                # HTML templates
│   ├── CustomerPortal.html    # Marketplace UI
│   ├── AdminPortal.html       # Admin portal UI
│   └── Styles.gs              # CSS styles
└── main.gs                    # Entry point & doGet
```

## 🔐 Security Notes

- Gunakan LockService untuk prevent race condition
- Data pelanggan tidak dikirim ke public spreadsheet
- WhatsApp links generated server-side
- Admin portal dengan enkripsi basic

## 📈 Roadmap

- [ ] Phase 1: Setup database & auth
- [ ] Phase 2: Product management
- [ ] Phase 3: Order & checkout flow
- [ ] Phase 4: Admin dashboard
- [ ] Phase 5: Reports & analytics
- [ ] Phase 6: Deploy & testing

## 👤 Author

Developed by: @arifin220195

## 📝 License

Private project untuk client.
