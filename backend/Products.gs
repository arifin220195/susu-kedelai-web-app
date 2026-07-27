// ========================================
// File: Products.gs
// Product Management Functions
// ========================================

/**
 * Get all products untuk customer (public)
 * @return {array} Array of active products
 */
function getCustomerProducts() {
  const products = getAllActiveProducts();
  
  // Group by category
  const grouped = {
    susu: [],
    komoditas: []
  };
  
  for (let product of products) {
    if (product.kategori === "Susu") {
      grouped.susu.push(product);
    } else if (product.kategori === "Komoditas") {
      grouped.komoditas.push(product);
    }
  }
  
  // Sort by nama
  grouped.susu.sort((a, b) => a.nama.localeCompare(b.nama));
  grouped.komoditas.sort((a, b) => a.nama.localeCompare(b.nama));
  
  return grouped;
}

/**
 * Get product detail
 * @param {string} sku - Product SKU
 * @return {object} Product detail
 */
function getProductDetail(sku) {
  return getProductBySKU(sku);
}

/**
 * Add product (admin only)
 * @param {object} productData - Product data
 * @return {object} Result object
 */
function addProductAdmin(productData) {
  logActivity(`Add product: ${productData.nama}`);
  
  if (!productData.sku || !productData.nama) {
    return {
      success: false,
      message: "SKU dan Nama produk wajib diisi"
    };
  }
  
  // Check SKU duplicate
  const existing = getProductBySKU(productData.sku);
  if (existing) {
    return {
      success: false,
      message: "SKU sudah digunakan"
    };
  }
  
  const values = [
    productData.sku,
    productData.nama,
    productData.kategori || "Susu",
    productData.deskripsi || "",
    productData.ukuran || "",
    productData.hargaBeli || 0,
    productData.hargaJual || 0,
    productData.stok || 0,
    productData.stokMin || 10,
    productData.gambar || "",
    "Aktif",
    new Date(),
    new Date()
  ];
  
  appendRow(SHEETS.PRODUK, values);
  
  return {
    success: true,
    sku: productData.sku,
    message: "Produk berhasil ditambah"
  };
}

/**
 * Update product (admin only)
 * @param {string} sku - Product SKU
 * @param {object} updateData - Fields to update
 * @return {object} Result object
 */
function updateProductAdmin(sku, updateData) {
  logActivity(`Update product: ${sku}`);
  
  const rowIndex = findRowByColumn(SHEETS.PRODUK, COLUMNS.PRODUK.SKU, sku);
  if (rowIndex === -1) {
    return {
      success: false,
      message: "Produk tidak ditemukan"
    };
  }
  
  const data = getSheetData(SHEETS.PRODUK);
  const row = data[rowIndex];
  
  // Update fields
  if (updateData.nama) row[COLUMNS.PRODUK.NAMA] = updateData.nama;
  if (updateData.kategori) row[COLUMNS.PRODUK.KATEGORI] = updateData.kategori;
  if (updateData.deskripsi) row[COLUMNS.PRODUK.DESKRIPSI] = updateData.deskripsi;
  if (updateData.ukuran) row[COLUMNS.PRODUK.UKURAN] = updateData.ukuran;
  if (updateData.hargaBeli !== undefined) row[COLUMNS.PRODUK.HARGA_BELI] = updateData.hargaBeli;
  if (updateData.hargaJual !== undefined) row[COLUMNS.PRODUK.HARGA_JUAL] = updateData.hargaJual;
  if (updateData.stok !== undefined) row[COLUMNS.PRODUK.STOK] = updateData.stok;
  if (updateData.stokMin !== undefined) row[COLUMNS.PRODUK.STOK_MIN] = updateData.stokMin;
  if (updateData.gambar) row[COLUMNS.PRODUK.GAMBAR] = updateData.gambar;
  if (updateData.status) row[COLUMNS.PRODUK.STATUS] = updateData.status;
  row[COLUMNS.PRODUK.DIUBAH_TERAKHIR] = new Date();
  
  updateRow(SHEETS.PRODUK, rowIndex, row);
  
  return {
    success: true,
    message: "Produk berhasil diupdate"
  };
}

/**
 * Toggle product status
 * @param {string} sku - Product SKU
 * @param {string} status - 'Aktif' or 'Nonaktif'
 * @return {object} Result object
 */
function toggleProductStatus(sku, status) {
  logActivity(`Toggle product status: ${sku} -> ${status}`);
  
  const rowIndex = findRowByColumn(SHEETS.PRODUK, COLUMNS.PRODUK.SKU, sku);
  if (rowIndex === -1) {
    return {
      success: false,
      message: "Produk tidak ditemukan"
    };
  }
  
  updateCell(SHEETS.PRODUK, rowIndex + 1, COLUMNS.PRODUK.STATUS, status);
  updateCell(SHEETS.PRODUK, rowIndex + 1, COLUMNS.PRODUK.DIUBAH_TERAKHIR, new Date());
  
  return {
    success: true,
    message: `Produk berhasil di-${status === 'Aktif' ? 'aktivkan' : 'nonaktifkan'}`
  };
}

/**
 * Get products for admin dashboard
 * @return {array} All products (including inactive)
 */
function getAdminProducts() {
  const data = getSheetData(SHEETS.PRODUK);
  const products = [];
  
  for (let i = 1; i < data.length; i++) {
    products.push({
      sku: data[i][COLUMNS.PRODUK.SKU],
      nama: data[i][COLUMNS.PRODUK.NAMA],
      kategori: data[i][COLUMNS.PRODUK.KATEGORI],
      hargaJual: data[i][COLUMNS.PRODUK.HARGA_JUAL],
      stok: data[i][COLUMNS.PRODUK.STOK],
      status: data[i][COLUMNS.PRODUK.STATUS]
    });
  }
  
  return products;
}
