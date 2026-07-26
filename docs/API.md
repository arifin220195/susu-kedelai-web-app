# API Documentation - Google Apps Script Functions

Dokumentasi lengkap semua GAS functions yang akan di-buat untuk backend.

## Backend Functions Overview

```
📦 Auth Module
├── registerCustomer(name, phone, address)
├── loginCustomer(phone)
└── validateSession(sessionToken)

📦 Products Module
├── getAllProducts()
├── getProductByID(sku)
├── addProduct(data)
├── updateProduct(sku, data)
├── deleteProduct(sku)
└── getProductsByCategory(category)

📦 Orders Module
├── createOrder(customerData, cartItems, deliveryAddress)
├── getOrdersByCustomer(noWa)
├── updateOrderStatus(orderId, status)
├── getOrderDetails(orderId)
└── cancelOrder(orderId)

📦 Customers Module
├── addCustomer(noWa, name, address)
├── updateCustomer(noWa, data)
├── getCustomerByPhone(noWa)
├── getRepeatCustomers(minOrders)
└── getCustomerStats()

📦 Reports Module
├── getDailySales(date)
├── getWeeklySales(startDate, endDate)
├── getMonthlySales(month, year)
├── generatePDFReport(month, year)
└── getTopProducts(limit)

📦 Payment Module
├── recordPayment(orderId, amount, method, proofUrl)
├── verifyPayment(orderId)
└── getPaymentStatus(orderId)
```

## Detailed Function Documentation

### Auth Module

#### `registerCustomer(name, phone, address)`
**Fungsi**: Register pelanggan baru ke database

**Parameter**:
- `name` (String): Nama lengkap pelanggan
- `phone` (String): Nomor WhatsApp (format: 08xxxxx atau 62xxxxx)
- `address` (String): Alamat pengiriman lengkap

**Return**: 
```javascript
{
  success: true,
  customerID: "CUST-08123456789-001",
  message: "Registrasi berhasil",
  sessionToken: "token_hash_xxx"
}
```

**Error Cases**:
- `phone` sudah terdaftar → Return `{success: false, message: "Nomor sudah terdaftar"}`
- Invalid format → Return `{success: false, message: "Format nomor tidak valid"}`

**Implementation Notes**:
- Gunakan LockService untuk mencegah double registration
- Generate `Customer ID` dari no WA + timestamp
- Simpan session token di localStorage (client-side)

---

#### `loginCustomer(phone)`
**Fungsi**: Login customer yang sudah terdaftar

**Parameter**:
- `phone` (String): Nomor WhatsApp

**Return**:
```javascript
{
  success: true,
  customerID: "CUST-08123456789-001",
  name: "Ana Fitrotunnisa",
  address: "Jl. Mawar No. 12, Malang",
  sessionToken: "token_hash_xxx"
}
```

**Error Cases**:
- Nomor tidak terdaftar → `{success: false, message: "Nomor belum terdaftar"}`

---

#### `validateSession(sessionToken)`
**Fungsi**: Validasi session token (untuk security)

**Parameter**:
- `sessionToken` (String): Token dari localStorage

**Return**: `{valid: true/false, customerID: "..."}`

---

### Products Module

#### `getAllProducts()`
**Fungsi**: Ambil semua produk aktif untuk ditampilkan di marketplace

**Return**:
```javascript
[
  {
    sku: "SKU-001",
    nama: "Susu Kedelai Original 1L",
    kategori: "Susu",
    hargaJual: 25000,
    stok: 50,
    gambar: "https://...",
    stokHabis: false
  },
  // ... lebih banyak
]
```

**Notes**:
- Hanya return produk dengan `Status = Aktif`
- Pisahkan kategori "Susu" dan "Komoditas" di UI
- Sort by kategori, then by nama

---

#### `getProductByID(sku)`
**Fungsi**: Ambil detail satu produk

**Parameter**:
- `sku` (String): Unique product identifier

**Return**: Object produk lengkap atau `null` jika tidak ada

---

#### `addProduct(data)`
**Fungsi**: Tambah produk baru (admin only)

**Parameter**:
```javascript
{
  sku: "SKU-004",
  nama: "Produk Baru",
  kategori: "Komoditas",
  hargaBeli: 50000,
  hargaJual: 75000,
  stok: 20,
  gambar: "https://...",
  // ... fields lainnya
}
```

**Return**: `{success: true, sku: "SKU-004"}`

---

#### `updateProduct(sku, data)`
**Fungsi**: Update produk yang sudah ada

**Parameter**:
- `sku` (String): Produk yang mau di-update
- `data` (Object): Field yang mau diubah

**Return**: `{success: true, message: "Update berhasil"}`

---

### Orders Module

#### `createOrder(customerData, cartItems, deliveryAddress)`
**Fungsi**: Create pesanan baru (main checkout function)

**Parameter**:
```javascript
customerData = {
  noWa: "08123456789",
  nama: "Ana",
  email: "ana@email.com"
};

cartItems = [
  { sku: "SKU-001", nama: "Susu Kedelai Original", qty: 2, harga: 25000 },
  { sku: "SKU-002", nama: "Susu Kedelai Cokelat", qty: 1, harga: 28000 }
];

deliveryAddress = "Jl. Mawar No. 12, Malang - Belakang Masjid";
```

**Return**:
```javascript
{
  success: true,
  orderId: "INV-20260726-00123",
  total: 78000,
  whatsappMessage: "Halo Kak, saya mau..."
}
```

**Process**:
1. Validate customer (create jika baru)
2. Generate Order ID
3. Validate stok setiap item
4. Lock database (LockService)
5. Simpan ke tab Pesanan
6. Update stok di tab Produk
7. Update Pelanggan (Total Pembelian, Last Order)
8. Unlock database
9. Generate WhatsApp message
10. Return response

**Error Cases**:
- Stok tidak cukup → `{success: false, message: "Stok produk X tidak cukup"}`

---

#### `getOrdersByCustomer(noWa)`
**Fungsi**: Ambil semua pesanan customer (untuk order history)

**Return**: Array of orders sorted by tanggal desc

---

#### `updateOrderStatus(orderId, status)`
**Fungsi**: Update status pesanan (admin only)

**Parameter**:
- `orderId` (String): Order ID
- `status` (String): 'Pending', 'Lunas', 'Dikirim', 'Selesai', 'Batal'

**Return**: `{success: true, message: "Status update berhasil"}`

---

### Reports Module

#### `getDailySales(date)`
**Fungsi**: Ambil summary penjualan satu hari

**Parameter**:
- `date` (Date): Tanggal yang dicari

**Return**:
```javascript
{
  tanggal: "2026-07-26",
  totalOrder: 5,
  totalRevenue: 300000,
  totalPending: 50000,
  jumlahItem: 15,
  rataRataOrder: 60000
}
```

---

#### `generatePDFReport(month, year)`
**Fungsi**: Generate laporan PDF bulanan (admin)

**Parameter**:
- `month` (Number): 1-12
- `year` (Number): 2026

**Return**: URL download PDF

---

## Frontend Integration (Google.script.run)

Untuk call function dari HTML/JavaScript:

```javascript
// Example: Register customer
google.script.run
  .withSuccessHandler((result) => {
    console.log(result);
    // Handle success
  })
  .withFailureHandler((error) => {
    console.error(error);
    // Handle error
  })
  .registerCustomer(name, phone, address);
```

---

## Security Considerations

1. **Input Validation**: Selalu validate input sebelum save ke Sheets
2. **LockService**: Gunakan untuk critical sections (update stok, create order)
3. **Session Management**: Token based, expire setelah N jam
4. **Admin Functions**: Check user role sebelum execute (future enhancement)

---

## Changelog

**v0.1** - Initial API design
