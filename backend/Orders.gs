// ========================================
// File: Orders.gs
// Order & Checkout Management
// ========================================

/**
 * Create new order (main checkout function)
 * @param {object} customerData - Customer info
 * @param {array} cartItems - Array of items in cart
 * @param {string} deliveryAddress - Delivery address
 * @return {object} Result object dengan order details
 */
function createOrder(customerData, cartItems, deliveryAddress) {
  logActivity(`Create order for: ${customerData.nama}`);
  
  // Validate input
  if (!customerData.noWa || !customerData.nama || !cartItems || cartItems.length === 0 || !deliveryAddress) {
    return {
      success: false,
      message: "Data order tidak lengkap"
    };
  }
  
  // Validate phone
  const validatedPhone = validatePhoneNumber(customerData.noWa);
  if (!validatedPhone) {
    return {
      success: false,
      message: "Nomor WhatsApp tidak valid"
    };
  }
  
  // Lock service
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    // Check & validate stock for all items
    let totalSubtotal = 0;
    let totalQuantity = 0;
    const detailProduk = [];
    
    for (let item of cartItems) {
      const product = getProductBySKU(item.sku);
      if (!product) {
        return {
          success: false,
          message: `Produk ${item.sku} tidak ditemukan`
        };
      }
      
      if (product.stok < item.qty) {
        return {
          success: false,
          message: `Stok ${product.nama} tidak cukup. Tersedia: ${product.stok}`
        };
      }
      
      const itemTotal = product.hargaJual * item.qty;
      totalSubtotal += itemTotal;
      totalQuantity += item.qty;
      
      detailProduk.push({
        sku: item.sku,
        nama: product.nama,
        qty: item.qty,
        harga: product.hargaJual,
        subtotal: itemTotal
      });
    }
    
    // Generate Order ID
    const orderID = generateOrderID();
    
    // Get or create customer
    let customer = getCustomerByPhone(validatedPhone);
    let customerID;
    
    if (!customer) {
      // Create new customer
      const addressParts = deliveryAddress.split(",");
      const kota = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : "";
      const provinsi = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : "";
      
      customerID = addNewCustomer(
        validatedPhone,
        customerData.nama,
        customerData.email || "",
        deliveryAddress,
        kota,
        provinsi,
        ""
      );
    } else {
      customerID = customer.customerID;
    }
    
    // Calculate ongkir (simplified - bisa dikustomisasi)
    let ongkir = 0;
    // TODO: Implement delivery charge calculation based on area
    
    const total = totalSubtotal + ongkir;
    const now = new Date();
    const tanggal = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd");
    const jam = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm:ss");
    
    // Add order to Pesanan sheet
    const orderData = {
      orderID: orderID,
      customerID: customerID,
      noWa: validatedPhone,
      tanggal: tanggal,
      jam: jam,
      detailProduk: JSON.stringify(detailProduk),
      jumlahItem: totalQuantity,
      subtotal: totalSubtotal,
      ongkir: ongkir,
      total: total,
      alamat: deliveryAddress,
      status: "Pending",
      metode: "Transfer",
      catatanPelanggan: customerData.catatan || "",
      catatanAdmin: ""
    };
    
    addNewOrder(orderData);
    
    // Update product stock
    for (let item of cartItems) {
      const product = getProductBySKU(item.sku);
      const newStock = product.stok - item.qty;
      updateProductStock(item.sku, newStock);
    }
    
    // Update customer stats
    if (customer) {
      updateCustomer(validatedPhone, {
        totalPembelian: customer.totalPembelian + 1,
        totalSpending: customer.totalSpending + total,
        lastOrder: tanggal
      });
    }
    
    // Generate WhatsApp message
    const waMessage = generateWhatsAppMessage(orderID, customerData.nama, detailProduk, total, deliveryAddress);
    
    logActivity(`Order created: ${orderID}`);
    
    return {
      success: true,
      orderID: orderID,
      total: total,
      subtotal: totalSubtotal,
      ongkir: ongkir,
      whatsappMessage: waMessage,
      adminPhone: getConfig("WHATSAPP_ADMIN")
    };
  } catch (e) {
    logActivity(`Create order error: ${e.toString()}`);
    return {
      success: false,
      message: "Terjadi kesalahan: " + e.toString()
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Generate WhatsApp message untuk checkout
 */
function generateWhatsAppMessage(orderID, nama, detailProduk, total, alamat) {
  let message = `Halo Admin, saya ingin konfirmasi pesanan dari Website:\n\n`;
  message += `📋 *ORDER ID: ${orderID}*\n`;
  message += `----------------------------------\n`;
  message += `👤 *Nama:* ${nama}\n`;
  message += `📍 *Alamat:* ${alamat}\n\n`;
  message += `🛒 *Detail Pesanan:*\n`;
  
  for (let item of detailProduk) {
    message += `- ${item.nama} x${item.qty} = ${formatCurrency(item.subtotal)}\n`;
  }
  
  message += `----------------------------------\n`;
  message += `💰 *Total:* ${formatCurrency(total)}\n`;
  message += `(Belum termasuk ongkir)\n\n`;
  message += `Mohon diinfo total ongkir dan nomor rekening pembayarannya ya, terima kasih!`;
  
  return message;
}

/**
 * Get all orders for admin dashboard
 * @return {array} All orders sorted by date desc
 */
function getAllOrders() {
  const data = getSheetData(SHEETS.PESANAN);
  const orders = [];
  
  for (let i = 1; i < data.length; i++) {
    orders.push({
      orderID: data[i][COLUMNS.PESANAN.ORDER_ID],
      noWa: data[i][COLUMNS.PESANAN.NO_WA],
      tanggal: data[i][COLUMNS.PESANAN.TANGGAL],
      total: data[i][COLUMNS.PESANAN.TOTAL],
      status: data[i][COLUMNS.PESANAN.STATUS]
    });
  }
  
  return orders.reverse(); // Newest first
}

/**
 * Get order details untuk admin
 * @param {string} orderID - Order ID
 * @return {object} Order details
 */
function getOrderDetailsAdmin(orderID) {
  const order = getOrderByID(orderID);
  if (!order) return null;
  
  // Parse detail produk JSON
  let details = [];
  try {
    details = JSON.parse(order.detailProduk);
  } catch (e) {
    details = [];
  }
  
  return {
    ...order,
    detailProduk: details
  };
}
