## What This Service Does

User (DApp) → IPFS Service → AI Moderation → IPFS Node → returns CID
↓
DApp sends CID to → Smart Contract (on-chain)

````


## Setup Guide

### Step 1: Install IPFS (Kubo)

Download from https://dist.ipfs.tech/#kubo (choose your OS)

```bash
# Initialize IPFS (first time only)
ipfs init

# Start the IPFS daemon (run this in a separate terminal)
ipfs daemon
````

You should see: `Daemon is ready`

The IPFS HTTP API is now at: `http://127.0.0.1:5001`  
The IPFS Gateway (for viewing files in browser) is at: `http://127.0.0.1:8080`

> **Fix CORS for local development** (run once):
>
> ```bash
> ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://localhost:5001"]'
> ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
> ```

---

### Step 2: Install This Service

```bash
cd ipfs-service
npm install
```

---

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` — the key settings to change:

| Variable                | Description                  | Default                 |
| ----------------------- | ---------------------------- | ----------------------- |
| `PORT`                  | Port this service listens on | `5001`                  |
| `IPFS_HOST`             | IPFS daemon host             | `127.0.0.1`             |
| `IPFS_PORT`             | IPFS daemon API port         | `5001`                  |
| `AI_MODERATION_ENABLED` | Set `false` during dev       | `true`                  |
| `AI_MODERATION_URL`     | URL of AI service            | `http://localhost:5002` |
| `CORS_ORIGIN`           | Your DApp's URL              | `http://localhost:3000` |

> ⚠️ Change the IPFS service PORT to avoid conflict with the IPFS daemon if both run on the same machine. Set `PORT=4000` in .env.

---

### Step 4: Start the Service

```bash
# Development (auto-restarts on code changes)
npm run dev

# Production
npm start
```

You should see:

```
✅ Connected to IPFS node. Version: 0.22.0
🚀 Server running on http://localhost:4000
```

---

### Step 5: Test All Endpoints

```bash
npm test
```

Or test manually with curl:

```bash
# Health check
curl http://localhost:4000/api/ipfs/health

# Upload image
curl -X POST http://localhost:4000/api/ipfs/upload-image \
  -F "image=@/path/to/photo.jpg"

# Upload report (text-only)
curl -X POST http://localhost:4000/api/ipfs/upload-report \
  -H "Content-Type: application/json" \
  -d '{"title":"Broken streetlight","description":"Near bus stop on Main St","category":"streetlight","reporterPseudoId":"usr_001"}'
```

---

## All API Endpoints

### `GET /api/ipfs/health`

Check if service and IPFS node are running.

**Response:**

```json
{
  "success": true,
  "status": "healthy",
  "ipfs": { "connected": true, "version": "0.22.0" }
}
```

---

### `POST /api/ipfs/upload-image`

Upload an image with AI moderation. Call this **first** if your report has a photo.

**Request:** `multipart/form-data` with field `image`  
**Response:**

```json
{
  "success": true,
  "cid": "bafybeigdyrzt5...",
  "size": 52428,
  "moderation": { "safe": true, "confidence": 0.98 }
}
```

Use the returned `cid` as `imageCID` in the next call.

---

### `POST /api/ipfs/upload-report`

Upload report metadata JSON with AI text moderation.  
**This CID is what goes on the blockchain.**

**Request body:**

```json
{
  "title": "Broken streetlight near bus stop",
  "description": "The streetlight on Main St has been broken for 2 weeks. It is dangerous at night.",
  "category": "streetlight",
  "location": { "lat": 6.0535, "lng": 80.221, "address": "Main St, Galle" },
  "imageCID": "bafybeigdyrzt5...",
  "reporterPseudoId": "usr_abc123"
}
```

**Response:**

```json
{
  "success": true,
  "metadataCID": "bafybeihykgkqam...",
  "imageCID": "bafybeigdyrzt5...",
  "nextStep": "Submit metadataCID to the smart contract's submitReport() function"
}
```

---

### `GET /api/ipfs/report/:cid`

Retrieve report JSON from IPFS (after reading CID from blockchain).

```
GET /api/ipfs/report/bafybeihykgkqam...
```

**Response:**

```json
{
  "success": true,
  "cid": "bafybeihykgkqam...",
  "data": {
    "title": "Broken streetlight near bus stop",
    "description": "...",
    "category": "streetlight",
    "imageCID": "bafybeigdyrzt5...",
    "submittedAt": "2026-02-18T10:30:00Z"
  }
}
```

---

### `GET /api/ipfs/image/:cid`

Get raw image bytes. Use as an `<img>` src in your DApp.

```html
<img src="http://localhost:4000/api/ipfs/image/bafybeigdyrzt5..." />
```

---

### `POST /api/ipfs/verify`

Check that a CID exists before submitting to blockchain.

**Request:** `{ "cid": "bafybeigdyrzt5..." }`  
**Response:** `{ "success": true, "exists": true }`

---

### `DELETE /api/ipfs/unpin/:cid`

Remove a file pin (for rejected/test content). Add admin auth before production use.

---

## Complete DApp Flow (How Everything Connects)

```
1. User fills report form + selects photo in DApp
        │
2. DApp calls POST /api/ipfs/upload-image
        │ AI checks image ✓
        │ Returns: imageCID
        │
3. DApp calls POST /api/ipfs/upload-report
        │ AI checks text ✓
        │ Stores JSON metadata on IPFS
        │ Returns: metadataCID
        │
4. DApp calls smart contract: submitReport(metadataCID)
        │ User signs with their wallet (MetaMask)
        │ Transaction recorded on blockchain
        │ Returns: reportId, txHash
        │
5. Anyone can verify report:
        └─ Read metadataCID from blockchain (getReport(reportId))
           Call GET /api/ipfs/report/{metadataCID}
           Call GET /api/ipfs/image/{imageCID}
           ✓ Data integrity proven: CID = hash of content
```

---

## Connecting to Your Blockchain (When Ready)

1. Deploy your Solidity contract with Hardhat/Truffle
2. Copy the contract address to `.env`:  
   `REPORTING_CONTRACT_ADDRESS=0xYourContractAddress`
3. Copy the compiled ABI to `blockchainUtils.js`
4. Uncomment the ethers.js code blocks in `blockchainUtils.js`
5. In the DApp frontend, copy `dapp-integration-example/ipfsService.js` and fill in:
   - `REACT_APP_IPFS_SERVICE_URL` in your `.env`
   - `REACT_APP_CONTRACT_ADDRESS` in your `.env`
   - The contract ABI in `submitToBlockchain()`

---

## AI Moderation Integration (When Ready)

Your AI service needs to expose:

- `POST /moderate/image` — accepts `multipart/form-data` with `image` field  
  Returns: `{ "safe": boolean, "confidence": float, "reason": string }`

- `POST /moderate/text` — accepts `{ "text": string }`  
  Returns: `{ "safe": boolean, "confidence": float, "categories": string[] }`

During development with `AI_MODERATION_ENABLED=false`, all content passes automatically.

---

## Team Member Responsibilities

| Component                 | File(s)                                        |
| ------------------------- | ---------------------------------------------- |
| IPFS storage (your part)  | `ipfsUtils.js`, `ipfsController.js`, `ipfs.js` |
| AI moderation integration | `moderationUtils.js`                           |
| Blockchain integration    | `blockchainUtils.js`                           |
| DApp frontend             | `dapp-integration-example/ipfsService.js`      |
| Smart contracts           | Separate Hardhat/Truffle project               |
