// ========================================
// File: Reports.gs
// Analytics, Dashboard Summary & Reports
// ========================================

/**
 * Get summary stats for Admin Dashboard
 * @returns {Object} Key metrics
 */
function getDashboardSummary() {
  try {
    const orders = getAllOrders ? getAllOrders() : [];
    const customers = getAllCustomers ? getAllCustomers() : [];
    const products = getAllProducts ? getAllProducts() : [];

    let totalRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    orders.forEach(order => {
      if (order.status === "SELESAI" || order.status === "DIKIRIM" || order.status === "DIPROSES") {
        totalRevenue += (Number(order.total) || 0);
      }
      if (order.status === "BARU" || order.status === "DIPROSES") {
        pendingOrders++;
      }
      if (order.status === "SELESAI") {
        completedOrders++;
      }
      if (order.status === "BATAL") {
        cancelledOrders++;
      }
    });

    const lowStockProducts = products.filter(p => p.stok <= p.stokMin);

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue,
        totalOrders: orders.length,
        pendingOrders: pendingOrders,
        completedOrders: completedOrders,
        cancelledOrders: cancelledOrders,
        totalCustomers: customers.length,
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.map(p => ({ sku: p.sku, nama: p.nama, stok: p.stok, stokMin: p.stokMin }))
      }
    };
  } catch (e) {
    logActivity("Error in getDashboardSummary: " + e.toString());
    return { success: false, message: e.toString() };
  }
}

/**
 * Get sales summary broken down by date
 * @param {string} startDate ISO date string (YYYY-MM-DD)
 * @param {string} endDate ISO date string (YYYY-MM-DD)
 * @returns {Array<Object>} Daily sales data
 */
function getDailySalesReport(startDate, endDate) {
  try {
    const orders = getAllOrders ? getAllOrders() : [];
    const salesByDate = {};

    orders.forEach(order => {
      if (order.status === "BATAL") return;
      const orderDate = order.tanggal ? order.tanggal.split('T')[0] : '';
      if (!orderDate) return;

      if (startDate && orderDate < startDate) return;
      if (endDate && orderDate > endDate) return;

      if (!salesByDate[orderDate]) {
        salesByDate[orderDate] = {
          tanggal: orderDate,
          totalPesanan: 0,
          totalOmset: 0,
          totalItem: 0
        };
      }

      salesByDate[orderDate].totalPesanan += 1;
      salesByDate[orderDate].totalOmset += (Number(order.total) || 0);
      salesByDate[orderDate].totalItem += (Number(order.jumlahItem) || 0);
    });

    const result = Object.values(salesByDate).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    return { success: true, data: result };
  } catch (e) {
    logActivity("Error in getDailySalesReport: " + e.toString());
    return { success: false, message: e.toString() };
  }
}

/**
 * Get best selling products
 * @param {number} limit
 * @returns {Array<Object>}
 */
function getBestSellingProducts(limit) {
  limit = limit || 5;
  try {
    const orders = getAllOrders ? getAllOrders() : [];
    const productStats = {};

    orders.forEach(order => {
      if (order.status === "BATAL") return;
      let detail = order.detailProduk;
      if (typeof detail === "string") {
        try {
          detail = JSON.parse(detail);
        } catch (err) {
          detail = [];
        }
      }

      if (Array.isArray(detail)) {
        detail.forEach(item => {
          const sku = item.sku || item.nama;
          if (!productStats[sku]) {
            productStats[sku] = {
              sku: item.sku || "-",
              nama: item.nama || "Unknown Product",
              totalQty: 0,
              totalRevenue: 0
            };
          }
          productStats[sku].totalQty += (Number(item.qty) || 0);
          productStats[sku].totalRevenue += ((Number(item.qty) || 0) * (Number(item.harga) || 0));
        });
      }
    });

    const sorted = Object.values(productStats)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, limit);

    return { success: true, data: sorted };
  } catch (e) {
    logActivity("Error in getBestSellingProducts: " + e.toString());
    return { success: false, message: e.toString() };
  }
}

/**
 * Automated trigger to record daily summary in "Laporan Harian" sheet
 */
function recordDailySummarySheet() {
  try {
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const summary = getDailySalesReport(today, today);
    if (!summary.success || summary.data.length === 0) return;

    const dataToday = summary.data[0];
    const sheet = getSheet(SHEETS.LAPORAN);
    if (!sheet) return;

    // Check if row for today exists
    const rowIdx = findRowByColumn(SHEETS.LAPORAN, 0, today);
    if (rowIdx !== -1) {
      sheet.getRange(rowIdx + 1, 2).setValue(dataToday.totalPesanan);
      sheet.getRange(rowIdx + 1, 3).setValue(dataToday.totalOmset);
      sheet.getRange(rowIdx + 1, 4).setValue(dataToday.totalItem);
    } else {
      sheet.appendRow([today, dataToday.totalPesanan, dataToday.totalOmset, dataToday.totalItem]);
    }
  } catch (e) {
    logActivity("Error in recordDailySummarySheet: " + e.toString());
  }
}
