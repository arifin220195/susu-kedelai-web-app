// ========================================
// File: main.gs
// Main Entry Point & Web App Router (doGet & doPost)
// ========================================

/**
 * Handles HTTP GET requests
 * - If query parameter `action` exists, serves API JSON response.
 * - Otherwise serves HTML page (CustomerPortal by default or AdminPortal if page=admin).
 * 
 * @param {Object} e Request parameters
 * @returns {HtmlOutput|TextOutput}
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action;

    // API Route Handler for GET
    if (action) {
      return handleApiGetActions(action, params);
    }

    // Web UI Page Routing
    const page = params.page || "customer";
    let templateName = "CustomerPortal";
    let pageTitle = "Susu Kedelai Store - Varian Rasa & Komoditas";

    if (page === "admin") {
      templateName = "AdminPortal";
      pageTitle = "Admin Portal - Susu Kedelai Store";
    }

    // Check if HTML template exists (supports both root and frontend/ folder naming in Apps Script)
    try {
      let template;
      try {
        template = HtmlService.createTemplateFromFile(templateName);
      } catch (e1) {
        template = HtmlService.createTemplateFromFile("frontend/" + templateName);
      }

      template.page = page;
      template.params = params;

      return template.evaluate()
        .setTitle(pageTitle)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (err) {
      return HtmlService.createHtmlOutput(
        `<h2>Susu Kedelai Web App Error</h2>` +
        `<p>Gagal memuat template UI: ${err.toString()}</p>`
      );
    }
  } catch (err) {
    return createJsonResponse({ success: false, message: "Server Error: " + err.toString() });
  }
}

/**
 * Handles HTTP POST requests for API actions
 * 
 * @param {Object} e Request parameters & post body
 * @returns {TextOutput} JSON response
 */
function doPost(e) {
  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        postData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action || (e ? e.parameter.action : null);
    if (!action) {
      return createJsonResponse({ success: false, message: "Parameter 'action' diperlukan" });
    }

    return handleApiPostActions(action, postData);
  } catch (err) {
    return createJsonResponse({ success: false, message: "Server POST Error: " + err.toString() });
  }
}

/**
 * Route GET API actions
 */
function handleApiGetActions(action, params) {
  switch (action) {
    case "getProducts":
      return createJsonResponse({ success: true, data: getAllProducts() });

    case "getActiveProducts":
      return createJsonResponse({ success: true, data: getActiveProducts() });

    case "getProductBySku":
      return createJsonResponse({ success: true, data: getProductBySku(params.sku) });

    case "getOrders":
      return createJsonResponse({ success: true, data: getAllOrders() });

    case "getOrderById":
      return createJsonResponse({ success: true, data: getOrderById(params.orderId) });

    case "getCustomerOrders":
      return createJsonResponse({ success: true, data: getOrdersByCustomerPhone(params.phone) });

    case "getCustomers":
      return createJsonResponse({ success: true, data: getAllCustomers() });

    case "getCustomerByPhone":
      return createJsonResponse({ success: true, data: getCustomerByPhone(params.phone) });

    case "getDashboardSummary":
      return createJsonResponse(getDashboardSummary());

    case "getDailySalesReport":
      return createJsonResponse(getDailySalesReport(params.startDate, params.endDate));

    case "getBestSellingProducts":
      return createJsonResponse(getBestSellingProducts(Number(params.limit) || 5));

    default:
      return createJsonResponse({ success: false, message: `Action GET '${action}' tidak dikenal` });
  }
}

/**
 * Route POST API actions
 */
function handleApiPostActions(action, data) {
  switch (action) {
    // Auth & Customer Actions
    case "requestOtp":
      return createJsonResponse(requestOtp(data.phone));

    case "verifyOtp":
      return createJsonResponse(verifyOtp(data.phone, data.otp));

    case "registerCustomer":
      return createJsonResponse(registerCustomer(data));

    case "updateCustomerProfile":
      return createJsonResponse(updateCustomerProfile(data.phone, data));

    // Order Actions
    case "createOrder":
      return createJsonResponse(createOrder(data));

    case "updateOrderStatus":
      return createJsonResponse(updateOrderStatus(data.orderId, data.status, data.adminNotes));

    // Product Actions (Admin)
    case "createProduct":
      return createJsonResponse(createProduct(data));

    case "updateProduct":
      return createJsonResponse(updateProduct(data.sku, data));

    case "updateStock":
      return createJsonResponse(updateProductStock(data.sku, data.newStock));

    // Admin Auth
    case "adminLogin":
      if (data.password === ADMIN_PASSWORD) {
        return createJsonResponse({ success: true, token: "ADMIN_SESSION_TOKEN_VALID" });
      } else {
        return createJsonResponse({ success: false, message: "Password admin salah" });
      }

    default:
      return createJsonResponse({ success: false, message: `Action POST '${action}' tidak dikenal` });
  }
}
