const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  uploadImage,
  uploadReport,
  getReport,
  getImage,
  verifyCID,
  unpinContent,
  healthCheck,
} = require("../controllers/ipfsController");

//  HEALTH
router.get("/health", healthCheck);

//  UPLOAD IMAGE & REPORT
router.post("/upload-image", upload.single("image"), uploadImage);
router.post("/upload-report", express.json(), uploadReport);

// RETRIEVE
router.get("/report/:cid", getReport);
router.get("/image/:cid", getImage);

// UTILITY
// Verify a CID exists on IPFS before submitting to blockchain
router.post("/verify", express.json(), verifyCID);
// Remove pin from a CID
router.delete("/unpin/:cid", unpinContent);

module.exports = router;
