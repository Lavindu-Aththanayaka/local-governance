import express from "express";
import upload from "../middleware/upload.js";
import {
  storeImage,
  getImage,
  storeText,
  getText,
  updateText,
  verifyCID,
  unpinContent,
  healthCheck,
} from "../controllers/ipfsController.js";

const router = express.Router();

router.get("/health", healthCheck);

// ── Image ────────────────────────────────────
router.post("/image/store", upload.single("image"), storeImage);
router.get("/image/:cid", getImage);

// ── Text ─────────────────────────────────────
router.post("/text/store", storeText);
router.get("/text/:cid", getText);
router.put("/text/:cid", updateText);

router.get("/verify/:cid", verifyCID);
router.delete("/unpin/:cid", unpinContent);

export default router;
