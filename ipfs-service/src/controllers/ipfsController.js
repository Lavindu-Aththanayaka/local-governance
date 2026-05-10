
import { getIPFSClient } from "../config/ipfs.js";

async function storeImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "NO_IMAGE",
        message:
          "No image received. Send multipart/form-data with field name 'image'.",
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    console.log(
      `[storeImage] Received image: ${originalname} | Type: ${mimetype} | Size: ${size} bytes`,
    );

    const ipfs = await getIPFSClient();
    const result = await ipfs.add(buffer, {
      pin: true,
      cidVersion: 1,
    });

    const cid = result.cid.toString();

    console.log(`[storeImage] Image stored on IPFS. CID: ${cid}`);

    return res.status(201).json({
      success: true,
      cid,
      size: result.size,
      mimeType: mimetype,
    });
  } catch (err) {
    next(err);
  }
}

async function getImage(req, res, next) {
  try {
    const { cid } = req.params;

    if (!cid || cid.length < 10) {
      return res.status(400).json({
        success: false,
        error: "INVALID_CID",
        message: "Provide a valid CID in the URL: /api/ipfs/image/:cid",
      });
    }

    console.log(`[getImage] Fetching image with CID: ${cid}`);

    const ipfs = await getIPFSClient();
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const mimeType = detectMimeType(buffer);

    res.set("Content-Type", mimeType);
    res.set("Content-Length", buffer.length);

    res.set("Cache-Control", "public, max-age=31536000, immutable");

    return res.status(200).send(buffer);
  } catch (err) {
    if (
      err.message &&
      (err.message.includes("not found") || err.message.includes("no link"))
    ) {
      return res.status(404).json({
        success: false,
        error: "IMAGE_NOT_FOUND",
        message: `No image found for CID: ${req.params.cid}`,
      });
    }
    next(err);
  }
}

async function verifyCID(req, res, next) {
  try {
    const { cid } = req.params;

    if (!cid || cid.length < 10) {
      return res.status(400).json({
        success: false,
        error: "INVALID_CID",
        message: "Provide a valid CID: /api/ipfs/verify/:cid",
      });
    }

    const ipfs = await getIPFSClient();
    let exists = false;

    try {
      await ipfs.files.stat(`/ipfs/${cid}`);
      exists = true;
    } catch {
      exists = false;
    }

    return res.status(200).json({
      success: true,
      cid,
      exists,
      message: exists
        ? "CID is accessible on IPFS."
        : "CID not found on this IPFS node.",
    });
  } catch (err) {
    next(err);
  }
}

async function unpinImage(req, res, next) {
  try {
    const { cid } = req.params;

    if (!cid) {
      return res.status(400).json({
        success: false,
        error: "MISSING_CID",
        message: "Provide a CID: /api/ipfs/unpin/:cid",
      });
    }

    const ipfs = await getIPFSClient();
    await ipfs.pin.rm(cid);

    console.log(`[unpinImage] Unpinned CID: ${cid}`);

    return res.status(200).json({
      success: true,
      cid,
      message:
        "Image unpinned. It will be removed by garbage collection in the future.",
    });
  } catch (err) {
    next(err);
  }
}

async function healthCheck(req, res, next) {
  try {
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


export {
  storeImage,
  getImage,
  verifyCID,
  unpinImage,
  healthCheck,
};
