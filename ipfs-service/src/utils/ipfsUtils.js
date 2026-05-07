const { getIPFSClient } = require("../config/ipfs");

/**
 * @param {Buffer} buffer
 * @param {Object} [options]
 * @param {boolean} [options.pin=true]
 * @returns {Promise<{cid: string, size: number}>}
 */
async function uploadToIPFS(buffer, options = {}) {
  const ipfs = await getIPFSClient();

  const result = await ipfs.add(buffer, {
    pin: options.pin !== false,
    cidVersion: 1,
  });

  return {
    cid: result.cid.toString(),
    size: result.size,
  };
}

/**
 * @param {Object} jsonData
 * @returns {Promise<{cid: string, size: number}>}
 */
async function uploadJSONToIPFS(jsonData) {
  const buffer = Buffer.from(JSON.stringify(jsonData, null, 2));
  return uploadToIPFS(buffer);
}
/**
 * @param {string} cid
 * @returns {Promise<Buffer>}
 */
async function downloadFromIPFS(cid) {
  const ipfs = await getIPFSClient();

  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * @param {string} cid
 * @returns {Promise<boolean>}
 */
async function cidExists(cid) {
  try {
    const ipfs = await getIPFSClient();
    await ipfs.files.stat(`/ipfs/${cid}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} cid
 */
async function pinCID(cid) {
  const ipfs = await getIPFSClient();
  await ipfs.pin.add(cid);
}

/**
 * @param {string} cid
 */
async function unpinCID(cid) {
  const ipfs = await getIPFSClient();
  await ipfs.pin.rm(cid);
}

module.exports = {
  uploadToIPFS,
  uploadJSONToIPFS,
  downloadFromIPFS,
  cidExists,
  pinCID,
  unpinCID,
};
