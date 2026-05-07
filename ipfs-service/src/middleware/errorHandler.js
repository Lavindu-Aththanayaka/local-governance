// src/middleware/errorHandler.js
// =============================================
// CENTRALIZED ERROR HANDLER
// =============================================
// Express catches errors passed to next(err) and routes them here.
// Having one place to handle errors means:
//   - Consistent JSON error format for the DApp to parse
//   - No stack traces leaking to production clients
//   - Easy to add logging later (e.g., Sentry)

function errorHandler(err, req, res, next) {
  // Log the full error server-side for debugging
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Multer-specific errors (file too large, wrong type, etc.)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      error: "FILE_TOO_LARGE",
      message: `File exceeds the maximum allowed size of ${process.env.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      error: "UNEXPECTED_FILE_FIELD",
      message: "Unexpected file field in upload. Use the field name 'image'.",
    });
  }

  // Generic multer/file errors
  if (err.message && err.message.includes("not allowed")) {
    return res.status(415).json({
      success: false,
      error: "UNSUPPORTED_MEDIA_TYPE",
      message: err.message,
    });
  }

  // Validation errors (from Joi)
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: "VALIDATION_ERROR",
      message: err.details.map((d) => d.message).join("; "),
    });
  }

  // IPFS connection errors
  if (err.message && err.message.includes("ECONNREFUSED")) {
    return res.status(503).json({
      success: false,
      error: "IPFS_UNAVAILABLE",
      message:
        "Cannot connect to IPFS node. Make sure the IPFS daemon is running.",
    });
  }

  // Default: 500 Internal Server Error
  return res.status(err.status || 500).json({
    success: false,
    error: "INTERNAL_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred."
        : err.message,
  });
}

module.exports = errorHandler;
