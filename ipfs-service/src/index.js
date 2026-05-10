
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import ipfsRoutes from "./routes/ipfsRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { getIPFSClient } from "./config/ipfs.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
  }),
);
app.use(morgan("dev"));
app.use("/api/ipfs", ipfsRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "IPFS Image Storage Service",
    role: "Stores images from backend server after AI moderation, returns CIDs",
    endpoints: {
      health: "GET  /api/ipfs/health",
      store: "POST /api/ipfs/store       ← main endpoint",
      image: "GET  /api/ipfs/image/:cid",
      verify: "GET  /api/ipfs/verify/:cid",
      unpin: "DEL  /api/ipfs/unpin/:cid",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.path} does not exist.`,
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    await getIPFSClient();
    app.listen(PORT, () => {
      console.log(` Running on        : http://localhost:${PORT}`);
      console.log(
        `IPFS node         : ${process.env.IPFS_HOST}:${process.env.IPFS_PORT}`,
      );
      console.log(
        `Accepting from    : ${process.env.CORS_ORIGIN || "http://localhost:3000"}`,
      );
      console.log("\nAvailable endpoints:");
      console.log("  GET    /api/ipfs/health");
      console.log(
        "  POST   /api/ipfs/store        ← backend server calls this",
      );
      console.log("  GET    /api/ipfs/image/:cid");
      console.log("  GET    /api/ipfs/verify/:cid");
      console.log("  DELETE /api/ipfs/unpin/:cid\n");
    });
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
}

startServer();
