// ========================================
// File: Auth.gs
// Authentication & Session Management
// ========================================

/**
 * Register customer baru
 * @param {string} name - Nama lengkap
 * @param {string} phone - Nomor WhatsApp (format 08xxx atau 62xxx)
 * @param {string} address - Alamat pengiriman
 * @return {object} Result object
 */
function registerCustomer(name, phone, address) {
  logActivity(`Register attempt: ${name}, ${phone}`);
  
  // Validate input
  if (!name || !phone || !address) {
    return {
      success: false,
      message: "Semua field wajib diisi"
    };
  }
  
  // Validate phone
  const validatedPhone = validatePhoneNumber(phone);
  if (!validatedPhone) {
    return {
      success: false,
      message: "Nomor WhatsApp tidak valid"
    };
  }
  
  // Check if already registered
  const existing = getCustomerByPhone(validatedPhone);
  if (existing) {
    return {
      success: false,
      message: "Nomor WhatsApp sudah terdaftar"
    };
  }
  
  // Lock service untuk prevent race condition
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // 10 second timeout
  
  try {
    // Double check setelah lock
    const existing2 = getCustomerByPhone(validatedPhone);
    if (existing2) {
      return {
        success: false,
        message: "Nomor WhatsApp sudah terdaftar"
      };
    }
    
    // Extract kota dan provinsi dari address (basic parsing)
    const addressParts = address.split(",");
    const fullAddress = address.trim();
    const kota = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : "";
    const provinsi = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : "";
    
    // Add customer
    const customerID = addNewCustomer(
      validatedPhone,
      name,
      "",
      fullAddress,
      kota,
      provinsi,
      ""
    );
    
    // Generate session token
    const sessionToken = generateSessionToken(validatedPhone);
    
    logActivity(`Registration success: ${customerID}`);
    
    return {
      success: true,
      customerID: customerID,
      name: name,
      phone: validatedPhone,
      message: "Registrasi berhasil",
      sessionToken: sessionToken
    };
  } catch (e) {
    logActivity(`Register error: ${e.toString()}`);
    return {
      success: false,
      message: "Terjadi kesalahan: " + e.toString()
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Login customer
 * @param {string} phone - Nomor WhatsApp
 * @return {object} Result object
 */
function loginCustomer(phone) {
  logActivity(`Login attempt: ${phone}`);
  
  if (!phone) {
    return {
      success: false,
      message: "Nomor WhatsApp wajib diisi"
    };
  }
  
  // Validate phone
  const validatedPhone = validatePhoneNumber(phone);
  if (!validatedPhone) {
    return {
      success: false,
      message: "Nomor WhatsApp tidak valid"
    };
  }
  
  // Get customer
  const customer = getCustomerByPhone(validatedPhone);
  if (!customer) {
    return {
      success: false,
      message: "Nomor belum terdaftar. Silakan registrasi terlebih dahulu.",
      isNewCustomer: true
    };
  }
  
  // Generate session token
  const sessionToken = generateSessionToken(validatedPhone);
  
  logActivity(`Login success: ${customer.customerID}`);
  
  return {
    success: true,
    customerID: customer.customerID,
    name: customer.nama,
    phone: validatedPhone,
    address: customer.alamat,
    email: customer.email,
    sessionToken: sessionToken,
    totalOrders: customer.totalPembelian
  };
}

/**
 * Validate admin password
 * @param {string} password - Password attempt
 * @return {object} Result object
 */
function validateAdminLogin(password) {
  logActivity(`Admin login attempt`);
  
  if (!password) {
    return {
      success: false,
      message: "Password wajib diisi"
    };
  }
  
  // Simple validation (TODO: improve with proper hashing)
  const actualPassword = getConfig("ADMIN_PASSWORD_HASH") || ADMIN_PASSWORD;
  
  if (password === actualPassword) {
    const sessionToken = generateSessionToken("admin-" + new Date().getTime());
    logActivity(`Admin login success`);
    return {
      success: true,
      message: "Login admin berhasil",
      sessionToken: sessionToken,
      isAdmin: true
    };
  }
  
  logActivity(`Admin login failed`);
  return {
    success: false,
    message: "Password salah"
  };
}

/**
 * Validate session token (basic check)
 * @param {string} sessionToken - Token to validate
 * @return {boolean} Valid or not
 */
function validateSessionToken(sessionToken) {
  // Basic validation - dalam produksi, gunakan proper JWT atau session storage
  return sessionToken && sessionToken.length > 0;
}
