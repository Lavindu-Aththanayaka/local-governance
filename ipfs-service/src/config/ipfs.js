const { create } = require("kubo-rpc-client");
require("dotenv").config();

let ipfsClient = null;

async function getIPFSClient() {
  if (ipfsClient) return ipfsClient;

  ipfsClient = create({
    host: process.env.IPFS_HOST || "127.0.0.1",
    port: parseInt(process.env.IPFS_PORT) || 5001,
    protocol: process.env.IPFS_PROTOCOL || "http",
  });

  // Test the connection
  try {
    const version = await ipfsClient.version();
    console.log(`Connected to IPFS node. Version: ${version.version}`);
  } catch (err) {
    console.error("Failed to connect to IPFS node:", err.message);
    throw err;
  }

  return ipfsClient;
}

module.exports = { getIPFSClient };
