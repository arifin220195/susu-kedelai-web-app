// ========================================
// File: Config.gs
// Global Configuration & Constants
// ========================================

// DATABASE CONFIGURATION
const SPREADSHEET_ID = "10Yd8bC4NbKXy2Qk8Csplhz8LEBPXDN60-cbpn-mXIf8";
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

// SHEET NAMES
const SHEETS = {
  PRODUK: "Produk",
  PELANGGAN: "Pelanggan",
  PESANAN: "Pesanan",
  PEMBAYARAN: "Pembayaran",
  LAPORAN: "Laporan Harian",
  CONFIG: "Config Admin"
};

// COLUMN INDICES (0-based)
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
  },
  PEMBAYARAN: {
    ORDER_ID: 0, METODE: 1, NO_REKENING: 2, ATAS_NAMA: 3,
    STATUS: 4, JUMLAH_DIBAYAR: 5, BUKTI: 6, TANGGAL_BAYAR: 7,
    TANGGAL_VERIFIKASI: 8, ADMIN_VERIFIER: 9, CATATAN: 10
  }
};

// ADMIN CREDENTIALS
const ADMIN_PASSWORD = "admin123"; // Change this!

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get config value dari Config Admin sheet
 */
function getConfig(key) {
  try {
    const sheet = ss.getSheetByName(SHEETS.CONFIG);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) return data[i][1];
    }
  } catch (e) {
    Logger.log("Error getting config: " + e.toString());
  }
  return null;
}

/**
 * Generate unique Order ID
 * Format: INV-YYYYMMDD-XXXXX
 */
function generateOrderID() {
  const date = new Date();
  const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyyMMdd");
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `INV-${dateStr}-${random}`;
}

/**
 * Generate Customer ID dari No WA
 * Format: CUST-{noWa}-{timestamp}
 */
function generateCustomerID(noWa) {
  return `CUST-${noWa}-${new Date().getTime()}`;
}

/**
 * Generate session token (simple base64 encoding)
 */
function generateSessionToken(noWa) {
  const timestamp = new Date().getTime();
  const data = `${noWa}-${timestamp}`;
  return Utilities.base64Encode(data);
}

/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount) {
  const symbol = getConfig("CURRENCY_SYMBOL") || "Rp ";
  return symbol + amount.toLocaleString('id-ID');
}

/**
 * Format date to Indonesian format
 */
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('id-ID', options);
}

/**
 * Validate WhatsApp number (returns cleaned format or null if invalid)
 */
function validatePhoneNumber(phone) {
  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, '');
  
  // Convert 0 to 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  // Must start with 62
  if (!cleaned.startsWith('62')) {
    return null;
  }
  
  // Check length (62 + 9-12 digits = 11-14 chars total)
  if (cleaned.length < 11 || cleaned.length > 14) {
    return null;
  }
  
  return cleaned;
}

/**
 * Get current timestamp ISO format
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Log activity untuk debugging
 */
function logActivity(message) {
  Logger.log(`[${getCurrentTimestamp()}] ${message}`);
}

/**
 * Get sheet object by name
 */
function getSheet(sheetName) {
  return ss.getSheetByName(sheetName);
}

/**
 * Get all data from sheet (dengan header)
 */
function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  return sheet ? sheet.getDataRange().getValues() : [];
}

/**
 * Find row index by column value
 */
function findRowByColumn(sheetName, columnIndex, value) {
  const data = getSheetData(sheetName);
  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndex] === value) {
      return i; // Return 0-based index
    }
  }
  return -1;
}
