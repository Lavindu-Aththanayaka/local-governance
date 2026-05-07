require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const ipfsRoutes = require("./routes/ipfsRoutes");
const errorHandler = require("./middleware/errorHandler");
const { getIPFSClient } = require("./config/ipfs");

const app = express();
const PORT = process.env.PORT || 5001;

//  SECURITY MIDDLEWARE

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//  RATE LIMITING

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please wait 15 minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

//  LOGGING

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

//  ROUTES

app.use("/api/ipfs", ipfsRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "IPFS Off-Chain Storage Service",
    project: "Blockchain-Based Civic Reporting System",
    version: "1.0.0",
    endpoints: "/api/ipfs/health",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

// GLOBAL ERROR HANDLER

app.use(errorHandler);

// STARTUP
async function startServer() {
  try {
    await getIPFSClient();

    app.listen(PORT, () => {
      console.log("IPFS Service for Civic Reporting DApp");
      console.log(`\nServer is running on ${PORT}`);
      console.log(
        `IPFS node: ${process.env.IPFS_HOST}:${process.env.IPFS_PORT}`,
      );
      console.log(
        `AI moderation: ${process.env.AI_MODERATION_ENABLED !== "false" ? "ENABLED" : "DISABLED"}`,
      );
      console.log(
        `CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`,
      );
      console.log("\nEndpoints:");
      console.log("  GET  /api/ipfs/health");
      console.log("  POST /api/ipfs/upload-image");
      console.log("  POST /api/ipfs/upload-report");
      console.log("  GET  /api/ipfs/report/:cid");
      console.log("  GET  /api/ipfs/image/:cid");
      console.log("  POST /api/ipfs/verify");
      console.log("  DEL  /api/ipfs/unpin/:cid\n");
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
