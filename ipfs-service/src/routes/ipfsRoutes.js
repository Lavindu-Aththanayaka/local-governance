const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  storeImage,
  getImage,
  verifyCID,
  unpinImage,
  healthCheck,
} = require("../controllers/ipfsController");

router.get("/health", healthCheck);

router.post("/store", upload.single("image"), storeImage);

router.get("/image/:cid", getImage);

router.get("/verify/:cid", verifyCID);

router.delete("/unpin/:cid", unpinImage);

module.exports = router;
