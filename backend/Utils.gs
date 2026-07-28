// ========================================
// File: Utils.gs
// Utility & Helper Functions
// ========================================

/**
 * Include HTML file content inside template (for Apps Script HTML Service)
 * @param {string} filename
 * @returns {string} File content
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Create standard JSON Output for Web App API
 * @param {Object} data
 * @returns {TextOutput}
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle CORS headers if needed by returning JSON output with headers
 * @param {Object} responseData
 * @returns {TextOutput}
 */
function createCorsJsonResponse(responseData) {
  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sanitize string input to prevent basic HTML injection
 * @param {string} str
 * @returns {string}
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
