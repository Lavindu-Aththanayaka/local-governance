
import express from "express";
import upload from "../middleware/upload.js";
import {
  storeImage,
  getImage,
  verifyCID,
  unpinImage,
  healthCheck,
} from "../controllers/ipfsController.js";

const router = express.Router();

router.get("/health", healthCheck);
router.post("/store", upload.single("image"), storeImage);
router.get("/image/:cid", getImage);
router.get("/verify/:cid", verifyCID);
router.delete("/unpin/:cid", unpinImage);

export default router;
