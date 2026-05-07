const {
  uploadToIPFS,
  uploadJSONToIPFS,
  downloadFromIPFS,
  cidExists,
  unpinCID,
} = require("../utils/ipfsUtils");

const { moderateImage, moderateText } = require("../utils/moderationUtils");

//ENDPOINT 1: UPLOAD_IMAGE

// Uploads a single image to IPFS after AI moderation.

async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "NO_FILE",
        message: "No image file provided.",
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    // STEP 1: Run AI image moderation BEFORE storing on IPFS

    console.log(`[uploadImage] Running AI moderation for: ${originalname}`);
    const moderationResult = await moderateImage(buffer, mimetype);

    if (!moderationResult.safe) {
      return res.status(422).json({
        success: false,
        error: "CONTENT_REJECTED",
        message: "The image was rejected by the content moderation system.",
        moderation: {
          safe: false,
          reason: moderationResult.reason,
          confidence: moderationResult.confidence,
        },
      });
    }

    // STEP 2: Upload approved image to IPFS
    console.log(`[uploadImage] Uploading to IPFS: ${originalname} `);
    const { cid, size: ipfsSize } = await uploadToIPFS(buffer);

    console.log(`[uploadImage] Stored on IPFS. CID: ${cid}`);

    return res.status(201).json({
      success: true,
      cid,
      size: ipfsSize,
      originalSize: size,
      mimeType: mimetype,
      moderation: {
        safe: true,
        confidence: moderationResult.confidence,
        reason: moderationResult.reason,
        needsManualReview: moderationResult.needsManualReview || false,
      },
    });
  } catch (err) {
    next(err);
  }
}

//ENDPOINT 2: UPLOAD_REPORT

async function uploadReport(req, res, next) {
  try {
    const {
      title,
      description,
      category,
      location,
      imageCID,
      reporterPseudoId,
    } = req.body;

    // Basic required field checks (see validation middleware for full schema)
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: "MISSING_FIELDS",
        message: "Fields 'title' and 'description' are required.",
      });
    }

    // STEP 1: AI text moderation
    const textToModerate = `${title}\n\n${description}`;
    console.log(`[uploadReport] Running text moderation...`);
    const textModeration = await moderateText(textToModerate);

    if (!textModeration.safe) {
      return res.status(422).json({
        success: false,
        error: "CONTENT_REJECTED",
        message: "The report text was rejected by content moderation.",
        moderation: {
          safe: false,
          reason: textModeration.reason,
          categories: textModeration.categories,
        },
      });
    }

    // STEP 2: If imageCID is provided, verify it actually exists on IPFS

    if (imageCID) {
      console.log(`[uploadReport] Verifying imageCID exists: ${imageCID}`);
      const exists = await cidExists(imageCID);
      if (!exists) {
        return res.status(400).json({
          success: false,
          error: "INVALID_IMAGE_CID",
          message: `The provided imageCID '${imageCID}' was not found on IPFS.`,
        });
      }
    }

    // STEP 3: Build the metadata object and upload to IPFS

    const reportMetadata = {
      version: "1.0",
      title: title.trim(),
      description: description.trim(),
      category: category || "general",
      location: location || null,
      imageCID: imageCID || null,
      reporterPseudoId: reporterPseudoId || null,
      submittedAt: new Date().toISOString(),
      moderation: {
        textSafe: true,
        textConfidence: textModeration.confidence,
        needsManualReview: textModeration.needsManualReview || false,
      },
    };

    console.log(`[uploadReport] Uploading metadata to IPFS...`);
    const { cid: metadataCID, size } = await uploadJSONToIPFS(reportMetadata);

    console.log(`[uploadReport] Metadata stored. CID: ${metadataCID}`);

    // STEP 4: Return the metadataCID to the DApp.

    return res.status(201).json({
      success: true,
      metadataCID,
      imageCID: imageCID || null,
      size,
      submittedAt: reportMetadata.submittedAt,
      moderation: {
        safe: true,
        textConfidence: textModeration.confidence,
        needsManualReview: textModeration.needsManualReview || false,
      },
    });
  } catch (err) {
    next(err);
  }
}
//ENDPOINT 3: GET_REPORT

async function getReport(req, res, next) {
  try {
    const { cid } = req.params;

    if (!cid || cid.length < 10) {
      return res.status(400).json({
        success: false,
        error: "INVALID_CID",
        message: "Provide a valid IPFS CID.",
      });
    }

    const buffer = await downloadFromIPFS(cid);

    // Parse the JSON metadata we stored
    let reportData;
    try {
      reportData = JSON.parse(buffer.toString("utf-8"));
    } catch {
      return res.status(422).json({
        success: false,
        error: "NOT_JSON",
        message: "The content at this CID is not valid.",
      });
    }

    return res.status(200).json({
      success: true,
      cid,
      data: reportData,
    });
  } catch (err) {
    if (
      err.message &&
      (err.message.includes("not found") || err.message.includes("no link"))
    ) {
      return res.status(404).json({
        success: false,
        error: "CID_NOT_FOUND",
        message: `No content found for CID: ${req.params.cid}`,
      });
    }
    next(err);
  }
}
//ENDPOINT 4: GET_IMAGE

async function getImage(req, res, next) {
  try {
    const { cid } = req.params;

    if (!cid || cid.length < 10) {
      return res.status(400).json({
        success: false,
        error: "INVALID_CID",
        message: "Provide a valid IPFS CID.",
      });
    }

    console.log(`[getImage] Fetching image CID: ${cid}`);
    const buffer = await downloadFromIPFS(cid);
    const mimeType = detectMimeType(buffer);

    res.set("Content-Type", mimeType);
    res.set("Content-Length", buffer.length);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    return res.status(200).send(buffer);
  } catch (err) {
    if (err.message && err.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: "IMAGE_NOT_FOUND",
        message: `No image found for CID: ${req.params.cid}`,
      });
    }
    next(err);
  }
}
//ENDPOINT 5: GET_VERIFY
// Verifies that a CID exists and is accessible on IPFS.

async function verifyCID(req, res, next) {
  try {
    const { cid } = req.body;

    if (!cid) {
      return res.status(400).json({
        success: false,
        error: "MISSING_CID",
        message: "Provide a 'cid' field in the request body.",
      });
    }

    const exists = await cidExists(cid);

    return res.status(200).json({
      success: true,
      cid,
      exists,
      message: exists
        ? "CID is accessible on IPFS."
        : "CID not found. It may not have propagated yet.",
    });
  } catch (err) {
    next(err);
  }
}

//ENDPOINT 6: UNPINGS A CID
async function unpinContent(req, res, next) {
  try {
    const { cid } = req.params;

    if (!cid) {
      return res.status(400).json({
        success: false,
        error: "MISSING_CID",
        message: "Provide a CID in the URL: /api/ipfs/unpin/:cid",
      });
    }

    await unpinCID(cid);
    console.log(`[unpinContent] Unpinned CID: ${cid}`);

    return res.status(200).json({
      success: true,
      cid,
      message:
        "CID unpinned. The content may be garbage-collected in the future.",
    });
  } catch (err) {
    next(err);
  }
}
//ENDPOINT 7: HELTH CHECK
// The DApp can call this to verify the service is up before uploads.

async function healthCheck(req, res, next) {
  try {
    const { getIPFSClient } = require("../config/ipfs");
    const ipfs = await getIPFSClient();
    const version = await ipfs.version();

    return res.status(200).json({
      success: true,
      status: "healthy",
      ipfs: {
        connected: true,
        version: version.version,
        node: `${process.env.IPFS_HOST}:${process.env.IPFS_PORT}`,
      },
      aiModeration: {
        enabled: process.env.AI_MODERATION_ENABLED !== "false",
        url: process.env.AI_MODERATION_URL,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      status: "unhealthy",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

function detectMimeType(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "image/png";
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return "image/gif";
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return "image/webp";
  return "application/octet-stream";
}

module.exports = {
  uploadImage,
  uploadReport,
  getReport,
  getImage,
  verifyCID,
  unpinContent,
  healthCheck,
};
