// ========================================
// File: Customers.gs
// Customer Management & CRM Functions
// ========================================

/**
 * Get list of all customers (for Admin CRM)
 * @returns {Array<Object>} List of customers
 */
function getAllCustomers() {
  try {
    const data = getSheetData(SHEETS.PELANGGAN);
    if (data.length <= 1) return [];

    const customers = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      customers.push({
        customerId: row[COLUMNS.PELANGGAN.CUSTOMER_ID],
        noWa: row[COLUMNS.PELANGGAN.NO_WA],
        nama: row[COLUMNS.PELANGGAN.NAMA],
        email: row[COLUMNS.PELANGGAN.EMAIL],
        alamat: row[COLUMNS.PELANGGAN.ALAMAT],
        kota: row[COLUMNS.PELANGGAN.KOTA],
        provinsi: row[COLUMNS.PELANGGAN.PROVINSI],
        kodePos: row[COLUMNS.PELANGGAN.KODE_POS],
        totalPembelian: Number(row[COLUMNS.PELANGGAN.TOTAL_PEMBELIAN]) || 0,
        totalSpending: Number(row[COLUMNS.PELANGGAN.TOTAL_SPENDING]) || 0,
        tanggalDaftar: row[COLUMNS.PELANGGAN.TANGGAL_DAFTAR],
        lastOrder: row[COLUMNS.PELANGGAN.LAST_ORDER],
        status: row[COLUMNS.PELANGGAN.STATUS],
        catatan: row[COLUMNS.PELANGGAN.CATATAN]
      });
    }

    return customers;
  } catch (e) {
    logActivity("Error in getAllCustomers: " + e.toString());
    return [];
  }
}

/**
 * Get customer by WhatsApp number
 * @param {string} phone
 * @returns {Object|null} Customer object or null
 */
function getCustomerByPhone(phone) {
  try {
    const cleanedPhone = validatePhoneNumber(phone);
    if (!cleanedPhone) return null;

    const data = getSheetData(SHEETS.PELANGGAN);
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][COLUMNS.PELANGGAN.NO_WA]) === cleanedPhone) {
        const row = data[i];
        return {
          customerId: row[COLUMNS.PELANGGAN.CUSTOMER_ID],
          noWa: row[COLUMNS.PELANGGAN.NO_WA],
          nama: row[COLUMNS.PELANGGAN.NAMA],
          email: row[COLUMNS.PELANGGAN.EMAIL],
          alamat: row[COLUMNS.PELANGGAN.ALAMAT],
          kota: row[COLUMNS.PELANGGAN.KOTA],
          provinsi: row[COLUMNS.PELANGGAN.PROVINSI],
          kodePos: row[COLUMNS.PELANGGAN.KODE_POS],
          totalPembelian: Number(row[COLUMNS.PELANGGAN.TOTAL_PEMBELIAN]) || 0,
          totalSpending: Number(row[COLUMNS.PELANGGAN.TOTAL_SPENDING]) || 0,
          tanggalDaftar: row[COLUMNS.PELANGGAN.TANGGAL_DAFTAR],
          lastOrder: row[COLUMNS.PELANGGAN.LAST_ORDER],
          status: row[COLUMNS.PELANGGAN.STATUS],
          catatan: row[COLUMNS.PELANGGAN.CATATAN]
        };
      }
    }
    return null;
  } catch (e) {
    logActivity("Error in getCustomerByPhone: " + e.toString());
    return null;
  }
}

/**
 * Get customer by Customer ID
 * @param {string} customerId
 * @returns {Object|null}
 */
function getCustomerById(customerId) {
  try {
    const data = getSheetData(SHEETS.PELANGGAN);
    for (let i = 1; i < data.length; i++) {
      if (data[i][COLUMNS.PELANGGAN.CUSTOMER_ID] === customerId) {
        const row = data[i];
        return {
          customerId: row[COLUMNS.PELANGGAN.CUSTOMER_ID],
          noWa: row[COLUMNS.PELANGGAN.NO_WA],
          nama: row[COLUMNS.PELANGGAN.NAMA],
          email: row[COLUMNS.PELANGGAN.EMAIL],
          alamat: row[COLUMNS.PELANGGAN.ALAMAT],
          kota: row[COLUMNS.PELANGGAN.KOTA],
          provinsi: row[COLUMNS.PELANGGAN.PROVINSI],
          kodePos: row[COLUMNS.PELANGGAN.KODE_POS],
          totalPembelian: Number(row[COLUMNS.PELANGGAN.TOTAL_PEMBELIAN]) || 0,
          totalSpending: Number(row[COLUMNS.PELANGGAN.TOTAL_SPENDING]) || 0,
          tanggalDaftar: row[COLUMNS.PELANGGAN.TANGGAL_DAFTAR],
          lastOrder: row[COLUMNS.PELANGGAN.LAST_ORDER],
          status: row[COLUMNS.PELANGGAN.STATUS],
          catatan: row[COLUMNS.PELANGGAN.CATATAN]
        };
      }
    }
    return null;
  } catch (e) {
    logActivity("Error in getCustomerById: " + e.toString());
    return null;
  }
}

/**
 * Update customer profile
 * @param {string} phone
 * @param {Object} profileData
 * @returns {Object} Result standard format
 */
function updateCustomerProfile(phone, profileData) {
  try {
    const cleanedPhone = validatePhoneNumber(phone);
    if (!cleanedPhone) {
      return { success: false, message: "Nomor WhatsApp tidak valid" };
    }

    const rowIndex = findRowByColumn(SHEETS.PELANGGAN, COLUMNS.PELANGGAN.NO_WA, cleanedPhone);
    if (rowIndex === -1) {
      return { success: false, message: "Pelanggan tidak ditemukan" };
    }

    const sheet = getSheet(SHEETS.PELANGGAN);
    const sheetRowIndex = rowIndex + 1; // 1-based index in Sheet

    if (profileData.nama !== undefined) {
      sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.NAMA + 1).setValue(profileData.nama);
    }
    if (profileData.email !== undefined) {
      sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.EMAIL + 1).setValue(profileData.email);
    }
    if (profileData.alamat !== undefined) {
      sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.ALAMAT + 1).setValue(profileData.alamat);
    }
    if (profileData.kota !== undefined) {
      sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.KOTA + 1).setValue(profileData.kota);
    }
    if (profileData.provinsi !== undefined) {
      sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.PROVINSI + 1).setValue(profileData.provinsi);
    }
    if (profileData.kodePos !== undefined) {
      sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.KODE_POS + 1).setValue(profileData.kodePos);
    }
    if (profileData.catatan !== undefined) {
      sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.CATATAN + 1).setValue(profileData.catatan);
    }
    if (profileData.status !== undefined) {
      sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.STATUS + 1).setValue(profileData.status);
    }

    return { success: true, message: "Profil pelanggan berhasil diperbarui" };
  } catch (e) {
    logActivity("Error in updateCustomerProfile: " + e.toString());
    return { success: false, message: "Terjadi kesalahan: " + e.toString() };
  }
}

/**
 * Increment total spending & count when an order is completed
 * @param {string} phone
 * @param {number} orderTotal Amount spent
 * @returns {boolean}
 */
function recordCustomerPurchase(phone, orderTotal) {
  try {
    const cleanedPhone = validatePhoneNumber(phone);
    if (!cleanedPhone) return false;

    const rowIndex = findRowByColumn(SHEETS.PELANGGAN, COLUMNS.PELANGGAN.NO_WA, cleanedPhone);
    if (rowIndex === -1) return false;

    const sheet = getSheet(SHEETS.PELANGGAN);
    const sheetRowIndex = rowIndex + 1;

    const currentTotalPembelian = Number(sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.TOTAL_PEMBELIAN + 1).getValue()) || 0;
    const currentTotalSpending = Number(sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.TOTAL_SPENDING + 1).getValue()) || 0;

    sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.TOTAL_PEMBELIAN + 1).setValue(currentTotalPembelian + 1);
    sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.TOTAL_SPENDING + 1).setValue(currentTotalSpending + orderTotal);
    sheet.getRange(sheetRowIndex, COLUMNS.PELANGGAN.LAST_ORDER + 1).setValue(getCurrentTimestamp());

    return true;
  } catch (e) {
    logActivity("Error in recordCustomerPurchase: " + e.toString());
    return false;
  }
}

/**
 * Get top customers by total spending
 * @param {number} limit
 * @returns {Array<Object>}
 */
function getTopCustomers(limit) {
  limit = limit || 10;
  const customers = getAllCustomers();
  return customers
    .sort((a, b) => b.totalSpending - a.totalSpending)
    .slice(0, limit);
}
