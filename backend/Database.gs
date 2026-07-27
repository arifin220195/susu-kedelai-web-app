// ========================================
// File: Database.gs
// Google Sheets Database Helper Functions
// ========================================

/**
 * Append row ke sheet
 */
function appendRow(sheetName, values) {
  const sheet = getSheet(sheetName);
  if (!sheet) {
    logActivity(`Sheet ${sheetName} not found`);
    return false;
  }
  sheet.appendRow(values);
  return true;
}

/**
 * Update single cell
 */
function updateCell(sheetName, row, col, value) {
  const sheet = getSheet(sheetName);
  if (!sheet) return false;
  sheet.getRange(row, col + 1).setValue(value);
  return true;
}

/**
 * Update entire row
 */
function updateRow(sheetName, rowIndex, values) {
  const sheet = getSheet(sheetName);
  if (!sheet) return false;
  
  const range = sheet.getRange(rowIndex + 1, 1, 1, values.length);
  range.setValues([values]);
  return true;
}

/**
 * Delete row
 */
function deleteRow(sheetName, rowIndex) {
  const sheet = getSheet(sheetName);
  if (!sheet) return false;
  sheet.deleteRow(rowIndex + 1);
  return true;
}

/**
 * Get all products (filter status Aktif)
 */
function getAllActiveProducts() {
  const data = getSheetData(SHEETS.PRODUK);
  const products = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][COLUMNS.PRODUK.STATUS] === "Aktif") {
      products.push({
        sku: data[i][COLUMNS.PRODUK.SKU],
        nama: data[i][COLUMNS.PRODUK.NAMA],
        kategori: data[i][COLUMNS.PRODUK.KATEGORI],
        deskripsi: data[i][COLUMNS.PRODUK.DESKRIPSI],
        ukuran: data[i][COLUMNS.PRODUK.UKURAN],
        hargaJual: data[i][COLUMNS.PRODUK.HARGA_JUAL],
        stok: data[i][COLUMNS.PRODUK.STOK],
        gambar: data[i][COLUMNS.PRODUK.GAMBAR],
        stokHabis: data[i][COLUMNS.PRODUK.STOK] <= 0
      });
    }
  }
  
  return products;
}

/**
 * Get product by SKU
 */
function getProductBySKU(sku) {
  const rowIndex = findRowByColumn(SHEETS.PRODUK, COLUMNS.PRODUK.SKU, sku);
  if (rowIndex === -1) return null;
  
  const data = getSheetData(SHEETS.PRODUK);
  const row = data[rowIndex];
  
  return {
    sku: row[COLUMNS.PRODUK.SKU],
    nama: row[COLUMNS.PRODUK.NAMA],
    kategori: row[COLUMNS.PRODUK.KATEGORI],
    deskripsi: row[COLUMNS.PRODUK.DESKRIPSI],
    ukuran: row[COLUMNS.PRODUK.UKURAN],
    hargaBeli: row[COLUMNS.PRODUK.HARGA_BELI],
    hargaJual: row[COLUMNS.PRODUK.HARGA_JUAL],
    stok: row[COLUMNS.PRODUK.STOK],
    stokMin: row[COLUMNS.PRODUK.STOK_MIN],
    gambar: row[COLUMNS.PRODUK.GAMBAR],
    status: row[COLUMNS.PRODUK.STATUS]
  };
}

/**
 * Update product stock
 */
function updateProductStock(sku, newStock) {
  const rowIndex = findRowByColumn(SHEETS.PRODUK, COLUMNS.PRODUK.SKU, sku);
  if (rowIndex === -1) return false;
  
  updateCell(SHEETS.PRODUK, rowIndex + 1, COLUMNS.PRODUK.STOK, newStock);
  updateCell(SHEETS.PRODUK, rowIndex + 1, COLUMNS.PRODUK.DIUBAH_TERAKHIR, new Date());
  return true;
}

/**
 * Get customer by phone number
 */
function getCustomerByPhone(noWa) {
  const rowIndex = findRowByColumn(SHEETS.PELANGGAN, COLUMNS.PELANGGAN.NO_WA, noWa);
  if (rowIndex === -1) return null;
  
  const data = getSheetData(SHEETS.PELANGGAN);
  const row = data[rowIndex];
  
  return {
    customerID: row[COLUMNS.PELANGGAN.CUSTOMER_ID],
    noWa: row[COLUMNS.PELANGGAN.NO_WA],
    nama: row[COLUMNS.PELANGGAN.NAMA],
    email: row[COLUMNS.PELANGGAN.EMAIL],
    alamat: row[COLUMNS.PELANGGAN.ALAMAT],
    kota: row[COLUMNS.PELANGGAN.KOTA],
    provinsi: row[COLUMNS.PELANGGAN.PROVINSI],
    kodePos: row[COLUMNS.PELANGGAN.KODE_POS],
    totalPembelian: row[COLUMNS.PELANGGAN.TOTAL_PEMBELIAN],
    totalSpending: row[COLUMNS.PELANGGAN.TOTAL_SPENDING],
    lastOrder: row[COLUMNS.PELANGGAN.LAST_ORDER]
  };
}

/**
 * Add new customer
 */
function addNewCustomer(noWa, nama, email, alamat, kota, provinsi, kodePos) {
  const customerID = generateCustomerID(noWa);
  const today = new Date();
  
  const values = [
    customerID,
    noWa,
    nama,
    email,
    alamat,
    kota,
    provinsi,
    kodePos,
    0, // Total Pembelian
    0, // Total Spending
    today,
    "", // Last Order
    "Aktif",
    "" // Catatan
  ];
  
  appendRow(SHEETS.PELANGGAN, values);
  return customerID;
}

/**
 * Update customer data
 */
function updateCustomer(noWa, updateData) {
  const rowIndex = findRowByColumn(SHEETS.PELANGGAN, COLUMNS.PELANGGAN.NO_WA, noWa);
  if (rowIndex === -1) return false;
  
  const data = getSheetData(SHEETS.PELANGGAN);
  const row = data[rowIndex];
  
  // Update specific fields
  if (updateData.nama) row[COLUMNS.PELANGGAN.NAMA] = updateData.nama;
  if (updateData.email) row[COLUMNS.PELANGGAN.EMAIL] = updateData.email;
  if (updateData.alamat) row[COLUMNS.PELANGGAN.ALAMAT] = updateData.alamat;
  if (updateData.kota) row[COLUMNS.PELANGGAN.KOTA] = updateData.kota;
  if (updateData.provinsi) row[COLUMNS.PELANGGAN.PROVINSI] = updateData.provinsi;
  if (updateData.kodePos) row[COLUMNS.PELANGGAN.KODE_POS] = updateData.kodePos;
  if (updateData.totalPembelian !== undefined) row[COLUMNS.PELANGGAN.TOTAL_PEMBELIAN] = updateData.totalPembelian;
  if (updateData.totalSpending !== undefined) row[COLUMNS.PELANGGAN.TOTAL_SPENDING] = updateData.totalSpending;
  if (updateData.lastOrder) row[COLUMNS.PELANGGAN.LAST_ORDER] = updateData.lastOrder;
  
  updateRow(SHEETS.PELANGGAN, rowIndex, row);
  return true;
}

/**
 * Get order by Order ID
 */
function getOrderByID(orderID) {
  const rowIndex = findRowByColumn(SHEETS.PESANAN, COLUMNS.PESANAN.ORDER_ID, orderID);
  if (rowIndex === -1) return null;
  
  const data = getSheetData(SHEETS.PESANAN);
  const row = data[rowIndex];
  
  return {
    orderID: row[COLUMNS.PESANAN.ORDER_ID],
    customerID: row[COLUMNS.PESANAN.CUSTOMER_ID],
    noWa: row[COLUMNS.PESANAN.NO_WA],
    tanggal: row[COLUMNS.PESANAN.TANGGAL],
    jam: row[COLUMNS.PESANAN.JAM],
    detailProduk: row[COLUMNS.PESANAN.DETAIL_PRODUK],
    jumlahItem: row[COLUMNS.PESANAN.JUMLAH_ITEM],
    subtotal: row[COLUMNS.PESANAN.SUBTOTAL],
    ongkir: row[COLUMNS.PESANAN.ONGKIR],
    total: row[COLUMNS.PESANAN.TOTAL],
    alamat: row[COLUMNS.PESANAN.ALAMAT],
    status: row[COLUMNS.PESANAN.STATUS],
    metode: row[COLUMNS.PESANAN.METODE],
    catatanPelanggan: row[COLUMNS.PESANAN.CATATAN_PELANGGAN],
    catatanAdmin: row[COLUMNS.PESANAN.CATATAN_ADMIN],
    updatedAt: row[COLUMNS.PESANAN.UPDATED_AT]
  };
}

/**
 * Add new order
 */
function addNewOrder(orderData) {
  const values = [
    orderData.orderID,
    orderData.customerID,
    orderData.noWa,
    orderData.tanggal,
    orderData.jam,
    orderData.detailProduk,
    orderData.jumlahItem,
    orderData.subtotal,
    orderData.ongkir,
    orderData.total,
    orderData.alamat,
    orderData.status || "Pending",
    orderData.metode || "Transfer",
    orderData.catatanPelanggan || "",
    orderData.catatanAdmin || "",
    getCurrentTimestamp()
  ];
  
  return appendRow(SHEETS.PESANAN, values);
}

/**
 * Update order status
 */
function updateOrderStatus(orderID, newStatus) {
  const rowIndex = findRowByColumn(SHEETS.PESANAN, COLUMNS.PESANAN.ORDER_ID, orderID);
  if (rowIndex === -1) return false;
  
  updateCell(SHEETS.PESANAN, rowIndex + 1, COLUMNS.PESANAN.STATUS, newStatus);
  updateCell(SHEETS.PESANAN, rowIndex + 1, COLUMNS.PESANAN.UPDATED_AT, getCurrentTimestamp());
  return true;
}

/**
 * Get customer orders
 */
function getCustomerOrders(noWa) {
  const data = getSheetData(SHEETS.PESANAN);
  const orders = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][COLUMNS.PESANAN.NO_WA] === noWa) {
      orders.push({
        orderID: data[i][COLUMNS.PESANAN.ORDER_ID],
        tanggal: data[i][COLUMNS.PESANAN.TANGGAL],
        total: data[i][COLUMNS.PESANAN.TOTAL],
        status: data[i][COLUMNS.PESANAN.STATUS]
      });
    }
  }
  
  return orders.reverse(); // Newest first
}
